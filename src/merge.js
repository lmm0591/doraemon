var pathJoin = require('path').join;

var ROOT_PATH = process.cwd();

module.exports = function(file, megerFile , outFile) {
  var path = pathJoin(process.cwd(), 'package.json')


  console.log(file);
  console.log(megerFile);
  console.log(outFile);
  var filePath = pathJoin(ROOT_PATH, file);
  var fileContext = require(filePath);
  console.log(fileContext);

  var megerPath = pathJoin(ROOT_PATH, megerFile);
  var megerContext = require(megerPath);
  console.log(megerContext);
  var errors = [];
  for (var key in file) {
    if (megerFile[key] === undefined) {
      errors.push(key);
    } else {
      file[key] = megerFile[key];
    }
  }
  console.log(errors);

  //var pack = require(inFiles);
  //console.log(pack);
}
