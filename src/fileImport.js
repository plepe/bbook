const async = require('async')

let types = {
  json: function typeJSON (data) {
    data = JSON.parse(data)
    data.forEach(entry => {
      delete entry.id
    })

    return data
  }
}

function fileImport (data, options, callback) {
  let importedData = types[options.type](data)

  async.each(importedData,
    (entry, callback) => {
      options.db.insert(entry, callback)
      debug(entry)
    },
    (err) => callback()
  )
}

module.exports = fileImport

