const blessed = require('neo-blessed')
const ee = require('event-emitter')
ee.allOff = require('event-emitter/all-off')

const Database = require('./Database')
const Pager = require('./Pager')
const cli = require('./cli')
global.debug = require('./debug')

let args = cli()

let db = new Database(args.database)

let rows = [
  { id: 'name', title: 'Name', pager: true },
  { id: 'email', title: 'E-Mail address', pager: true },
  { id: 'phone', title: 'Phone', pager: true },
  { id: 'country', title: 'Country', pager: false }
]

function setupGui () {
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true
  })

  screen.title = 'nbook'

  screen.key('C-c', function () {
    screen.destroy()
  })

  let pager = new Pager({ db, rows, screen })
  pager.show()
}

setupGui()
