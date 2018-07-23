# bbook
An addressbook written in NodeJS using the `blessed` framework (an ncurses replacement). Very similar in usage to [abook](http://abook.sourceforge.net/).

Similar to abook, it features integration into the [mutt](http://www.mutt.org/) mail client.

## Installation
Requirements: [NodeJS >=8.0](https://nodejs.org/), 

```sh
npm install -g bbook
bbook # start bbook programm
bbook --help # see command line parameters
```

### Development
```sh
git clone https://github.com/plepe/bbook.git
cd bbook
npm install
bin/bbook # start bbook programm
bin/bbook --help # see command line parameters
npm run test # run tests
```

## Integration into Mutt
Use these lines in your `.muttrc` to integrate bbook into mutt:
```
set query_command = "bbook --mutt-query '%s'"
macro generic,index,pager \ca "<shell-escape>bbook<return>" "launch bbook"
macro index,pager a "<pipe-message>bbook --add-email<return>" "add the sender address to bbook"
```
