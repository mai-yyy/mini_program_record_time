const util = require('../../utils/util.js');
const memberUtil = require('../../utils/member.js');
const mallUtil = require('../../utils/mall.js');

const db = wx.cloud.database();
const sessionsCollection = db.collection('study_sessions');

Page({
  data: {
    monthPoints: 0,
    grossPoints: 0,
    studyPoints: 0,
    rewardPoints: 0,
    blindBoxBonusPoints: 0,
    spentPoints: 0,
    monthTotalMin: 0,
    monthDiscountMin: 0,
    monthDisplay: '',
    monthDiscountDisplay: '',
    currentMultiplier: memberUtil.formatMultiplier(memberUtil.BASE_MULTIPLIER),
    isLoading: false
  },

  onShow: function () {
    this.loadMonthData();
  },

  loadMonthData: function () {
    const monthStart = util.getMonthStart();

    this.setData({ isLoading: true });

    sessionsCollection
      .where({ date: db.command.gte(monthStart) })
      .orderBy('date', 'desc')
      .get()
      .then(res => {
        let totalMin = 0;
        res.data.forEach(session => {
          totalMin += session.durationMinutes;
        });

        const pointSummary = memberUtil.calculateTotalPoints(totalMin);
        const wallet = mallUtil.calculateAvailablePoints(pointSummary.totalPoints);

        this.setData({
          monthTotalMin: totalMin,
          monthDiscountMin: pointSummary.discountMinutes,
          monthDisplay: util.formatDuration(totalMin),
          monthDiscountDisplay: util.formatDuration(pointSummary.discountMinutes),
          monthPoints: wallet.availablePoints,
          grossPoints: pointSummary.totalPoints,
          studyPoints: pointSummary.studyPoints,
          rewardPoints: pointSummary.bonusPoints,
          blindBoxBonusPoints: wallet.blindBoxBonusPoints,
          spentPoints: wallet.spentPoints,
          currentMultiplier: pointSummary.multiplierText,
          isLoading: false
        });
      })
      .catch(err => {
        console.error('查询失败', err);
        this.setData({ isLoading: false });
      });
  }
});
