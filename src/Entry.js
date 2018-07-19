const blessed = require('neo-blessed')

class Entry {
  constructor (id, options) {
    this.id = id
    this.options = options
  }

  show (screen) {
    let win = blessed.Textarea({
      top: 5,
      left: 5,
      width: 20,
      height: 10,
      style: {
        bg: 'red'
      }
    })

    screen.append(win)

    this.options.db.get(this.id, (err, data) => {
      this.data = data
      win.setValue(JSON.stringify(this.data, null, '  '))

      win.readEditor(() => {
        this.options.db.set(this.id, JSON.parse(win.getValue()), (err) => {
          if (err) {
            throw(err)
          }

          win.destroy()
          screen.render()
        })
      })
    })

    win.focus()

    win.key('C-x', function () {
      win.destroy()
    })
  }
}

module.exports = Entry
