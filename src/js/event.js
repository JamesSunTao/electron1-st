
const remote = require('electron').remote
const BrowserWindow = remote.BrowserWindow
/**
 * getSize()  // 获取窗口大小
 * setPosition(width,height,flag)  // flag设置为true ，代表一动画效果设置尺寸（仅限制于mac OS）
 * */ 
function getSizePosition() {
    const win = remote.getCurrentWindow();
    var x = win.getSize()[0],y=win.getSize()[1];
    console.log("x:"+x+', y:'+ y);

    var px = win.getPosition()[0],py=win.getPosition()[1];
    console.log("px:"+px+', py:'+ py);
}

function setSizePosition(params) {
    const win = remote.getCurrentWindow();
    win.setSize(300,300,true)
    win.setPosition(10,10)
}

function kioskWindow(params) {
    const win = remote.getCurrentWindow();
    const btn = document.getElementById('button');

    if (win.isKiosk()) {
        win.setKiosk(false)
        btn.innerText = '进入锁定模式'
    }else{
        win.setKiosk(true)
        btn.innerText = '退出锁定模式' 
    }
}


function createMoreWindow(params) {
    const win = remote.getCurrentWindow();
    if (global.windows == undefined) {
        global.windows = [];
    }
    const addWin = new BrowserWindow({show:false,y:20,x:20,width:400,height:340});
    global.windows.push(addWin);
    addWin.loadFile('child.html');
    addWin.on('ready-to-show',()=>{
        addWin.show();
    })
}

// 关闭除了主窗口外的所有窗口   global全局变量
function closeAllChildWindow(params) {
    if (global.windows != undefined) {
        for (let i = 0; i < global.windows.length; i++) {
           
            global.windows[i].close()
        }
        global.windows.length = 0;
        global.windows = undefined;
    }
}
/**
 * 文件展示窗口（只针对 MAC os）
 * 通过BrowserWindow 对象的setRepresentedFilename方法设置文件的目录，当前窗口文件的图标
 * 会放到窗口的标题栏上，标题栏右侧会显示该文件所在的目录层次
 * */ 

// --------------------------------------
// 获取ipcmain对象
const ipcMain = remote.ipcMain;
const {ipcRenderer} = require('electron')

ipcMain.on('childData',(event,data)=>{
      const label = document.getElementById('childText');
      label.innerText =  label.innerText + data;
})

//  传递数据给子窗口
function sendData(params) {
    const childWin = new BrowserWindow({show:false,y:20,x:20,width:400,height:400})
    childWin.loadFile('child.html');
    childWin.once('ready-to-show',()=>{
        childWin.show();
        childWin.webContents.send('data',{name:"sunTao",age:18})
    })
}


// 接受主窗口传递过来的数据
function onloadData(params) {
    ipcRenderer.on('data',(event, arg) => {
        console.log("childData:"+arg)
        const name = document.getElementById('label_name')  
        const age = document.getElementById('label_age')  
        name.innerText = arg.name
        age.innerText = arg.age
    })
} 

function closeCurWindow(params) {
    const win = remote.getCurrentWindow()
    ipcRenderer.send("childData",'窗口已关闭');
    win.close();
}

// 打开对话框
/**
 * browserWindow 参数允许该对话框将自身附加到父窗口, 作为父窗口的模态框。
 * callback： 返回选中的文件或路径，如果不指定该参数，选中的文件何目录的路径会通过showOpenDialog方法的返回值返回
 * options:
 * title:标题
 * defaultPath ： String 默认路劲
 * buttonLabel ： open按钮的文本
 * filters ；用于过滤指定类型的文件
 * */ 
const dialog= remote.dialog
function openFileDialog(params) {
    const label = document.getElementById("fileLabel");
    label.innerText = dialog.showOpenDialog({properties:['openFile']});
}

/**
 * 定制对话框
 * 
 * */ 
function openCustomFileDialog(params) {
    const label = document.getElementById("fileCustomLabel");
    var options = {};
    options.title = "tao的定制对话框";
    options.buttonLabel = "我是label"
    options.properties = ['openFile'];
    label.innerText = dialog.showOpenDialog(options);
}

/**
 * options.filters :对象数组
 * openDirectory ：选择目录
 * */ 

 function chooseFileType(params) {
    const label = document.getElementById("chooseFileTypeLabel");
    var options = {};
    options.title = "选择文件类型";
    options.buttonLabel = "选择"
    options.properties = ['openFile'];
    options.filters = [
        { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
        { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
        { name: 'Custom File Type', extensions: ['as'] },
        { name: 'All Files', extensions: ['*'] }
    ]
    label.innerText = dialog.showOpenDialog(options);
 }


 /**
 * 选择目录 : openDirectory
 * createDirectory 创建目录，只是针对Mac OS系统
 * */ 
function chooseDir(params) {
    const label = document.getElementById("chooseDirLabel");
    var options = {};
    options.title = "选择目录";
    options.buttonLabel = "选择目录"
    options.properties = ['openDirectory','promptToCreate '];
    label.innerText = dialog.showOpenDialog(options);
}


 /**
 * 打开多个文件何目录
 * multiSelections-允许多选。
 * MAC ： 如果想同时选择多个文件何目录，需要指定openFile 和 openDirectory
 * Windows : 只需要指定openFile即可 ，若只选择openDirectory只可以选择目录
 * */ 

function chooseMoreFile(params) {
    const label = document.getElementById("chooseMoreFileLabel");
    var options = {};
    options.title = "选择多个目录和文件";
    options.buttonLabel = "选择多个目录和文件"
    options.properties = ['openFile','promptToCreate ','multiSelections'];
    label.innerText = dialog.showOpenDialog(options);
}

 /**
 * 通过回调函数返回选的的目录和文件
 * */ 

function callback_chooseMoreFile(params) {
    const label = document.getElementById("callback_chooseMoreFileLabel");
    var options = {};
    options.title = "选择多个目录和文件";
    options.buttonLabel = "选择多个目录和文件"
    options.properties = ['openFile','promptToCreate ','multiSelections'];
    if (process.platform == 'darwin') { // 如果是苹果系统，添加openDirectory
        options.properties.push('openDirectory');
    }
    dialog.showOpenDialog(options,(filePaths)=>{
        for (let index = 0; index < filePaths.length; index++) {
            label.innerText += filePaths[index]+'\r\n';
            
        }
    });
}


/**
 * 保存对话框  showSaveDialog
 * */ 

function showSaveDialogFun(params) {
    const label = document.getElementById("showSaveDialogLabel");
    var options = {};
    options.title = "保存文件";
    options.buttonLabel = "保存"
    options.defaultPath = 'F:\Electron'; // 打开文件的默认路径
    options.nameFieldLabel = "文件名输入框对应的自定义标签名";  //(MAC OS)
    // options.properties = ['openFile','promptToCreate ','multiSelections'];
    dialog.showSaveDialog(options,(fileName)=>{
        label.innerText = fileName;
    });
}

/**
 * 消息对话框 showMessageBox
 * */ 
function showMessageBoxFun(){
    const label = document.getElementById("showMessageBoxLabel");
    var options = {};

    options.title = '标题';
    options.buttons = ["ok1","cancel1"];
    options.icon = './src/assets/pig2.ico';
    options.message = "这是消息对话框的内容，content 飞流直下三千尺";
    options.checkboxChecked = false;
    label.innerText = dialog.showMessageBox(options);
}