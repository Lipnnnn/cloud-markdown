const qiniu = require('qiniu');
const axios = require('axios');
const fs = require('fs');

class QiniuManager {
  constructor(accessKey, secretKey, bucket) {
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.bucket = bucket;

    this.config = new qiniu.conf.Config();
    this.config.zone = qiniu.zone.Zone_z0;

    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
  }
  //   上传文件
  uploadFile(key, localFilePath) {
    var options = {
      scope: this.bucket + ':' + key,
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(this.mac);
    var formUploader = new qiniu.form_up.FormUploader(this.config);
    var putExtra = new qiniu.form_up.PutExtra();
    return new Promise((resolve, reject) => {
      formUploader.putFile(
        uploadToken,
        key,
        localFilePath,
        putExtra,
        this._handleCallback(resolve, reject),
      );
    });
  }

  //   删除文件
  deleteFile(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(
        this.bucket,
        key,
        this._handleCallback(resolve, reject),
      );
    });
  }

  //   获取publicBucketDomain，也就是存储空间的域名，在七牛云bucket存储空间可以查到，但是这里是使用七牛云官方提供的发送请求的方式去获取这个域名，下载文件时需要用到
  getBucketDomain() {
    const reqURL = `http://uc.qiniuapi.com/v2/domains?tbl=${this.bucket}`;
    const digest = qiniu.util.generateAccessToken(this.mac, reqURL);
    return new Promise((resolve, reject) => {
      qiniu.rpc.postWithoutForm(
        reqURL,
        digest,
        this._handleCallback(resolve, reject),
      );
    });
  }

  //  获取下载文件的地址
  generateDownloadLink(key) {
    const domainPromise = this.publicBucketDomain
      ? Promise.resolve([this.publicBucketDomain])
      : this.getBucketDomain();
    return domainPromise.then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const pattern = /^https?/;
        this.publicBucketDomain = pattern.test(data[0])
          ? data[0]
          : `http://${data[0]}`;
        return this.bucketManager.publicDownloadUrl(
          this.publicBucketDomain,
          key,
        );
      } else {
        throw Error('域名未找到，请查看存储空间是否过期');
      }
    });
  }

  //   下载文件
  downloadFile(key, downloadPath) {
    // 获取到下载链接
    return this.generateDownloadLink(key)
      .then((link) => {
        const timeStamp = new Date().getTime();
        const url = `${link}?timestamp=${timeStamp}`;
        return axios({
          method: 'get',
          url: url,
          responseType: 'stream',
          headers: { 'Cache-Control': 'no-cache' },
        });
      })
      .then((response) => {
        const writer = fs.createWriteStream(downloadPath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
      })
      .catch((err) => {
        return Promise.reject({ err: err.response });
      });
  }

  getStat(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.stat(
        this.bucket,
        key,
        this._handleCallback(resolve, reject),
      );
    });
  }

  //   写一个单独的出来回调的函数
  _handleCallback(resolve, reject) {
    return (respErr, respBody, respInfo) => {
      if (respErr) {
        throw respErr;
      }
      if (respInfo.statusCode === 200) {
        resolve(respBody);
      } else {
        reject({
          statusCode: respInfo.statusCode,
          body: respBody,
        });
      }
    };
  }

  renameFile(oldKey, newKey) {
      return new Promise((resolve, reject) => {
        this.bucketManager.move(
          this.bucket,
          oldKey,
          this.bucket,
          newKey,
          { force: true },
          this._handleCallback(resolve, reject)
        );
      });
    }
}

module.exports = QiniuManager;
