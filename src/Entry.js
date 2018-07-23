const blessed = require('neo-blessed')
const ee = require('event-emitter')

const inputTextbox = require('./inputTextbox')

class Entry {
  constructor (id, options) {
    this.id = id
    this.options = options

    this.db = this.options.db
    this.screen = this.options.screen
  }

  get (callback) {
    if (this.id) {
      this.db.get(this.id, (err, data) => {
        this.data = data
        callback(err)
      })
    } else {
      this.data = {}
      callback(null)
    }
  }

  updateWindow (options={}) {
    let currentIndex = this.win.selected

    this.win.clearItems()

    this.options.rows.forEach(row => {
      this.win.addItem(row.title + ': ' + (this.data[row.id] || ''))
    })

    if (options.selectNext) {
      currentIndex++
    }

    this.win.select(currentIndex)

    this.screen.render()
  }

  updateData (data, callback) {
    this.db.set(this.id, data, (err, id) => {
      if (err) {
        throw (err)
      }

      if (id) {
        this.id = id
      }

      this.emit('update')

      this.get(callback)
    })
  }

  /**
   * open in external editor
   */
  editField (id, callback) {
    let editor = blessed.Textbox({
    })
    this.win.append(editor)
    editor.setValue(this.data[id])

    editor.readEditor((err, data) => {
      if (err) {
        throw (err)
      }

      let newData = {}
      newData[id] = data
      editor.destroy()

      this.updateData(newData, (err) => {
        if (err) {
          throw (err)
        }

        callback(null)
      })
    })
  }

  inputField (id, callback) {
    let row = this.options.rows.find(row => row.id === id)

    inputTextbox(row.title, this.data[id], this.screen,
      (err, result) => {
        if (result !== null) {
          let newData = {}
          newData[id] = result === '' ? null : result

          this.updateData(newData, (err) => {
            if (err) {
              throw (err)
            }

            callback(null)
          })
        }
      }
    )
  }

  currentField () {
    return this.options.rows[this.win.selected]
  }

  show () {
    this.shortHelp = blessed.box({
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      content: 'q:back, enter:change value, e:edit externally'
    })
    this.screen.append(this.shortHelp)

    this.win = blessed.List({
      top: 2,
      left: 0,
      right: 0,
      bottom: 2,
      scrollable: true,
      keys: true,
      mouse: true,
      scrollbar: true,
      style: {
        selected: {
          bg: 'blue'
        }
      }
    })

    this.screen.append(this.win)

    this.win.on('select', () => {
      let id = this.currentField().id
      this.inputField(id, () => {
        this.updateWindow({ selectNext: true })
      })
    })
    this.win.key([ 'e' ], () => {
      let id = this.currentField().id
      this.editField(id, () => {
        this.updateWindow({ selectNext: true })
      })
    })

    this.win.focus()

    this.win.key('S-e', () => {
      let editor = blessed.Textarea({
        height: 0, width: 0
      })
      this.win.append(editor)
      editor.setValue(JSON.stringify(this.data, null, '  '))
      editor.readEditor((err, data) => {
        if (err) {
          throw (err)
        }

        editor.destroy()

        this.updateData(JSON.parse(data), (err) => {
          if (err) {
            throw (err)
          }

          this.updateWindow()
        })
      })
    })

    this.win.key([ 'escape', 'q' ], () => {
      this.close()
    })

    if (this.id === null) {
      this.data = {}
      let id = this.options.rows[0].id
      this.inputField(id, () => {
        this.updateWindow({ selectNext: true })
      })
      return
    }

    this.get(err => {
      if (err) {
        throw (err)
      }

      this.updateWindow()
    })
  }

  close () {
    this.win.destroy()
    this.shortHelp.destroy()
    this.screen.render()

    this.emit('close')
  }
}

ee(Entry.prototype)

module.exports = Entry
