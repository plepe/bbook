const blessed = require('neo-blessed')
const ee = require('event-emitter')

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

  updateWindow () {
    let currentIndex = this.win.selected

    this.win.clearItems()

    this.options.rows.forEach(row => {
      this.win.addItem(row.title + ': ' + (this.data[row.id] || ''))
    })

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
  editField (id) {
    let editor = blessed.Textbox({
    })
    this.win.append(editor)
    editor.setValue(this.data[id])

    editor.readEditor((err, data) => {
      let newData = {}
      newData[id] = data
      editor.destroy()

      this.updateData(newData, (err) => {
        if (err) {
          throw(err)
        }

        this.updateWindow()
      })
    })
  }

  inputField (id) {
    let row = this.options.rows.find(row => row.id === id)
    let win = blessed.Box({
      top: 'center',
      left: 'center',
      height: 4,
      width: 60,
      border: {
        type: 'line'
      },
      content: row.title + ':'
    })
    this.win.append(win)

    let editor = blessed.Textbox({
      top: 1,
      inputOnFocus: true
    })
    win.append(editor)
    editor.setValue(this.data[id])
    editor.focus()

    editor.on('cancel', () => {
      editor.destroy()
      win.destroy()
      this.screen.render()
    })

    editor.on('submit', () => {
      let newData = {}
      newData[id] = editor.getValue()
      editor.destroy()
      win.destroy()

      this.updateData(newData, (err) => {
        if (err) {
          throw(err)
        }

        this.updateWindow()
      })
    })

    this.screen.render()
  }

  show () {
    let help = blessed.box({
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      content: 'q:back, enter:change value, e:edit externally'
    })
    this.screen.append(help)

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
      let id = this.options.rows[this.win.selected].id
      this.inputField(id)
    })
    this.win.key([ 'e' ], () => {
      let id = this.options.rows[this.win.selected].id
      this.editField(id)
    })

    this.get(err => {
      if (err) {
        throw (err)
      }

      this.updateWindow()
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
          throw(err)
        }

        editor.destroy()

        this.updateData(JSON.parse(data), (err) => {
          if (err) {
            throw(err)
          }

          this.updateWindow()
        })
      })
    })

    this.win.key([ 'escape', 'q' ], () => {
      this.win.destroy()
      this.screen.render()

      this.emit('close')
    })
  }
}

ee(Entry.prototype)

module.exports = Entry
