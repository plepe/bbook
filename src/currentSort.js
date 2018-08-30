const lowerCase = require('lower-case')

function sortAlpha (a, b) {
  return lowerCase(a.name) > lowerCase(b.name) ? 1 : -1
}

module.exports = sortAlpha
