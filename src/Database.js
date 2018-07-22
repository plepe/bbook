const async = require('async')
const sqlite3 = require('sqlite3')

class Database {
  constructor (filename) {
    this.db = new sqlite3.Database(filename)
    this.highestId = null
  }

  init (callback) {
    this.db.run('select 1 from nbook', (err, result) => {
      if (err) {
        return this.db.all(
          `create table nbook (
             id integer not null,
             key varchar(30) not null,
             value text,
             primary key (id, key)
           )`, callback)
      }

      callback()
    })
  }

  search (str, callback) {
    let result = {}

    this.db.each('select * from nbook', (err, r) => {
      if (err) {
        return callback(err)
      }

      if (!(r.id in result)) {
        result[r.id] = { id: r.id }
      }

      result[r.id][r.key] = r.value
    }, (err) => {
      callback(err, Object.values(result))
    })
  }

  get (id, callback) {
    let result = null

    this.db.each('select * from nbook where id = ?', [ id ], (err, r) => {
      if (err) {
        return callback(err)
      }

      if (result === null) {
        result = { id: r.id }
      }

      result[r.key] = r.value
    }, (err) => {
      callback(err, result)
    })
  }

  set (id, data, callback) {
    if (!id) {
      return this.insert(data, callback)
    }

    async.eachOf(data,
      (value, key, callback) => {
        if (value === null) {
          this.db.run('delete from nbook where id=? and key=?', [ id, key ], callback)
        } else {
          this.db.run('insert or replace into nbook(id, key, value) values (?, ?, ?)', [ id, key, value ], callback)
        }
      },
      (err) => {
        callback(err, id)
      }
    )
  }

  insert (data, callback) {
    let id = null

    this.db.all('select max(id) as id from nbook', (err, result) => {
      if (err) {
        return callback(err)
      }

      if (result[0].id === null) {
        id = 1
      } else {
        id = result[0].id + 1
      }

      if (id <= this.highestId) {
        id = this.highestId + 1
      }

      this.highestId = id

      this.set(id, data, callback)
    })
  }

  remove (id, callback) {
    this.db.run('delete from nbook where id = ?', id, (err, result) => {
      if (err) {
        return callback(err)
      }

      callback(null)
    })
  }
}

module.exports = Database
