const blessed = require('neo-blessed')

const screen = blessed.screen({
  smartCSR: true,
  fullUnicode: true
})

screen.title = 'nbook'

let database = [
  { name: 'Alice', email: 'alice@example.com', phone: '01/2345678' },
  { name: 'Bob', email: 'bob@example.com', country: 'AT' },
  { name: 'Alice', email: 'alice@example.com', phone: '01/2345678' },
  { name: 'Bob', email: 'bob@example.com', country: 'AT' }
]
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

let header = rows.map(row => row.title)
let data = database.map(entry =>
  rows.map(row => entry[row.id] || '')
)
table.setData([ header ].concat(data))

screen.append(table)
table.focus()

table.key('q', function() {
    return screen.destroy()
})
screen.key('C-c', function () {
  screen.destroy()
})

table.on('select', function (data) {
  let row = database[data.index]

  let x = blessed.box({
    top: 5,
    left: 5,
    width: 20,
    height: 10,
    content: JSON.stringify(row, null, '  '),
    style: {
      bg: 'red'
    }
  })

  screen.append(x)

  x.focus()

  x.key('q', function () {
    x.destroy()
    screen.render()
  })

  screen.render()
})

screen.render()
