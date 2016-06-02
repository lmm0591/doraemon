var pathJoin = require('path').join;
var FS = require('fs');
var inquirer = require('inquirer');

var PATH = pathJoin('./src/routes/');
var WEBPACK_PATH = './webpack/module.js';

function isDisableFile(fileName){
  return /\.bak$/.test(fileName)
}

//获取路由文件列表
function getFileList(dir){
  var fileList = FS.readdirSync(PATH)
  return fileList.filter(function(fileName){
    return fileName !== 'index.js';
  })
}

//禁用路由
function disableFile(fileName){
  var oldFilePath = pathJoin(PATH,fileName)
  //设置该文件不可被加载
  var newFilePath = pathJoin(PATH,fileName.replace(/.js$/,'.bak'))
  try{
    FS.renameSync(oldFilePath, newFilePath)
  } catch(e) {
    console.log(e)
  }
}

//启用路由
function ableFile(fileName){
  var oldFilePath = pathJoin(PATH,fileName)
  //设置该文件可被加载
  var newFilePath = pathJoin(PATH,fileName.replace(/\.bak$/,'.js'))
  try{
    FS.renameSync(oldFilePath, newFilePath)
  } catch(e) {
    console.log(e)
  }
}

// 控制台生成结果报告
function buildReport(){
  //输出可加载的模块
  getFileList(PATH).forEach(function(fileName){
    isDisableFile(fileName) || console.log('[%s] 模块可加载!'.info, fileName.replace(/\.js$/,''))
  })
  console.log('设置完成!'.info );
}

//生成 WEBPACK 模块加载文件
function buildExcludeModules(modules){
  var data = modules.map(function(fileName){
    //除去文件后缀和前缀
    return '/app\\' + fileName.replace(/(\.bak|\.js)$/,"/").replace(/^\d+/,"")
  })
  var loadConfig = {
    excludeModule : data
  }
  // /\"\/([\w|\\]+)\/\"/g,"\/$1\/" 把字符串转成正则
  // 如： "/app\\shop/" => /app\\shop/
  var json = JSON.stringify(loadConfig,null,2).replace(/\"\/([\w|\\]+)\/\"/g,"\/$1\/")
  json = json.replace(/\"/g,"'")
  FS.writeFileSync(WEBPACK_PATH,"export default " + json)
  console.log('生成 webpack 配置文件！')
}

module.exports = function(routePath,command) {

  routePath && (PATH=routePath)
  var fileList = getFileList(PATH)

  //来移除，加载所有的模块
  if(command.noRemove){
    fileList.forEach(function(fileName){
      isDisableFile(fileName) && ableFile(fileName);
    })
    buildReport()
    buildExcludeModules([])
  }else{

    choiceList = [];
    //生成模块选择列表
    fileList.forEach(function(fileName){
      choiceList.push({name:fileName.replace(/(.js|.bak)$/,''),value:fileName,checked:isDisableFile(fileName)})
    })

    var questions = [{
      type: 'checkbox',
      name: 'excludeModules',
      message: '选择要移除的模块?',
      choices: choiceList
    }];

    inquirer.prompt(questions).then(function(answers) {
      var fileList = getFileList(PATH)

      buildExcludeModules(answers.excludeModules)

      fileList.forEach(function(fileName){
        //要被移除 "加载文件"
        if(answers.excludeModules.indexOf(fileName) >= 0 && isDisableFile(fileName) === false ){
          disableFile(fileName);

        //恢复 "加载文件"
      } else if (answers.excludeModules.indexOf(fileName) === -1 && isDisableFile(fileName) ){
          ableFile(fileName);
        }
      })
      buildReport()
    })

  }
}
