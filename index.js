'use strict'

var program = require('commander');

function list(val) {
  return val.split(',');
}
program
  .version('0.0.1')
  .usage('[options] <file ...>')
  .option('-T, --no-tests', 'ignore test hook')

program
  .command('merge [file] [megerFile] [outFile]')
  .description('合并 JSON 文件')
  .action(function(file, megerFile, outFile) {
    outFile === undefined || (outFile = file);

    console.log(inFiles);
    console.log(outFiles);
    console.log("=======");
    require('./src/merge')(file, megerFile , outFile);
  });

program.parse(process.argv)


