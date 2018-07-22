function add_email (db, rows) {
  let stdin = process.stdin
  stdin.setEncoding('utf8')
  let chunks = []

  stdin.on('data', function (chunk) {
    let lines = chunk.split('\n')

    lines.forEach(line => {
      let m = line.match(/^From:(.*)<(.*)>/)
      if (m) {
        let name = m[1].trim()
        let email = m[2].trim()

        db.set(null, { name, email }, function () {})
        console.log('New entry: ' + name + ' <' + email + '>')
      }
    })
  })
  stdin.on('end', function () {
  })
}

module.exports = add_email
