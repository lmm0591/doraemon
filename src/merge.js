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

  //fs.writeFileSync(outFile, JSON.stringify(fileContext,null,2), 'utf8');



  var errorLen = Object.keys(report.errorInfo).length;
  console.log(errorLen)
  if (errorLen === 0) {
  var questions = [
    {
      type: 'list',
      name: 'prize',
      message: '警告，翻译文件有额外增加字段 ' + errorLen + '字段！',
      choices: [
      {
        key: 's',
        name: '查看字段'
      },
      {
        key: 'i',
        name: '忽略警告并创建文件'
      }
    ],
    when: function(answers) {
        console.log('ddd');
        console.log(answers.comments);
        return answers.comments !== 'Nope, all good!';
      }
    }
  ];
  inquirer.prompt(questions).then(function (answers) {
    console.log('\nOrder receipt:');
    console.log(JSON.stringify(answers, null, '  '));
  });
  } else {
    console.log('相似字段 %d 个!'.verbose , Object.keys(report.ignoreInfo).length);
    console.log('修改字段 %d 个!'.info, Object.keys(report.updateInfo).length);
  }

}


function merger(sourceFile, addFile) {

  var report = {
    errorInfo: {},
    ignoreInfo: {},
    updateInfo: {}
  };

  Object.keys(addFile).forEach(function(key) {
    if (sourceFile.hasOwnProperty(key)) {
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
