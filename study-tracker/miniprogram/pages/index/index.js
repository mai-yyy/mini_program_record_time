const util = require('../../utils/util.js');
const memberUtil = require('../../utils/member.js');

const db = wx.cloud.database();
const sessionsCollection = db.collection('study_sessions');

// 皮肤配置表 —— id 对应 edit-profile 和 mall 里定义的 skin id
const TIMER_SKIN_STYLES = {
  'skin-default': {
    name: '经典数字',
    cardBg: 'linear-gradient(135deg, #c2ace8 0%, #d7a6db 50%, #b4c722 100%)',
    numberColor: '#ffffff',
    unitColor: 'rgba(255,255,255,0.85)',
    labelColor: 'rgba(255,255,255,0.85)',
    progressBg: 'rgba(255,255,255,0.25)',
    progressFill: 'linear-gradient(90deg, #7ec8e3, #ffffff)',
    fontFamily: '',
    icon: '⏱️'
  },
  'flip-clock': {
    name: '机械翻页钟',
    cardBg: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a2e 50%, #16213e 100%)',
    numberColor: '#e67e22',
    unitColor: 'rgba(230,126,34,0.75)',
    labelColor: 'rgba(255,255,255,0.7)',
    progressBg: 'rgba(255,255,255,0.15)',
    progressFill: 'linear-gradient(90deg, #e67e22, #f39c12)',
    fontFamily: 'Courier New, monospace',
    icon: '⏱️'
  },
  'water-drop': {
    name: '极简水滴',
    cardBg: 'linear-gradient(135deg, #e8f4f8 0%, #d4ecf7 50%, #b8dced 100%)',
    numberColor: '#2980b9',
    unitColor: 'rgba(41,128,185,0.7)',
    labelColor: '#5a7d95',
    progressBg: 'rgba(41,128,185,0.15)',
    progressFill: 'linear-gradient(90deg, #3498db, #2ecc71)',
    fontFamily: '',
    icon: '💧'
  },
  'cyberpunk': {
    name: '赛博发光管',
    cardBg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    numberColor: '#00ff88',
    unitColor: 'rgba(0,255,136,0.7)',
    labelColor: 'rgba(155,89,182,0.9)',
    progressBg: 'rgba(155,89,182,0.25)',
    progressFill: 'linear-gradient(90deg, #9b59b6, #00ff88)',
    fontFamily: 'Courier New, monospace',
    icon: '⚡'
  },
  'vip-starry': {
    name: '星空法阵',
    cardBg: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    numberColor: '#f0e68c',
    unitColor: 'rgba(240,230,140,0.75)',
    labelColor: 'rgba(224,234,252,0.8)',
    progressBg: 'rgba(240,230,140,0.15)',
    progressFill: 'linear-gradient(90deg, #f0e68c, #e0eafc)',
    fontFamily: '',
    icon: '✨'
  },
  'vip-holo': {
    name: '全息投影',
    cardBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    numberColor: '#ffffff',
    unitColor: 'rgba(255,255,255,0.85)',
    labelColor: 'rgba(255,255,255,0.8)',
    progressBg: 'rgba(255,255,255,0.2)',
    progressFill: 'linear-gradient(90deg, #f093fb, #ffffff)',
    fontFamily: '',
    icon: '🔮'
  },
  'vip-darkgold': {
    name: '暗黑流金',
    cardBg: 'linear-gradient(135deg, #232526 0%, #414345 50%, #2c3e50 100%)',
    numberColor: '#e6a23c',
    unitColor: 'rgba(230,162,60,0.8)',
    labelColor: 'rgba(230,162,60,0.7)',
    progressBg: 'rgba(230,162,60,0.15)',
    progressFill: 'linear-gradient(90deg, #e6a23c, #f7dc6f)',
    fontFamily: '',
    icon: '👑'
  }
};

function getDateOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return util.formatDate(d);
}

function getDateLabel(offset) {
  if (offset === 0) return '今天';
  if (offset === -1) return '昨天';
  if (offset === -2) return '前天';
  return '';
}

Page({
  data: {
    today: '',
    todayCN: '',
    weekDay: '',
    dateOffset: 0,
    dateLabel: '今天',
    canGoPrev: true,
    canGoNext: false,
    startTime: '',
    endTime: '',
    currentDuration: '',
    currentDurationMin: 0,
    todaySessions: [],
    todayTotal: 0,
    todayHours: 0,
    todayMinutes: 0,
    todayTotalDisplay: '0分钟',
    progressPercent: 0,
    currentMultiplier: memberUtil.formatMultiplier(memberUtil.BASE_MULTIPLIER),
    isLoading: false,
    canSave: false,
    animateTrigger: false,
    // 皮肤相关
    skinCardBg: '',
    skinNumberColor: '',
    skinUnitColor: '',
    skinLabelColor: '',
    skinProgressBg: '',
    skinProgressFill: '',
    skinFontFamily: '',
    skinIcon: '⏱️',
    skinName: '经典数字'
  },

  onLoad: function () {
    this.switchToDate(0);
  },

  onShow: function () {
    this.playTabEnter();
    this.loadTimerSkin();
    this.loadTodaySessions();
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

  loadTimerSkin: function () {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const skinId = userInfo.timerSkinId || 'skin-default';
    const skin = TIMER_SKIN_STYLES[skinId] || TIMER_SKIN_STYLES['skin-default'];

    this.setData({
      skinCardBg: skin.cardBg,
      skinNumberColor: skin.numberColor,
      skinUnitColor: skin.unitColor,
      skinLabelColor: skin.labelColor,
      skinProgressBg: skin.progressBg,
      skinProgressFill: skin.progressFill,
      skinFontFamily: skin.fontFamily ? `font-family: ${skin.fontFamily};` : '',
      skinIcon: skin.icon,
      skinName: skin.name
    });
  },

  switchToDate: function (offset) {
    const dateStr = getDateOffset(offset);
    this.setData({
      today: dateStr,
      todayCN: util.formatDateCN(dateStr),
      weekDay: util.getWeekDay(dateStr),
      dateOffset: offset,
      dateLabel: getDateLabel(offset),
      canGoPrev: offset > -2,
      canGoNext: offset < 0,
      // 切换日期清空输入
      startTime: '',
      endTime: '',
      currentDuration: '',
      currentDurationMin: 0,
      canSave: false
    });
    this.loadTodaySessions();
  },

  onPrevDate: function () {
    if (this.data.dateOffset > -2) {
      this.switchToDate(this.data.dateOffset - 1);
    }
  },

  onNextDate: function () {
    if (this.data.dateOffset < 0) {
      this.switchToDate(this.data.dateOffset + 1);
    }
  },

  loadTodaySessions: function () {
    const rewardState = memberUtil.getRewardState();
    const activeMultiplier = rewardState.activeMultiplier;

    this.setData({
      isLoading: true,
      currentMultiplier: rewardState.activeMultiplierText
    });

    sessionsCollection
      .where({ date: this.data.today })
      .orderBy('startTime', 'asc')
      .get()
      .then(res => {
        const sessions = res.data;
        let totalMin = 0;
        let totalDiscountedMin = 0;

        sessions.forEach(session => {
          session.discountMinutes = memberUtil.getDiscountMinutes(session.durationMinutes, activeMultiplier);
          session.discountDisplay = util.formatDuration(session.discountMinutes);
          totalMin += session.durationMinutes;
          totalDiscountedMin += session.discountMinutes;
        });

        this.setData({
          todaySessions: sessions,
          todayTotal: totalDiscountedMin,
          todayHours: Math.floor(totalDiscountedMin / 60),
          todayMinutes: totalDiscountedMin % 60,
          todayTotalDisplay: util.formatDuration(totalDiscountedMin),
          progressPercent: Math.min(Math.round(totalDiscountedMin / 400 * 100), 100),
          isLoading: false
        });
      })
      .catch(err => {
        console.error('查询失败', err);
        this.setData({ isLoading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  onStartTimeChange: function (e) {
    this.setData({ startTime: e.detail.value });
    this.updateDuration();
  },

  onEndTimeChange: function (e) {
    this.setData({ endTime: e.detail.value });
    this.updateDuration();
  },

  updateDuration: function () {
    const { startTime, endTime } = this.data;
    if (!startTime || !endTime) {
      this.setData({ currentDuration: '', currentDurationMin: 0, canSave: false });
      return;
    }
    const minutes = util.calcDuration(startTime, endTime);
    if (minutes < 0) {
      this.setData({
        currentDuration: '结束时间须晚于开始时间',
        currentDurationMin: 0,
        canSave: false
      });
    } else {
      this.setData({
        currentDuration: util.formatDuration(minutes),
        currentDurationMin: minutes,
        canSave: true
      });
    }
  },
  onSave: function () {
    if (!this.data.canSave) return;
    const record = {
      date: this.data.today,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
      durationMinutes: this.data.currentDurationMin,
      durationDisplay: this.data.currentDuration,
      createTime: db.serverDate()
    };
    wx.showLoading({ title: '保存中...' });
    sessionsCollection.add({ data: record })
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '保存成功', icon: 'success' });
        this.setData({
          startTime: '',
          endTime: '',
          currentDuration: '',
          currentDurationMin: 0,
          canSave: false
        });
        this.loadTodaySessions();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('保存失败', err);
        wx.showToast({ title: '保存失败', icon: 'none' });
      });
  },
  onDelete: function (e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条学习记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          sessionsCollection.doc(id).remove()
            .then(() => {
              wx.hideLoading();
              wx.showToast({ title: '已删除', icon: 'success' });
              this.loadTodaySessions();
            })
            .catch(err => {
              wx.hideLoading();
              console.error('删除失败', err);
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  }
});
