const async = require('async')
const sqlite3 = require('sqlite3')
const Sqlite3TransactionDatabase = require("sqlite3-transactions").TransactionDatabase

class Database {
  constructor (filename) {
    this.db = new Sqlite3TransactionDatabase(
      new sqlite3.Database(filename, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)
    )
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

  beginTransaction (callback) {
    return this.db.beginTransaction(callback)
  }

  search (str, callback, transaction) {
    if (!transaction) {
      return this.beginTransaction((err, t) => {
        if (err) {
          return callback(err)
        }

        this.search(str, (err, result) => {
          if (err) {
            return callback(err)
          }

          t.commit((err) => {
            callback(err, result)
          })
        }, t)
      })
    }

    if (str !== '') {
      return transaction.all(
        'select id from nbook where value like ? group by id', '%' + str + '%',
        (err, result) => {
          if (err) {
            return callback(err)
          }

          async.map(
            result,
            (entry, callback) => this.get(entry.id, callback, transaction),
            (err, result) => callback(err, result)
          )
        }
      )
    }

    let result = {}

    transaction.each('select * from nbook', (err, r) => {
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

  get (id, callback, transaction) {
    if (!transaction) {
      return this.beginTransaction((err, t) => {
        if (err) {
          return callback(err)
        }

        this.get(id, (err, result) => {
          if (err) {
            return callback(err)
          }

          t.commit((err) => {
            callback(err, result)
          })
        }, t)
      })
    }

    let result = null

    transaction.each('select * from nbook where id = ?', [ id ], (err, r) => {
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

  set (id, data, callback, transaction) {
    if (!transaction) {
      return this.beginTransaction((err, t) => {
        if (err) {
          return callback(err)
        }

        this.set(id, data, (err, result) => {
          if (err) {
            return callback(err)
          }

          t.commit((err) => {
            callback(err, result)
          })
        }, t)
      })
    }

    if (!id) {
      return this.insert(data, callback, transaction)
    }

    async.eachOf(data,
      (value, key, callback) => {
        if (value === null) {
          transaction.run('delete from nbook where id=? and key=?', [ id, key ], callback)
        } else {
          transaction.run('insert or replace into nbook(id, key, value) values (?, ?, ?)', [ id, key, value ], callback)
        }
      },
      (err) => {
        callback(err, id)
      }
    )
  }

  insert (data, callback, transaction) {
    if (!transaction) {
      return this.beginTransaction((err, t) => {
        if (err) {
          return callback(err)
        }

        this.insert(data, (err, result) => {
          if (err) {
            return callback(err)
          }

          t.commit((err) => {
            callback(err, result)
          })
        }, t)
      })
    }

    let id = null

    transaction.all('select max(id) as id from nbook', (err, result) => {
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

      this.set(id, data, callback, transaction)
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
