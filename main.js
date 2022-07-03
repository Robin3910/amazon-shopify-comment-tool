const {app, BrowserWindow, ipcMain} = require('electron');
const exec = require('child_process').exec;
let mainWin;
// const cmd = require('node-cmd');

function start(asin, prod, minRating, num) {
    // dev环境cmdStr
    // let cmdStr = `node ./cli.js reviews ${asin} -n ${num} --min-rating ${minRating} -prod ${prod}`;

    // prod环境
    let cmdStr = `node ./resources/app/cli.js reviews ${asin} -n ${num} --min-rating ${minRating} -prod ${prod}`;

    // 子进程名称
    let workerProcess
    runExec(cmdStr)

    function runExec(cmdStr) {
        console.log('exec cmd: ', cmdStr);
        workerProcess = exec(cmdStr);
        // 打印正常的后台可执行程序输出
        workerProcess.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
            mainWin.webContents.send("receiveMessage", data);
        })
        // 打印错误的后台可执行程序输出
        workerProcess.stderr.on('data', function (data) {
            console.log('stderr: ' + data)
        })
        // 退出之后的输出
        workerProcess.on('close', function (code) {
            console.log('out code：' + code)
            mainWin.webContents.send("receiveMessage", "grab success!!");
        })
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            nodeIntegration: true, // 集合node进程
            contextIsolation: false
        },
    });

    mainWin = win;


    win.loadFile('index.html')
    win.webContents.openDevTools({mode: 'right'});

    ipcMain.on("sendMessage", (event, args) => {
        console.log("收到渲染进程的消息", args);
        win.webContents.send("receiveMessage", "received message: " + args); // 响应渲染进程
        const {asin, prod, minRating, number} = args;
        start(asin, prod, minRating, number);
    });
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})


