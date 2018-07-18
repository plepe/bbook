const blessed = require('neo-blessed')

const screen = blessed.screen({
  smartCSR: true,
  fullUnicode: true
})

screen.title = 'nbook'

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

table.setData([
  [ 'Name', 'E-Mail address', 'Phone' ],
  [ 'Bob', 'bob@example.com', '' ],
  [ 'Alice', 'alice@example.com', '01/2345678' ],
  [ 'Bob', 'bob@example.com', '' ],
  [ 'Alice', 'alice@example.com', '01/2345678' ],
  [ 'Bob', 'bob@example.com', '' ],
  [ 'Alice', 'alice@example.com', '01/2345678' ],
  [ 'Bob', 'bob@example.com', '' ],
  [ 'Alice', 'alice@example.com', '01/2345678' ],
  [ 'Bob', 'bob@example.com', '' ]
])

screen.append(table)
table.focus()

screen.key('q', function() {
    return screen.destroy()
})

screen.render()
