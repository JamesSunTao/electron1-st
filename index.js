const { app, BrowserWindow ,Menu} = require('electron')

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win , childWin , modelWin
/**
 * width
 * height
 * minWidth
 * minHeight
 * maxHeight
 * maxWidth:800,
 * x 初始相对于窗口x的位置
 * y 初始相对于窗口y的位置
 * fullscreen 全屏窗口
 * setFullScreen 可动态设置窗口全屏
 * isFullScreen 判断当前窗口是否全屏
 * kiosk 窗口锁定  （全屏状态下窗口锁定，mac下Command+q退出，windows下菜单退出）
 * 
 * 模态窗口是禁用父窗口的子窗口，创建模态窗口必须设置 parent 和 modal 选项,模态窗口显示时无法点击父窗口
 * */ 

/**
 * 窗口间的数据交互，使用IPC （interProcess Communication，进程间通讯）方式在窗口间传递数据
 * ipcMain (用于主窗口)和 ipcRenderer（用于其他窗口） 
 * 主窗口window1 其他窗口：window2
 * window1 -》 window2
 * window2会通过ipcRenderer触发一个事件，用于接收window1传递过来的数据，在window2关闭时，会通过ipcRenderer给window1发送消息，window1
 * 通过ipcMain接受window2传递过来的数据
 * 
 * */  
function createWindow () {
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth:300,
    minHeight:400,
    title:'研学平台',
    // backgroundColor:'#fb6501', // 窗口背景颜色
    // maxHeight:600,
    // maxWidth:800,
    // fullscreen:true,
    // kiosk:true,
    // x:20,
    // y:20,
    // frame:false, //有无边框 默认为true 有边框
    // transparent:true, //是否为透明窗口
    // alpha:"#41e0c8", //transparent为true方可支持alpha属性，格式为#AARRGGBB)。 默认值为 #FFF（白色）
    icon:'./src/assets/basketball.ico',
    show:false, // 是否显示窗口
    webPreferences: { //网页功能的设置
      nodeIntegration: true, // 是否集成node
    }
  })

  //创建子窗口  (mac下子窗口会随着父窗口移动，windows下则不会)
  // childWin = new BrowserWindow({
  //   parent:win,
  //   width: 400,
  //   height: 300,
  // })

  // modelWin = new BrowserWindow({
  //   parent:win,
  //   modal: true,
  //   width: 400,
  //   height: 300,
  //   show:false
  // })


  // 加载index.html文件
  win.loadFile('index.html')
  // modelWin.loadFile('child.html')  

 // 定义菜单模板
 /**
 使用模板创建应用菜单
 * 
 * 1. 应用菜单 （窗口菜单）
 *    windows 、Linux 和 MAc OS x
 * 2. 上下文菜单 
 * 
 * 编写菜单方法：
 * 1.模板
 *    
 * 2. 代码
 * 
 * 菜单类型 （type:）
 * 1-5: normal, separator, submenu, checkbox or radio
 * */  



 const template = [
   { label:'文件',
     submenu:[
       {
         label:'关于',
         role: 'about' , //只针对Mac
         type: 'checkbox', checked: true 
        },
        {
          type:'separator' // 分割条
        },
        {
          label:'关闭',
          accelerator:'Ctrl+Q',
          click:()=>{win.close()}
        },
        {
          label:'剪切',
          role:'cut'
        },
        {
          label:'粘补',
          role:'paste'
        },
        {
          type:'separator' // 分割条
        },
        {
          label:'单选1',
          type:'radio' 
        },
        {
          label:'单选2',
          type:'radio' 
        },  
        {
          label:'单选3',
          type:'radio' 
        },
        {
          type:'separator' // 分割条
        },
        { role: 'quit' },
        {
          label:'windows',
          type:'submenu',
          role:'windowMenu'
        }
     ]
   },
   {label:'编辑',submenu:[
     {
       label:'复制',
       click:()=>{win.webContents.insertText('复制')},
     },
     {
      label:'剪切',
      click:()=>{win.webContents.insertText('剪切')},
    },
    {
      type:'separator' // 分割条R
    },
    {
      label:'查找',
      accelerator:'Ctrl+R',
      click:()=>{win.webContents.insertText('查找')}
    },
    {
      label:'单选1',
      type:'radio' 
    },
    {
      label:'单选2',
      type:'radio' 
    },  
    {
      label:'单选3',
      type:'radio' 
    },
   ]}
 ]
 const menu = Menu.buildFromTemplate(template);
 Menu.setApplicationMenu(menu)

  // 打开开发者工具
  win.webContents.openDevTools()

  win.on('ready-to-show', ()=>{ // 页面装载完再显示，这样就不会有窗口空白等待时间
    win.show();
  })
  
  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。