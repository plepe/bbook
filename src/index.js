const blessed = require('neo-blessed')

const Database = require('./Database')

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
  { id: 'phone', title: 'Phone' }
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
  let row = database[index]

  let x = blessed.Textarea({
    top: 5,
    left: 5,
    width: 20,
    height: 10,
    value: JSON.stringify(row, null, '  '),
    style: {
      bg: 'red'
    }
  })

  screen.append(x)

  x.focus()
  x.readEditor(() => {
    database[index] = JSON.parse(x.value)
    x.destroy()
    updateDisplay()
  })

  x.key('C-x', function () {
    database[index] = JSON.parse(x.value)
    x.destroy()
    updateDisplay()
  })

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
