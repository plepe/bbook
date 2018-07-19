const blessed = require('neo-blessed')

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

table.key('q', function() {
    return screen.destroy()
})
screen.key('C-c', function () {
  screen.destroy()
})

table.on('select', function (data) {
  let index = data.index - 2 // why -2?
  let id = database[index].id

  let entry = new Entry(id, {
    db,
    rows
  })

  entry.show(screen)

  screen.render()
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
