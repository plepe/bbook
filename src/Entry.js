const blessed = require('neo-blessed')
const ee = require('event-emitter')

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
      screen.render()
    })

    win.focus()

    win.key('e', () => {
      win.readEditor(() => {
        this.data = JSON.parse(win.getValue())
        win.setValue(JSON.stringify(this.data, null, '  '))
        screen.render()

        this.options.db.set(this.id, this.data, (err) => {
          if (err) {
            throw(err)
          }

          this.emit('update')
        })
      })
    })

    win.key([ 'escape', 'q' ], function () {
      win.destroy()
      screen.render()

      this.emit('close')
    })
  }
}

ee(Entry.prototype)

module.exports = Entry
