'use strict'

var program = require('commander');
var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'green',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

function list(val) {
  return val.split(',');
}
program
  .version('0.0.1')
  .usage('[options] <file ...>')

program
  .command('merge [file] [megerFile] [outFile]')
  .description('合并 JSON 文件')
  .action(require('./src/merge'));

program.parse(process.argv)


