const ArgumentParser = require('argparse').ArgumentParser
const package_json = require('../package.json')

module.exports = function () {
  const parser = new ArgumentParser({
    version: package_json.version,
    addHelp: true,
    description: 'An addressbook written in nodejs using the blessed framework. A drop-in replacement for abook.'
  })

  parser.addArgument(
    [ '-d', '--database' ],
    {
      help: 'using the specified database file (if it does not exist, it will be created). Default: "nbook.db"',
      defaultValue: 'nbook.db'
    }
  )

  parser.addArgument(
    [ '--add-email' ],
    {
      help: 'Read an email (header) from stdin and parse the From address. Creates new entry from this address',
      nargs: 0
    }
  )

  return parser.parseArgs()
}
