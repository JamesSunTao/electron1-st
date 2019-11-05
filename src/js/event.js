const remote = require('electron').remote
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