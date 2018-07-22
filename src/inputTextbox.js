const blessed = require('neo-blessed')

/**
 * callback will have result null when aborted
 */
function inputTextbox (text, value, screen, callback) {
  let win = blessed.Box({
    top: 'center',
    left: 'center',
    height: 4,
    width: 60,
    border: {
      type: 'line'
    },
    content: text + ':'
  })
  screen.append(win)

  let editor = blessed.Textbox({
    top: 1,
    inputOnFocus: true
  })
  win.append(editor)
  editor.setValue(value)
  editor.focus()

  editor.on('cancel', () => {
    editor.destroy()
    win.destroy()

    callback(null, null)
  })

  editor.on('submit', () => {
    let value = editor.getValue()

    editor.destroy()
    win.destroy()

    callback(null, value)
  })

  screen.render()
}

module.exports = inputTextbox
