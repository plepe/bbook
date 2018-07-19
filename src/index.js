const blessed = require('neo-blessed')
const ee = require('event-emitter')
ee.allOff = require('event-emitter/all-off')

const Database = require('./Database')
const Pager = require('./Pager')

const screen = blessed.screen({
  smartCSR: true,
  fullUnicode: true
})

screen.title = 'nbook'

let db = new Database('nbook.db')

let rows = [
  { id: 'name', title: 'Name' },
  { id: 'email', title: 'E-Mail address' },
  { id: 'phone', title: 'Phone' },
  { id: 'country', title: 'Country' }
]

let pager = new Pager({ db, rows, screen })
pager.show()

screen.key('C-c', function () {
  screen.destroy()
})
