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
    this.searchResults = []
    this.filterString = ''
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

    this.shortHelp = blessed.box({
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      content: 'q:quit, a:add, r:remove, /,n:search, f:filter'
    })
    this.screen.append(this.shortHelp)

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
      this.close()
    })
    this.table.key([ 'insert', 'a' ], () => {
      this.showEntry(null)
    })
    this.table.key([ '/' ], () => {
      inputTextbox('Search', '', this.screen, (err, result) => {
        if (err) {
          throw (err)
        }

        this.db.search(result, (err, result) => {
          if (err) {
            throw (err)
          }

          this.searchResults = result.map(entry => entry.id)

          if (this.searchResults.length === 0) {
            return this.updateDisplay()
          }

          this.selectNextSearchResult()
        })
      })
    })
    this.table.key([ 'f' ], () => {
      inputTextbox('Filter', '', this.screen, (err, result) => {
        if (err) {
          throw (err)
        }

        this.filterString = result
        this.updateDisplay()
      })
    })
    this.table.key([ 'n' ], () => {
      this.selectNextSearchResult()
    })
    this.table.key([ 'pagedown' ], () => {
      let height = this.table.height - 1 // (1 for the header)
      let toLast = height - this.table.childOffset - 1

      if (toLast === 0) {
        this.table.select(this.table.selected + height)
      } else {
        this.table.select(this.table.selected + toLast)
      }

      this.screen.render()
    })
    this.table.key([ 'pageup' ], () => {
      let height = this.table.height - 1 // (1 for the header)
      let toFirst = this.table.childOffset

      if (this.table.selected <= 1) {
        // already at first
      } else if (toFirst === 0) {
        this.table.select(this.table.selected - height)
      } else {
        this.table.select(this.table.selected - toFirst)
      }

      this.screen.render()
    })
    this.table.key([ 'home' ], () => {
      this.table.select(1)
      this.screen.render()
    })
    this.table.key([ 'end' ], () => {
      this.table.select(this.table.items.length - 1)
      this.screen.render()
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

  selectNextSearchResult () {
    if (this.searchResults.length === 0) {
      return
    }

    let index = this.table.selected - 1

    do {
      if (++index >= this.database.length) {
        index = 0
      }
    } while (this.searchResults.indexOf(this.database[index].id) === -1)

    this.table.select(index + 1)
    this.screen.render()
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

    this.db.search(this.filterString, (err, result) => {
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
        throw (err)
      }

      fs.writeFile(filename, content, { encoding: 'utf8' },
        (err) => {
          if (err) {
            throw (err)
          }

          // TODO: notify user about succesful write
          this.screen.render()
        }
      )
    }
    )
  }

  close () {
    this.table.destroy()
    this.shortHelp.destroy()
    this.screen.render()

    this.emit('close')
  }
}

ee(Pager.prototype)

module.exports = Pager
