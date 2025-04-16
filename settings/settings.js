const remote = require('@electron/remote');
const Store = require('electron-store');
const settingsStore = new Store({ name: 'Settings' });

const $ = (id) => {
  return document.getElementById(id);
};

document.addEventListener('DOMContentLoaded', () => {
  let savedLocation = settingsStore.get('savedFileLocation');
  if (savedLocation) {
    $('saved-file-location').value = savedLocation;
  }
  $('select-new-location').addEventListener('click', async () => {
    console.log('aaaa');

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
});
