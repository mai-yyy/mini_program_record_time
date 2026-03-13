const util = require('../../utils/util.js');
const mallUtil = require('../../utils/mall.js');

const db = wx.cloud.database();
const sessionsCollection = db.collection('study_sessions');

const STUDY_BADGES = [
  { id: 'study-10', title: '学习新星', desc: '累计学习达到 10 小时', icon: '🌟', hours: 10 },
  { id: 'study-50', title: '专注进阶', desc: '累计学习达到 50 小时', icon: '🔥', hours: 50 },
  { id: 'study-100', title: '自律达人', desc: '累计学习达到 100 小时', icon: '🏅', hours: 100 },
  { id: 'study-300', title: '深度修行', desc: '累计学习达到 300 小时', icon: '👑', hours: 300 }
];

const DECORATION_BADGES = [
  { id: 'avatar-1', title: '头像收藏', desc: '解锁任意 1 款商城头像', icon: '🧸', target: 1, key: 'avatar' },
  { id: 'theme-1', title: '装扮入门', desc: '解锁任意 1 款页面装扮', icon: '🎨', target: 1, key: 'theme' },
  { id: 'decor-3', title: '收集达人', desc: '累计解锁 3 项头像或装扮', icon: '🎁', target: 3, key: 'all' }
];

function buildThemeStyleState(userInfo) {
  return {
    themePageStyle: userInfo.themePageBg ? `background: ${userInfo.themePageBg};` : '',
    themeCardStyle: userInfo.themeCardBg ? `background: ${userInfo.themeCardBg};` : ''
  };
}

function buildStudyBadges(hours) {
  return STUDY_BADGES.map(badge => {
    const unlocked = hours >= badge.hours;
    return {
      ...badge,
      unlocked,
      progressText: unlocked ? '已解锁' : `还差 ${Math.max(0, Math.ceil(badge.hours - hours))} 小时`
    };
  });
}

function buildDecorationBadges(mallState) {
  const avatarCount = mallState.unlockedAvatarIds.length;
  const themeCount = mallState.unlockedThemeIds.length;
  const allCount = avatarCount + themeCount;

  return DECORATION_BADGES.map(badge => {
    let current = allCount;
    if (badge.key === 'avatar') {
      current = avatarCount;
    }
    if (badge.key === 'theme') {
      current = themeCount;
    }

    const unlocked = current >= badge.target;
    return {
      ...badge,
      unlocked,
      progressText: unlocked ? '已解锁' : `进度 ${current}/${badge.target}`
    };
  });
}

Page({
  data: {
    themePageStyle: '',
    themeCardStyle: '',
    totalDuration: '0分钟',
    unlockedCount: 0,
    totalBadges: 0,
    unlockedBadges: 0,
    studyBadges: [],
    decorationBadges: [],
    isLoading: false
  },

  onShow: function () {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      ...buildThemeStyleState(userInfo)
    });
    this.loadAchievements();
  },

  loadAchievements: function () {
    this.setData({ isLoading: true });

    sessionsCollection
      .orderBy('date', 'desc')
      .limit(1000)
      .get()
      .then(res => {
        let allMin = 0;
        res.data.forEach(session => {
          allMin += session.durationMinutes;
        });

        const cumulativeHours = allMin / 60;
        const mallState = mallUtil.getMallState();
        const studyBadges = buildStudyBadges(cumulativeHours);
        const decorationBadges = buildDecorationBadges(mallState);
        const allBadges = studyBadges.concat(decorationBadges);
        const unlockedBadges = allBadges.filter(item => item.unlocked).length;

        this.setData({
          totalDuration: util.formatDuration(allMin),
          unlockedCount: mallState.unlockedAvatarIds.length + mallState.unlockedThemeIds.length,
          totalBadges: allBadges.length,
          unlockedBadges,
          studyBadges,
          decorationBadges,
          isLoading: false
        });
      })
      .catch(err => {
        console.error('加载成就失败', err);
        this.setData({ isLoading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  }
});
