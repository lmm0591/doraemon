var pathJoin = require('path').join;
var FS = require('fs');
var inquirer = require('inquirer');

var PATH = pathJoin('./src/routes/');
var MODTMPL_PATH = pathJoin('./node_modules/nd-doraemon/bin/') + 'mod.template';
var WEBPACK_PATH = process.cwd() +  pathJoin('/src/module.js');
var fileList = getFileList(PATH);
var modTmpl = FS.readFileSync(MODTMPL_PATH,'utf8')

function isDisableFile(fileName){
  fileName = fileName.replace(/(\.js)$/,'').replace(/^\d+/,'')
  return require(WEBPACK_PATH).excludeModule.indexOf(fileName) >= 0
}

//获取路由文件列表
function getFileList(dir){
  var fileList = FS.readdirSync(PATH)
  return fileList.filter(function(fileName){
    return fileName !== 'index.js';
  })
}

//生成 WEBPACK 模块加载文件
function buildExcludeModules(modules, flag){
  var data = modules.map(function(fileName){
    //除去文件后缀和前缀
    return fileName.replace(/(\.js)$/,'').replace(/^\d+/,'')
  })

  var json = JSON.stringify(data).replace(/\"/g,"'");
  var result = modTmpl.replace('{excludeModule}',json);
  FS.writeFileSync(WEBPACK_PATH, result)
}


module.exports = function(routePath,command) {

  routePath && (PATH=routePath)

  //来移除，加载所有的模块
  if(command.noRemove){
    buildExcludeModules([])
  }else{

    var loadMode = [{
      type: 'list',
      name: 'loadMode',
      message: '选择加载方式?',
      choices: [{name:'加载模块',value: true},{name:'移除模块',value: false}]
    }];

    inquirer.prompt(loadMode).then(function(answers) {
      var isLoadMode = answers.loadMode;
      var choiceList = [];
      //生成模块选择列表
      fileList.forEach(function(fileName){
        var checked = isLoadMode ? false : isDisableFile(fileName)
        choiceList.push({name:fileName.replace(/(\.js)$/,''),value:fileName, checked: checked})
      })

      var questions = [{
        type: 'checkbox',
        name: 'excludeModules',
        message: isLoadMode ? '选择要加载的模块?' : '选择要移除的模块?',
        choices: choiceList
      }];

      inquirer.prompt(questions).then(function(answers) {
        var excludeModules = answers.excludeModules
        if(isLoadMode){//如果是加载模式，就取反
          buildExcludeModules(fileList)
          excludeModules = fileList.filter(function(e){
            return excludeModules.indexOf(e) == -1
          })
        }
        buildExcludeModules(excludeModules)
      })
    })
  }
}
