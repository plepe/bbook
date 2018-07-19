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
}

module.exports = Database
