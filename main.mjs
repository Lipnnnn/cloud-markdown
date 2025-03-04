import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    // 设置在web环境可以使用node.js
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // 在开发环境让electron的mainWindow加载http://localhost:3000页面
  const urlLocation = isDev ? 'http://localhost:3000' : 'url';
  mainWindow.loadURL(urlLocation);
  // 打开开发者工具
  mainWindow.webContents.openDevTools();
});
