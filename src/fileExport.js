let types = {
  json: function typeJSON (data) {
    return JSON.stringify(data, null, '    ') + '\n'
  }
}

function fileExport (options, callback) {
  options.db.search('',
    (err, result) => {
      if (err) {
        return callback(err)
      }

      callback(null, types[options.type](result))
    }
  )

}

module.exports = fileExport 
