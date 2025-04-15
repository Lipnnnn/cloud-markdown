const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;  // 使用 app.isPackaged 来判断是否是开发环境
require('@electron/remote/main').initialize();

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // 在创建窗口后启用
  require('@electron/remote/main').enable(mainWindow.webContents);

  const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './build/index.html')}`;
  mainWindow.loadURL(urlLocation);

  mainWindow.webContents.openDevTools();
});
