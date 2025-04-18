const QiniuManager = require('./src/utils/QiniuManager.js');
const path = require('path');

const accessKey = '85BAlurYuxFlSMxaZJnQse6C_TTZikbuwkY_vhDR';
const secretKey = 'IPt4iSJP40XeopnP6jGZtvlw-XbwXL360sARHsmI';

// 修改为 Windows 格式的文件路径
const localFile = 'C:\\Users\\23130\\Desktop\\个人网站.txt';
const key = 'hhh.md';
const publicBucketDomain = 'http://suvdj5wdd.hd-bkt.clouddn.com';
const downloadPath = path.join(__dirname, key);

const manager = new QiniuManager(accessKey, secretKey, 'cloudmarkdown');
// manager
//   .uploadFile(key, localFile)
//   .then((data) => {
//     console.log('上传成功', data);
//     return manager.deleteFile(key);
//   })
//   .then((data) => {
//     console.log('删除成功', data);
//   });
// manager.deleteFile(key);

// manager.generateDownloadLink(key).then((data) => {
//   console.log(data);
// });

manager.downloadFile(key, downloadPath).then(() => {
  console.log('下载成功');
});
