const sqlite3 = require('sqlite3')

class Database {
  constructor (filename) {
    this.db = new sqlite3.Database(filename)
  }

  init (callback) {
    this.db.all(
      `create table nbook (
         id integer primary key,
         name text,
         email text,
         phone text,
         country text
       )`, callback)
  }

  search (str, callback) {
    this.db.all('select * from nbook', (err, result) => {
      if (err) {
        if (err.errno === 1) {
          this.init((err) => {
            if (err) {
              return callback(err)
            }

            this.search(str, callback)
          })

          return
        }

        return callback(err)
      }

      callback(null, result)
    })
  }

  get (id, callback) {
    this.db.all('select * from nbook where id = ?', [ id ], (err, result) => {
      if (err) {
        if (err.errno === 1) {
          this.init((err) => {
            if (err) {
              return callback(err)
            }

            this.get(id, callback)
          })

          return
        }

        return callback(err)
      }

      callback(null, result.length ? result[0] : null)
    })
  }

  set (id, data, callback) {
    if (!id) {
      this.insert(data, callback)
    }

    let cols = []
    let param = []

    // TODO: check validity of row name
    for (var k in data) {
      cols.push(k + ' = ?')
      param.push(data[k])
    }
    param.push(id)

    this.db.run('update nbook set ' + cols.join(', ') + ' where id = ?', param, (err, result) => {
      if (err) {
        if (err.errno === 1) {
          this.init((err) => {
            if (err) {
              return callback(err)
            }

            this.set(id, data, callback)
          })

          return
        }

        return callback(err)
      }

      callback(null)
    })
  }

  insert (data, callback) {
    let cols = []
    let param = []
    let values = []

    // TODO: check validity of row name
    for (var k in data) {
      cols.push(k)
      values.push('?')
      param.push(data[k])
    }

    let that = this // hack, so we can get the lastId of the query
    this.db.run(
      'insert into nbook (' + cols.join(', ') + ') values (' + values.join(', ') + ')',
      param,
      function (err) {
        if (err) {
          if (err.errno === 1) {
            that.init((err) => {
              if (err) {
                return callback(err)
              }

              that.insert(data, callback)
            })

            return
          }

          return callback(err)
        }

        callback(null, this.lastID)
      }
    )
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
