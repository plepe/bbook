const ArgumentParser = require('argparse').ArgumentParser
const packageJson = require('../package.json')

module.exports = function () {
  const parser = new ArgumentParser({
    version: packageJson.version,
    addHelp: true,
    description: 'An addressbook written in nodejs using the blessed (an ncurses replacement) framework. Similar to abook.'
  })

  parser.addArgument(
    [ '-d', '--database' ],
    {
      help: 'using the specified database file (if it does not exist, it will be created). Default: "~/bbook.db"'
    }
  )

  parser.addArgument(
    [ '--add-email' ],
    {
      help: 'Read an email (header) from stdin and parse the From address. Creates new entry from this address',
      nargs: 0
    }
  )

  parser.addArgument(
    [ '--mutt-query' ],
    {
      help: 'Query database for a list of addresses as expected by mutt',
      nargs: 1
    }
  )

  parser.addArgument(
    [ '-x', '--export' ],
    {
      help: 'export database in the specified format to stdout. Possible values: "json"',
      nargs: 1
    }
  )

  parser.addArgument(
    [ '-i', '--import' ],
    {
      help: 'import database from stdin in the specified format. Possible values: "json", "abook"',
      nargs: 1
    }
  )

  return parser.parseArgs()
}
