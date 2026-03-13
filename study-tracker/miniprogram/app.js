App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // 请替换为你的云开发环境 ID
        env: 'cloudbase-9g740el08e091da4',
        traceUser: true,
      });
    }

    this.globalData = {};
    
    // 初始化云端数据同步
    const cloudSync = require('./utils/cloudSync.js');
    this.cloudSyncPromise = cloudSync.initCloudSync();
  },

  globalData: {}
});
