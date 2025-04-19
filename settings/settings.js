const remote = require('@electron/remote');
const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const settingsStore = new Store({ name: 'Settings' });

const $ = (id) => {
  return document.getElementById(id);
};

// 添加标签页切换功能
document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // 移除所有活动状态
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));

      // 添加当前选中标签的活动状态
      btn.classList.add('active');
      const panelId = `${btn.dataset.tab}-panel`;
      document.getElementById(panelId).classList.add('active');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // 文件存储位置
  let savedLocation = settingsStore.get('savedFileLocation');
  if (savedLocation) {
    $('saved-file-location').value = savedLocation;
  }
  $('select-new-location').addEventListener('click', async () => {
    const result = await remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      buttonLabel: '选择',
      title: '选择文件夹',
    });
    if (Array.isArray(result.filePaths)) {
      $('saved-file-location').value = result.filePaths[0];
      savedLocation = result.filePaths[0];
    }
  });

  $('settings-form').addEventListener('click', () => {
    settingsStore.set('savedFileLocation', savedLocation);
    remote.getCurrentWindow().close();
  });

  // 七牛云同步
  let AccessKey = settingsStore.get('AccessKey');
  let SecretKey = settingsStore.get('SecretKey');
  let Bucket = settingsStore.get('Bucket');
  if (AccessKey) {
    $('accessKey').value = AccessKey;
  }
  if (SecretKey) {
    $('secretKey').value = SecretKey;
  }
  if (Bucket) {
    $('bucket').value = Bucket;
  }

  // 监听输入框值的变化
  $('accessKey').addEventListener('input', (e) => {
    AccessKey = e.target.value;
  });

  $('secretKey').addEventListener('input', (e) => {
    SecretKey = e.target.value;
  });

  $('bucket').addEventListener('input', (e) => {
    Bucket = e.target.value;
  });

  $('save-qiniu-settings').addEventListener('click', () => {
    settingsStore.set('AccessKey', AccessKey);
    settingsStore.set('SecretKey', SecretKey);
    settingsStore.set('Bucket', Bucket);
    ipcRenderer.send('config-is-saved');
    remote.getCurrentWindow().close();
  });
});
