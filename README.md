# nbook
An addressbook written in NodeJS using the `blessed` framework (an ncurses replacement). Very similar in usage to [abook](http://abook.sourceforge.net/).

Similar to abook, it features integration into the [mutt](http://www.mutt.org/) mail client.

## Installation
Requirements: [NodeJS >=8.0](https://nodejs.org/), 

```sh
npm install -g nbook
nbook # start nbook programm
nbook --help # see command line parameters
```

### Development
```sh
git clone https://github.com/plepe/nbook.git
cd nbook
npm install
bin/nbook # start nbook programm
bin/nbook --help # see command line parameters
npm run test # run tests
```

## Integration into Mutt
Use these lines in your `.muttrc` to integrate nbook into mutt:
```
set query_command = "nbook --mutt-query '%s'"
macro generic,index,pager \ca "<shell-escape>nbook<return>" "launch nbook"
macro index,pager a "<pipe-message>nbook --add-email<return>" "add the sender address to nbook"
```
