const ttys = require('ttys')
const readline = require('readline')

function addEmail (db, rows) {
  let name
  let email

  let stdin = process.stdin
  stdin.setEncoding('utf8')

  stdin.on('data', function (chunk) {
    let lines = chunk.split('\n')

    lines.forEach(line => {
      let m = line.match(/^From:(.*)<(.*)>/i)
      if (m) {
        name = m[1].trim()
        email = m[2].trim()
      }

      m = line.match(/^From:\s*([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)$/i)
      if (m) {
        name = ''
        email = m[1]
      }
    })
  })
  stdin.on('end', function () {
    if (!email) {
      ttys.stdin.destroy()
      return console.log('No email address found')
    }

    let prompts = readline.createInterface({
      input: ttys.stdin,
      output: ttys.stdout
    })

    prompts.question(
      'Add new entry: ' + name + ' <' + email + '> [Yn]? ',
      (result) => {
        if ([ 'y', 'Y', '' ].indexOf(result) !== -1) {
          db.set(null, { name, email }, function () {})
        }

        prompts.close()
        ttys.stdin.destroy()
      }
    )
  })
}

module.exports = addEmail
