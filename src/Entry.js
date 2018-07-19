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
        callback(null)
      })
    } else {
      this.data = {}
      callback(null)
    }
  }

  updateWindow () {
    this.win.setValue(JSON.stringify(this.data, null, '  '))
    this.screen.render()
  }

  show () {
    this.win = blessed.Textarea({
      top: 5,
      left: 5,
      width: 20,
      height: 10,
      style: {
        bg: 'red'
      }
    })

    this.screen.append(this.win)

    this.get(err => {
      if (err) {
        throw(err)
      }

      this.updateWindow()
    })

    this.win.focus()

    this.win.key('e', () => {
      this.win.readEditor(data => {
        this.db.set(this.id, JSON.parse(data), (err, id) => {
          if (err) {
            throw(err)
          }

          if (id) {
            this.id = id
          }

          this.emit('update')

          this.get(err => {
            if (err) {
              throw(err)
            }

            this.updateWindow()
          })
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
