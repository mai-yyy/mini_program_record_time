const util = require('../../utils/util.js');
const memberUtil = require('../../utils/member.js');

const db = wx.cloud.database();
const sessionsCollection = db.collection('study_sessions');

Page({
  data: {
    records: [],
    currentMultiplier: memberUtil.formatMultiplier(memberUtil.BASE_MULTIPLIER),
    isLoading: false,
    hasMore: true,
    pageSize: 20,
    lastDate: '',
    animateTrigger: false
  },

  onShow: function () {
    this.playTabEnter();
    this.setData({ records: [], lastDate: '', hasMore: true });
    this.loadRecords();
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

  loadRecords: function () {
    if (this.data.isLoading || !this.data.hasMore) return;

    const rewardState = memberUtil.getRewardState();
    const activeMultiplier = rewardState.activeMultiplier;

    this.setData({
      isLoading: true,
      currentMultiplier: rewardState.activeMultiplierText
    });

    const query = sessionsCollection.orderBy('date', 'desc').orderBy('startTime', 'asc');

    query.limit(100).get()
      .then(res => {
        const grouped = this.groupByDate(res.data, activeMultiplier);

        this.setData({
          records: grouped,
          isLoading: false,
          hasMore: false
        });
      })
      .catch(err => {
        console.error('查询失败', err);
        this.setData({ isLoading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  groupByDate: function (sessions, activeMultiplier) {
    const map = {};
    sessions.forEach(session => {
      if (!map[session.date]) {
        map[session.date] = {
          date: session.date,
          dateCN: util.formatDateCN(session.date),
          weekDay: util.getWeekDay(session.date),
          sessions: [],
          totalMinutes: 0
        };
      }
      map[session.date].sessions.push(session);
      map[session.date].totalMinutes += session.durationMinutes;
    });

    const result = Object.values(map);
    result.forEach(record => {
      record.totalDisplay = util.formatDuration(record.totalMinutes);
      record.discountMinutes = memberUtil.getDiscountMinutes(record.totalMinutes, activeMultiplier);
      record.discountDisplay = util.formatDuration(record.discountMinutes);
    });

    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
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
              this.setData({ records: [], lastDate: '', hasMore: true });
              this.loadRecords();
            })
            .catch(err => {
              wx.hideLoading();
              console.error('删除失败', err);
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  },

  onPullDownRefresh: function () {
    this.setData({ records: [], lastDate: '', hasMore: true });
    this.loadRecords();
    wx.stopPullDownRefresh();
  }
});
