
var pathJoin = require('path').join;
var fs = require('fs')
var inquirer = require('inquirer');

var ROOT_PATH = process.cwd();

module.exports = function(file, megerFile , outFile) {
  outFile === undefined && (outFile = file);
  console.log('原文件：%s '.input, file);
  console.log('合并文件：%s '.input, megerFile);
  console.log('输出文件：%s '.input, outFile);


  var filePath = pathJoin(ROOT_PATH, file);
  var fileContext = require(filePath);

  var megerPath = pathJoin(ROOT_PATH, megerFile);
  var megerContext = require(megerPath);

  var report = merger(fileContext, megerContext);
  console.log("=========================================================".prompt)

  console.log('相似字段 %d 个!'.verbose , Object.keys(report.ignoreInfo).length);
  console.log('更新字段 %d 个!'.info, Object.keys(report.updateInfo).length);
  console.log('新增字段 %d 个!'.error , Object.keys(report.errorInfo).length);

  question(report , outFile , fileContext);

}

function question(report , outFile , fileContext) {
  var errorLen = Object.keys(report.errorInfo).length;

  var choices = [
    { name: '创建文件', value: 'crate' },
    { name: '查看更新的字段', value: 'update'  }
  ];
  errorLen && choices.push( { name: '查看额外增加的 ' + errorLen + ' 字段', value: 'error' });

  var questions = [{
    type: 'rawlist',
    name: 'command',
    message: '警告! 翻译文件有额外增加字段 ' + errorLen + ' 字段！',
    choices: choices
  }];

  inquirer.prompt(questions).then(function(answers) {
    var command = answers.command;
    if (command === 'error') {
      console.log('额外增加字段: ');
      console.log(JSON.stringify(report.errorInfo, null, 2));
      question(report, outFile,fileContext);
    } else if (command === 'update') {
      console.log(JSON.stringify(report.updateInfo, null, 2));
      question(report, outFile,fileContext);
    } else if (command === 'crate') {

      fs.writeFile(outFile, JSON.stringify(fileContext, null, 2), 'utf8', function() {
        console.log('文件已生成!');
        console.log('输出路径: %s', outFile);
      });

    }
  });
}

function merger(sourceFile, addFile) {

  var report = {
    errorInfo: {},
    ignoreInfo: {},
    updateInfo: {}
  };

  Object.keys(addFile).forEach(function(key) {
    if (sourceFile.hasOwnProperty(key) === false) {
      //正常情况翻译文件不会增加新的字段，所以要记录下增加的字段给开发人员分析
      report.errorInfo[key] = sourceFile[key] = addFile[key];

    } else if (sourceFile[key] === addFile[key]) {
      //如果两个字段一致，则该字段已经被翻译过，可以忽略
      report.ignoreInfo[key] = addFile[key];

    } else if (sourceFile[key] !== addFile[key]) {

      //如果值不一致，则该字段已更新翻译信息，所以要替换
      report.updateInfo[key] = sourceFile[key] = addFile[key];

    }
  })

  return report;
}
