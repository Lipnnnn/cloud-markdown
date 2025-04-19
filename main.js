const { app, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
require('@electron/remote/main').initialize();
const Store = require('electron-store');
const menuTemplate = require('./src/menuTemplate');
const AppWindow = require('./src/AppWindow');
const QiniuManager = require('./src/utils/QiniuManager.js');
const settingsStore = new Store({ name: 'Settings' });
const fileStore = new Store({ name: 'Files Data' });
const { v4: uuidv4 } = require('uuid');
const fileHelper = require('./src/utils/fileHelper');

Store.initRenderer();

let mainWindow, settingsWindow;

const createManager = () => {
  const AccessKey = settingsStore.get('AccessKey');
  const SecretKey = settingsStore.get('SecretKey');
  const Bucket = settingsStore.get('Bucket');
  return new QiniuManager(AccessKey, SecretKey, Bucket);
};

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
  // 创建菜单
  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  // 监听窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 550,
      height: 500,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    };
    const settingsFileLocation = `file://${path.join(__dirname, 'settings', 'settings.html')}`;
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation);
    // 移除菜单
    settingsWindow.removeMenu();
    // 为设置窗口启用 remote
    require('@electron/remote/main').enable(settingsWindow.webContents);

    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  });

  ipcMain.on('config-is-saved', () => {
    let qiniuMenu =
      process.platform === 'darwin' ? menu.items[3] : menu.items[2];
    const switchItems = (toggle) => {
      [1, 2, 3].forEach((number) => {
        qiniuMenu.submenu.items[number].enabled = toggle;
      });
    };
    const qiniuIsConfiged = ['AccessKey', 'SecretKey', 'Bucket'].every(
      (key) => {
        return !!settingsStore.get(key);
      },
    );
    if (qiniuIsConfiged) {
      switchItems(true);
    } else {
      switchItems(false);
    }
  });

  ipcMain.on('upload-file', (event, data) => {
    const manager = createManager();
    manager
      .uploadFile(data.key, data.path)
      .then((data) => {
        console.log('上传成功', data);
        mainWindow.webContents.send('active-file-uploaded');
      })
      .catch(() => {
        dialog.showErrorBox('同步失败', '请检查七牛云配置参数是否正确');
      });
  });

  ipcMain.on('download-file', (event, data) => {
    const manager = createManager();
    const file = fileStore.get('files');
    const { key, path, id } = data;
    manager.getStat(data.key).then(
      (resp) => {
        const serverUpdatedTime = Math.round(resp.putTime / 10000);
        const localUpdatedTime = file.updatedAt;
        if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
          manager.downloadFile(key, path).then(() => {
            mainWindow.webContents.send('file-downloaded', {
              status: 'download-success',
              id,
            });
          });
        } else {
          mainWindow.webContents.send('file-downloaded', {
            status: 'no-new-file',
            id,
          });
        }
      },
      (error) => {
        if (error.statusCode === 612) {
          mainWindow.webContents.send('file-downloaded', {
            status: 'no-file',
            id,
          });
        }
      },
    );
  });

  ipcMain.on('upload-all-to-qiniu', () => {
    mainWindow.webContents.send('loading-status', true);
    const files = fileStore.get('files') || [];
    const manager = createManager();
    const uploadPromiseArr = files.map((file) => {
      return manager.uploadFile(`${file.title}.md`, file.path);
    });
    Promise.all(uploadPromiseArr)
      .then((data) => {
        console.log('上传成功', data);
        dialog.showMessageBox({
          type: 'info',
          title: '提示',
          message: `成功上传了${data.length}个文件`,
        });
        mainWindow.webContents.send('files-uploaded');
      })
      .catch(() => {
        dialog.showErrorBox('同步失败', '请检查七牛云配置参数是否正确');
      })
      .finally(() => {
        mainWindow.webContents.send('loading-status', false);
      });
  });

  ipcMain.on('delete-file', (event, data) => {
    const manager = createManager();
    manager
      .deleteFile(data.key)
      .then(() => {
        event.reply('file-deleted');
      })
      .catch(() => {
        dialog.showErrorBox('删除失败', '请检查七牛云配置参数是否正确');
      });
  });

  ipcMain.on('rename-file', (event, data) => {
    const manager = createManager();
    manager
      .renameFile(data.oldKey, data.newKey)
      .then(() => {
        event.reply('file-renamed');
      })
      .catch(() => {
        dialog.showErrorBox('重命名失败', '请检查七牛云配置参数是否正确');
      });
  });

  // 添加从七牛云下载所有文件的事件处理

  // 修改下载处理代码
  ipcMain.on('download-all-from-qiniu', () => {
    mainWindow.webContents.send('loading-status', true);
    const manager = createManager();
    const savedLocation = settingsStore.get('savedFileLocation') || app.getPath('documents');
    const existingFiles = fileStore.get('files') || [];

    manager
      .listPrefix()
      .then((data) => {
        const downloadPromiseArr = data.items.map((item) => {
          const title = item.key.replace('.md', '');
          const filePath = path.join(savedLocation, item.key);
          // 查找是否存在相同标题的本地文件
          const existingFile = existingFiles.find(file => file.title === title);
          
          return manager
            .downloadFile(item.key, filePath)
            .then(() => fileHelper.readFile(filePath))
            .then((content) => ({
              id: existingFile ? existingFile.id : uuidv4(), // 如果存在就使用原id
              title,
              path: filePath,
              body: content,
            }));
        });

        Promise.all(downloadPromiseArr)
          .then((results) => {
            const newFiles = results.map((file) => ({
              ...file,  // 保留原有的 id
              isLoaded: true,
              isSynced: true,
              updateAt: new Date().getTime(),
            }));

            // 保存到 fileStore
            const existingFiles = fileStore.get('files') || [];
            const updatedFiles = [...existingFiles, ...newFiles];
            fileStore.set('files', updatedFiles);

            mainWindow.webContents.send('files-downloaded', newFiles);
            dialog.showMessageBox({
              type: 'info',
              title: '下载完成',
              message: `成功下载了${results.length}个文件`,
            });
          })
          .catch(() => {
            dialog.showErrorBox('下载失败', '请检查七牛云配置参数是否正确');
          })
          .finally(() => {
            mainWindow.webContents.send('loading-status', false);
          });
      })
      .catch(() => {
        dialog.showErrorBox('下载失败', '获取七牛云文件列表失败');
        mainWindow.webContents.send('loading-status', false);
      });
  });
  // 在创建窗口后启用
  require('@electron/remote/main').enable(mainWindow.webContents);
});
