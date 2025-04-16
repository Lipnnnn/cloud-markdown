const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
require('@electron/remote/main').initialize();
const Store = require('electron-store');
const menuTemplate = require('./src/menuTemplate');
const AppWindow = require('./src/AppWindow');

Store.initRenderer();

let mainWindow, settingsWindow;

app.on('ready', () => {
  const mainWindowConfig = {
    width: 1024,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // 添加这一行来解决 global is not defined 的问题
      nodeIntegrationInWorker: true,
    },
  };
  const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl';
  // 创建窗口
  mainWindow = new AppWindow(mainWindowConfig, urlLocation);
  // 监听窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    };
    const settingsFileLocation = `file://${path.join(__dirname, 'settings', 'settings.html')}`;
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation);
    // 为设置窗口启用 remote
    require('@electron/remote/main').enable(settingsWindow.webContents);
    
    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  });

  // 在创建窗口后启用
  require('@electron/remote/main').enable(mainWindow.webContents);

  // 创建菜单
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
