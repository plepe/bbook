const blessed = require('neo-blessed')
const ee = require('event-emitter')
ee.allOff = require('event-emitter/all-off')

const Database = require('./Database')
const Pager = require('./Pager')
const cli = require('./cli')
const addEmail = require('./addEmail')
const fileExport = require('./fileExport')
const fileImport = require('./fileImport')
const muttQuery = require('./muttQuery')
global.debug = require('./debug')

let args = cli()

let db = new Database(args.database)

let rows = [
  { id: 'name', title: 'Name', pager: true },
  { id: 'email', title: 'E-Mail address', pager: true },
  { id: 'phone', title: 'Phone', pager: true },
  { id: 'country', title: 'Country', pager: false }
]

db.init(function () {
  if (args.add_email) {
    addEmail(db, rows)
  } else if (args.export) {
    fileExport(
      {
        db,
        type: args.export
      }, (err, result) => {
        if (err) {
          throw (err)
        }

        process.stdout.write(result)
      })
  } else if (args.import) {
    let stdin = process.stdin
    let chunks = []
    stdin.setEncoding('utf8')

    stdin.on('data', function (chunk) {
      chunks.push(chunk)
    })
    stdin.on('end', function () {
      chunks = chunks.join('')

      fileImport(
        chunks,
        {
          db,
          type: args.import
        }, (err, result) => {
          if (err) {
            throw (err)
          }

          process.exit(0)
        }
      )
    })
  } else if (args.mutt_query) {
    muttQuery(
      args.mutt_query[0],
      {
        db
      },
      (err, result) => {
        if (err) {
          process.stdout.write(err + '\r\n')
        } else {
          process.stdout.write('\r\n')
          process.stdout.write(result)
        }
      }
    )
  } else {
    setupGui()
  }
})

function setupGui () {
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true
  })

  screen.title = 'bbook'

  screen.key('C-c', function () {
    screen.destroy()
  })

  let pager = new Pager({ db, rows, screen })
  pager.show()
  pager.on('close', () => {
    screen.destroy()
  })
}
