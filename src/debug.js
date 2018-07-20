const fs = require('fs')

function debug (msg) {
  fs.appendFile('debug.log', (typeof msg === 'string' ? msg : JSON.stringify(msg)) + '\n', function () {})
}

module.exports = debug
