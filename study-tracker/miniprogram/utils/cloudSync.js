let syncPromise = null;
let isSyncing = false;

function initCloudSync() {
  if (syncPromise) return syncPromise;
  
  syncPromise = new Promise((resolve) => {
    isSyncing = true;
    wx.cloud.callFunction({
      name: 'syncUserData',
      data: {
        action: 'get'
      }
    }).then(res => {
      if (res.result && res.result.data) {
        const cloudData = res.result.data;
        // 如果云端有数据，覆盖本地缓存，实现各设备同步和防止清缓存丢失
        if (cloudData.mallState && Object.keys(cloudData.mallState).length > 0) {
          wx.setStorageSync('mallState', cloudData.mallState);
        }
        if (cloudData.vipRewardState && Object.keys(cloudData.vipRewardState).length > 0) {
          wx.setStorageSync('vipRewardState', cloudData.vipRewardState);
        }
        if (cloudData.userInfo && Object.keys(cloudData.userInfo).length > 0) {
          wx.setStorageSync('userInfo', cloudData.userInfo);
        }
      }
      isSyncing = false;
      resolve();
    }).catch(err => {
      console.error('Cloud sync failed:', err);
      isSyncing = false;
      resolve();
    });
  });
  
  return syncPromise;
}

function pushToCloud(key, data) {
  if (isSyncing) return; // 避免初始化期间覆盖云端
  
  wx.cloud.callFunction({
    name: 'syncUserData',
    data: {
      action: 'update',
      key: key,
      data: data
    }
  }).catch(err => {
    console.error(`Failed to sync ${key} to cloud:`, err);
  });
}

// 通用状态保存与同步方法
function saveAndSyncState(key, state) {
  wx.setStorageSync(key, state);
  pushToCloud(key, state);
}

module.exports = {
  initCloudSync,
  pushToCloud,
  saveAndSyncState
};
