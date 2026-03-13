Page({
  data: {},

  onCopyQQ: function () {
    wx.setClipboardData({
      data: '1306640926',
      success: function () {
        wx.showToast({ title: 'QQ已复制', icon: 'success' });
      }
    });
  }
});
