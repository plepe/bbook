const blessed = require('neo-blessed')
const ee = require('event-emitter')
const fs = require('fs')
const async = require('async')

const Entry = require('./Entry')
const fileExport = require('./fileExport')
const inputTextbox = require('./inputTextbox')

class Pager {
  constructor (options) {
    this.options = options

    this.db = this.options.db
    this.screen = this.options.screen
  }

  show () {
    let line = blessed.Line({
      top: 1,
      left: 0,
      right: 0,
      orientation: 'horizontal'
    })
    this.screen.append(line)

    line = blessed.Line({
      bottom: 1,
      left: 0,
      right: 0,
      orientation: 'horizontal'
    })
    this.screen.append(line)

    let help = blessed.box({
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      content: 'q:quit, a:add, r:remove'
    })
    this.screen.append(help)

    this.table = blessed.listtable({
      top: 2,
      left: 0,
      right: 0,
      bottom: 2,
      bg: 'magenta',
      keys: true,
      mouse: true,
      scrollbar: true,
      align: 'left',
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
      let index = this.table.selected - 1
      let id = this.database[index].id

      this.showEntry(id)
    })
    this.table.key([ 'delete', 'r' ], () => {
      let index = this.table.selected - 1
      let id = this.database[index].id

      this.db.remove(id, (err) => {
        if (err) {
          throw (err)
        }

        this.updateDisplay()
      })
    })
    this.table.key([ 'x' ], () => this.exportToFile())
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
      if (err) {
        throw (err)
      }

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

  exportToFile () {
    let filename
    let content

    async.parallel([
      (callback) => {
        inputTextbox('Filename', '', this.screen,
          (err, result) => {
            filename = result
            callback(err)
          }
        )
      },
      (callback) => {
        fileExport(
          {
            db: this.db,
            type: 'json'
          },
          (err, result) => {
            content = result
            callback(err)
          }
        )
      }
    ], (err) => {
      if (err) {
        throw(err)
      }

      fs.writeFile(filename, content, { encoding: 'utf8' },
        (err) => {
          if (err) {
            throw(err)
          }

          // TODO: notify user about succesful write
          this.screen.render()
        }
      )
    }
  )
}

}

ee(Pager.prototype)

module.exports = Pager
