
const remote = require('electron').remote
const BrowserWindow = remote.BrowserWindow
const {Menu,MenuItem} = require('electron').remote

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

// 动态设置窗口大小
function setSizePosition(params) {
    const win = remote.getCurrentWindow();
    win.setSize(300,300,true)
    win.setPosition(10,10)
}

// 锁定窗口
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

//  创建子窗口
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
    
    // 接受 postMessage 传递过来的数据  origin 文件来源，是谁打开了子串口返回的是index.html页面的域名
        window.addEventListener("message",function(e) {
        messageData.innerText = e.data + "——来源："+ e.origin;

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
 * 消息对话框 showMessageBox  ，错误对话框 ：showErrorBox（用法跟showMessageBox一样）
 * type: 设置消息对话框类型
 * none ：默认对话框
 * info ： 信息对话框
 * warning ：警告对话框
 * question ： 询问对话框
 * error ： 错误对话框
 * */ 
function showMessageBoxFun(){
    const label = document.getElementById("showMessageBoxLabel");
    var options = {};

    options.title = '标题';
    options.buttons = ["按钮1","按钮2","按钮3"];
    options.type = "question";
    // options.icon = './src/assets/pig2.ico'; 
    options.message = "这是消息对话框的内容，content 飞流直下三千尺";
    dialog.showMessageBox(options,(res)=>{
        label.innerText = `单击了${options.buttons[res]}`
    });
}


/**
 * 使用html5 API创建子窗口
 * window.open 使用 window.open 创建一个新窗口时会返回一个 BrowserWindowProxy对象，并提供一个有限功能的子窗口.
 * window.open(url[, title][, attributes])
 * url ：打开页面的链接
 * title :设置页面标题，如已经设置则忽略
 * attributes： 可设置与窗口相关的属性
 * 
 * 
 * BrowserWindowProxy 可以认为是BrowserWindow的代理类
 * 
 * 控制窗口
 * window.blur()
 * window.focus()
 * window.close()，
 * window.print()
 * win.eval() 用来执行JavaScript代码
 * */ 
function openChildWindow() {
   winChild = window.open('./child.html',"子页面","width=500,height=400");
//    win = window.open('https://www.baidu.com/')  // 使用 window.open 创建一个新窗口时会返回一个 BrowserWindowProxy对象，并提供一个有限功能的子窗口. 
  
} 

function focusWindow() {
    if (winChild != undefined) {
        winChild.focus()   
    }  
}
function blurWindow() {
    if (winChild != undefined) {
        winChild.blur()   
    }   
}
function closeWindow() {
    winChild.close();
}
function printWindow() {
    winChild.print();
}

/**
 * postMessage 窗口信息传递
 * */ 
function sendMessage() {
    if (winChild != undefined) {
        // electron 新特性,可以利用Id直接访问value
        winChild.postMessage(messageData.value,"*");   
    }   
}

/**
 * 向子窗口发送可执行的JavaScript代码，win.eval()
 * */ 
function evalSendMessage() {
    if (winChild != undefined) {
        // electron 新特性,可以利用Id直接访问value
        winChild.eval('messageData.innerText="'+evalSendMessageInput.value+'"');   
    }   
}


/**
 * 在窗口嵌入web页面
 * 1。 <webview>
 * 2. webview 事件
 * 3。 在<webview>中装载页面中执行NODE.js API
 * 4. webview 常用的API
 * */ 


function openWebviewPage(params) {
    win_webview = window.open('./webview.html','webView页面')
}


// 使用webview装在页面
function onloadWebview(params) {
    const webview1 = document.getElementById('webview1')
    const indicator = document.getElementById('indicator')

    const loadstart1 = () => {
        console.log('loading......')
      indicator.innerText = 'loading...'
    }

    const loadstop = () => {
        console.log('stop......')
      indicator.innerText = 'stop!!!!!'
    }

    webview1.addEventListener('did-start-loading', loadstart1)
    webview1.addEventListener('did-stop-loading', loadstop)
}


function test_webviewAPI(params) {
    webview = document.getElementById('webview1')
    let title = webview.getTitle(),url = webview.getURL()
    console.log("title:"+title+'\r\n'+"url:"+url)
    console.log(webview)
    // webview.openDevTools()/
}

/**
*任务栏进度条 windows (桌面图标显示的进度)
*/ 
function click_progressBar(params) {
    const Win = remote.getCurrentWindow();
    Win.setProgressBar(0.5);
}


/**
 * 
 * */ 
function  clickSave(params) {
    const Win = new BrowserWindow({width:500,height:300});
    Win.loadURL('https://www.baidu.com/')
}

/**
 * 添加初始菜单
 * */ 
var customMenu = new Menu();
function setOriginMenu(params) {
     const menu = new Menu();
     var menuItemOPen = new MenuItem({label:'打开'});
     var saveMenuItem= new MenuItem({label:'保存',click:clickSave});
     var saveMenuFile= new MenuItem({label:'文件',submenu:[menuItemOPen,saveMenuItem]});

     menuItemCustom = new MenuItem({label:'定制菜单',submenu:customMenu})
     menu.append(saveMenuFile);
     menu.append(menuItemCustom);
     Menu.setApplicationMenu(menu);
}
 
/**
 * 动态添加菜单
 * */ 
function addMenuItem() {
   var type = 'normal';
   if (radio.checked) {  
       type = 'radio'
   } 
   if (checkbox.checked) {
    type = 'checkbox'
   } 
   customMenu.append(new MenuItem({label:menuItem.value,type:type}))
   menuItem.value = '';
   checkbox.checked = false;
   radio.checked = false;
   Menu.setApplicationMenu(Menu.getApplicationMenu())
}


/**
 * 上下文菜单
 * */ 
function onload(params) {
    const menu =  new Menu();
    const win = new BrowserWindow();
    var menuItemOpen = new MenuItem({label:'打开',click:()=>{
        var paths = dialog.showOpenDialog({properties:['openFile']});
        if (paths != undefined) {
            console.log(paths)
            // win.setTitle(paths[0]);
        }
    }})

    var menuItemSave = new MenuItem({label:'保存',click:saveClick});
    var menuItemFile = new MenuItem({label:'文件',submenu:[menuItemOpen,menuItemSave]});

    var menuItemInsertImage = new MenuItem({label:'插入图像'});
    var menuItemDelImage = new MenuItem({label:'删除图像'});

    menu.append(menuItemFile);
    menu.append(menuItemInsertImage);
    menu.append(menuItemDelImage)

    panel.addEventListener('contextmenu',function (event) {
        event.preventDefault();
        x = event.x;
        y = event.y;
        menu.popup({x:x,y:y});
        return false;
    })
}

function saveClick(params) {
    var win = new BrowserWindow({width:300,height:200});
    win.loadURL('https://www.baidu.com/')
}


/**
 * 托盘应用
 * */ 


