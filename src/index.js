const blessed = require('neo-blessed')
const ee = require('event-emitter')
ee.allOff = require('event-emitter/all-off')

const Database = require('./Database')
const Entry = require('./Entry')

const screen = blessed.screen({
  smartCSR: true,
  fullUnicode: true
})

screen.title = 'nbook'

let db = new Database('nbook.db')

let database
let rows = [
  { id: 'name', title: 'Name' },
  { id: 'email', title: 'E-Mail address' },
  { id: 'phone', title: 'Phone' },
  { id: 'country', title: 'Country' }
]

let table = blessed.listtable({
  top: 2,
  left: 0,
  right: 0,
  bottom: 2,
  bg: 'magenta',
  keys: true,
  mouse: true,
  scrollbar: true,
  style: {
    border: {
      fg: 'red'
    },
    cell: {
      selected: {
        bg: 'blue'
      }
    },
    scrollbar: {
      bg: 'blue'
    }
  }
})

screen.append(table)
table.focus()

table.key([ 'escape', 'q' ], function() {
    return screen.destroy()
})
table.key([ 'insert', 'a' ], function() {
  showEntry(null)
})
screen.key('C-c', function () {
  screen.destroy()
})

function showEntry (id) {
  let entry = new Entry(id, {
    db,
    rows
  })

  entry.show(screen)

  entry.on('update', () => {
    updateDisplay()
  })
  entry.on('close', () => {
    ee.allOff(entry)
    delete entry
  })

  screen.render()
}

table.on('select', function (data) {
  let index = data.index - 2 // why -2?
  let id = database[index].id

  showEntry(id)
})
table.key([ 'delete', 'r' ], function (data) {
  let index = table.selected - 1
  let id = database[index].id

  db.remove(id, (err) => {
    if (err) {
      throw(err)
    }

    updateDisplay()
  })
})

function updateDisplay () {
  let header = rows.map(row => row.title)

  db.search('', (err, result) => {
    database = result

    let data = database.map(entry =>
      rows.map(row => entry[row.id] || '')
    )

    table.setData([ header ].concat(data))
    screen.render()
  })
}

updateDisplay()
