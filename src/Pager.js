const blessed = require('neo-blessed')
const ee = require('event-emitter')

const Entry = require('./Entry')

class Pager {
  constructor (options) {
    this.options = options

    this.db = this.options.db
    this.screen = this.options.screen
  }

  show () {
    this.table = blessed.listtable({
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

    this.screen.append(this.table)
    this.table.focus()
    this.updateDisplay()

    this.table.key([ 'escape', 'q' ], () => {
      this.screen.destroy()
    })
    this.table.key([ 'insert', 'a' ], () => {
      this.showEntry(null)
    })
    this.table.on('select', (data) => {
      let index = data.index - 2 // why -2?
      let id = this.database[index].id

      this.showEntry(id)
    })
    this.table.key([ 'delete', 'r' ], () => {
      let index = this.table.selected - 1
      let id = this.database[index].id

      this.db.remove(id, (err) => {
        if (err) {
          throw(err)
        }

        this.updateDisplay()
      })
    })
  }

  showEntry (id) {
    let entry = new Entry(id, {
      db: this.db,
      screen: this.screen,
      rows: this.options.rows
    })

    entry.show()

    entry.on('update', () => {
      this.updateDisplay()
    })
    entry.on('close', () => {
      ee.allOff(entry)
      entry = null
    })
  }

  updateDisplay () {
    let header = this.options.rows
      .filter(row => row.pager)
      .map(row => row.title)

    this.db.search('', (err, result) => {
      this.database = result

      let data = result.map(entry =>
        this.options.rows
          .filter(row => row.pager)
          .map(row => entry[row.id] || '')
      )

      this.table.setData([ header ].concat(data))
      this.screen.render()
    })
  }
}

ee(Pager.prototype)

module.exports = Pager