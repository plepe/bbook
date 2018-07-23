const async = require('async')

let types = {
  json: function typeJSON (data) {
    data = JSON.parse(data)
    data.forEach(entry => {
      delete entry.id
    })

    return data
  },
  abook: function typeAbook (data) {
    let result = []
    let current = null

    data.split(/\r?\n/).forEach(row => {
      let m1 = row.match(/^\[(.*)\]$/)
      let m2 = row.match(/^([\w\d]+)=(.*)$/)

      if (m1) {
        if (m1[1] !== 'format') {
          if (current !== null) {
            result.push(current)
          }
          current = {}
        }
      } else if (m2) {
        if (current !== null) {
          current[m2[1]] = m2[2]
        }
      }
    })

    if (current !== null) {
      result.push(current)
    }

    return result
  }
}

function fileImport (data, options, callback) {
  let importedData = types[options.type](data)
  options.db.beginTransaction((err, transaction) => {
    if (err) {
      return callback(err)
    }

    async.each(importedData,
      (entry, callback) => {
        options.db.insert(entry, callback, transaction)
      },
      (err) => {
        if (err) {
          return callback(err)
        }

        transaction.commit((err) => {
          callback(err)
        })
      }
    )
  })
}

module.exports = fileImport
