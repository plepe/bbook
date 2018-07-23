function muttQuery (str, options, callback) {
  options.db.search(str, (err, result) => {
    if (err) {
      return callback(err)
    }

    if (!result.length) {
      return callback(new Error('Not found'))
    }

    result = result.map(entry => entry.email + '\t' + entry.name).join('\r\n') + '\r\n'

    callback(null, result)
  })
}

module.exports = muttQuery
