const util = require('../../utils/util.js');
const memberUtil = require('../../utils/member.js');
const mallUtil = require('../../utils/mall.js');

const db = wx.cloud.database();
const sessionsCollection = db.collection('study_sessions');

function buildThemeStyleState(userInfo) {
  return {
    themePageStyle: userInfo.themePageBg ? `background: ${userInfo.themePageBg};` : '',
    themeCardStyle: userInfo.themeCardBg ? `background: ${userInfo.themeCardBg};` : ''
  };
}

function applyTabBarTheme(userInfo) {
  if (typeof wx.setTabBarStyle !== 'function') {
    return;
  }

  wx.setTabBarStyle({
    color: '#8c8c8c',
    selectedColor: '#4A90D9',
    backgroundColor: userInfo.themeTabBarBg || '#ffffff',
    borderStyle: 'white'
  });
}

Page({
  data: {
    name: '刘',
    memberLevel: '见习会员',
    studyPoints: 0,
    allTotal: '0分钟',
    isLoading: false,
    themePageStyle: '',
    themeCardStyle: '',
    animateTrigger: false
  },

  onShow: function () {
    // 只有从其他 tabBar 切换过来时才播放进场动画，从子页面返回时不播放
    if (!this._comingFromSubPage) {
      this.playTabEnter();
    }
    this._comingFromSubPage = false;

    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      name: userInfo.name || '刘',
      avatarText: userInfo.avatarText || (userInfo.name ? userInfo.name[0] : '刘'),
      avatarBg: userInfo.avatarBg || 'linear-gradient(135deg, #4A90D9, #357ABD)',
      gender: userInfo.gender || '',
      motto: userInfo.motto || '',
      ...buildThemeStyleState(userInfo)
    });
    applyTabBarTheme(userInfo);
    this.loadStats();
  },

  onHide: function () {
    if (this.enterTimer) {
      clearTimeout(this.enterTimer);
    }
  },

  onUnload: function () {
    if (this.enterTimer) {
      clearTimeout(this.enterTimer);
    }
  },

  playTabEnter: function () {
    if (this.enterTimer) {
      clearTimeout(this.enterTimer);
    }

    this.setData({ animateTrigger: false });
    this.enterTimer = setTimeout(() => {
      this.setData({ animateTrigger: true });
    }, 40);
  },

  loadStats: function () {
    this.setData({ isLoading: true });

    sessionsCollection
      .orderBy('date', 'desc')
      .limit(1000)
      .get()
      .then(res => {
        this.calcStats(res.data);
        this.setData({ isLoading: false });
      })
      .catch(err => {
        console.error('查询统计失败', err);
        this.setData({ isLoading: false });
      });
  },

  calcStats: function (sessions) {
    const monthStart = util.getMonthStart();

    let monthMin = 0;
    let allMin = 0;

    sessions.forEach(session => {
      allMin += session.durationMinutes;
      if (session.date >= monthStart) {
        monthMin += session.durationMinutes;
      }
    });

    const cumulativeHours = allMin / 60;
    const pointSummary = memberUtil.calculateTotalPoints(monthMin);
    const wallet = mallUtil.calculateAvailablePoints(pointSummary.totalPoints);
    const currentTier = memberUtil.getTierByHours(cumulativeHours);

    wx.setStorageSync('userCumulativeHours', cumulativeHours);

    this.setData({
      allTotal: util.formatDuration(allMin),
      studyPoints: wallet.availablePoints,
      memberLevel: currentTier.level,
      memberBg: currentTier.bgImage
    });
  },

  // 导航到子页面时先标记，避免 onShow 重复播放动画
  onTapPoints: function () {
    this._comingFromSubPage = true;
    wx.navigateTo({ url: '/pages/points/points' });
  },

  onTapAchievements: function () {
    this._comingFromSubPage = true;
    wx.navigateTo({ url: '/pages/achievements/achievements' });
  },

  onTapEditProfile: function () {
    this._comingFromSubPage = true;
    wx.navigateTo({ url: '/pages/edit-profile/edit-profile' });
  },

  onTapVip: function () {
    this._comingFromSubPage = true;
    wx.navigateTo({ url: '/pages/vip/vip' });
  },

  onTapMall: function () {
    this._comingFromSubPage = true;
    wx.navigateTo({ url: '/pages/mall/mall' });
  },

  onTapAbout: function () {
    this._comingFromSubPage = true;
    wx.navigateTo({ url: '/pages/about/about' });
  }
});
