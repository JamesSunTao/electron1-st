
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
 * 
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