const fs = require('fs')

function debug (msg) {
  fs.appendFileSync('debug.log', (typeof msg === 'string' ? msg : JSON.stringify(msg)) + '\n')
}

module.exports = debug
