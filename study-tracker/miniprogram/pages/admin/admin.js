const db = wx.cloud.database();

Page({
  data: {
    targetOpenId: '',
    addHours: '',
    addPoints: ''
  },
  
  onInputOpenId: function(e) {
    this.setData({ targetOpenId: e.detail.value.trim() });
  },
  
  onInputHours: function(e) {
    this.setData({ addHours: e.detail.value.trim() });
  },
  
  onInputPoints: function(e) {
    this.setData({ addPoints: e.detail.value.trim() });
  },
  
  callAdminFunc: function(action, payload) {
    wx.showLoading({ title: '修改中...' });
    wx.cloud.callFunction({
      name: 'adminUpdateData',
      data: {
        action: action,
        targetOpenId: this.data.targetOpenId || undefined,
        payload: payload
      }
    }).then(res => {
      wx.hideLoading();
      if(res.result && res.result.success) {
        wx.showToast({ title: '操作成功', icon: 'success' });
        // 请求重新同步状态
        setTimeout(() => {
          require('../../utils/cloudSync.js').initCloudSync();
        }, 1500);
      } else {
        wx.showModal({ title: '操作失败', content: (res.result && res.result.error) || '未知错误', showCancel: false });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showModal({ title: '云函数调用异常', content: err.message || JSON.stringify(err), showCancel: false });
      console.error(err);
    });
  },

  onAddStudyTime: function() {
    const hours = parseFloat(this.data.addHours);
    if(isNaN(hours) || hours <= 0) return wx.showToast({ title: '请输入有效的小时数', icon: 'none' });
    this.callAdminFunc('addStudyTime', { hours: hours });
  },

  onAddMallPoints: function() {
    const points = parseInt(this.data.addPoints);
    if(isNaN(points) || points <= 0) return wx.showToast({ title: '请输入有效的点数', icon: 'none' });
    this.callAdminFunc('addMallPoints', { points: points });
  },

  onResetFreePulls: function() {
    wx.showModal({
      title: '确认恢复',
      content: '确定要重置由于今天抽签扣减的相关记录吗？',
      success: (res) => {
        if(res.confirm) {
          this.callAdminFunc('resetFreePulls', {});
        }
      }
    });
  },

  onResetAllData: function() {
    wx.showModal({
      title: '危险操作',
      content: '确认彻底清空该账号（商城、等级、全量时长、所有配置）数据？此操作不可逆！',
      confirmColor: '#e74c3c',
      success: (res) => {
        if(res.confirm) {
          this.callAdminFunc('resetAllData', {});
        }
      }
    });
  }
});
