const util = require('../../utils/util.js');
const memberUtil = require('../../utils/member.js');
const mallUtil = require('../../utils/mall.js');

const db = wx.cloud.database();
const sessionsCollection = db.collection('study_sessions');

Page({
  data: {
    isLoading: false,
    points: 0,
    grossPoints: 0,
    vipRewardPoints: 0,
    blindBoxBonusPoints: 0,
    spentPoints: 0,
    currentMultiplier: memberUtil.formatMultiplier(memberUtil.BASE_MULTIPLIER),
    blindBoxCost: mallUtil.BLIND_BOX_COST,
    blindBoxRewards: mallUtil.BLIND_BOX_REWARDS,
    blindBoxHistory: [],
    blindBoxButtonText: '2 点开启',
    blindBoxButtonDisabled: true,
    maxFreePulls: 0,
    usedFreePulls: 0,
    avatarItems: [],
    themeItems: [],
    timerSkinItems: []
  },

  onShow: function () {
    this.checkDailyPulls();
    this.loadMallData();
  },

  checkDailyPulls: function () {
    const hours = wx.getStorageSync('userCumulativeHours') || 0;
    let max = 0;
    if (hours >= 500) max = 5;
    else if (hours >= 300) max = 3;
    else if (hours >= 200) max = 1;
    else if (hours >= 100) max = 1;

    const today = util.formatDate(new Date());
    let pullsInfo = wx.getStorageSync('dailyPullsInfo') || { date: '', count: 0 };

    if (pullsInfo.date !== today) {
      pullsInfo = { date: today, count: 0 };
      wx.setStorageSync('dailyPullsInfo', pullsInfo);
    }

    this.setData({
      maxFreePulls: max,
      usedFreePulls: pullsInfo.count
    });
  },

  buildBlindBoxButtonState: function (availablePoints) {
    const freeCount = this.data.maxFreePulls - this.data.usedFreePulls;
    if (freeCount > 0) {
      return {
        blindBoxButtonText: `免费开盒 (${freeCount}次)`,
        blindBoxButtonDisabled: false
      };
    }

    return {
      blindBoxButtonText: `${mallUtil.BLIND_BOX_COST} 点一次`,
      blindBoxButtonDisabled: availablePoints < mallUtil.BLIND_BOX_COST
    };
  },

  buildAvatarItems: function (availablePoints, mallState) {
    return mallUtil.SHOP_AVATAR_ITEMS.map(item => {
      const owned = mallState.unlockedAvatarIds.includes(item.avatar.id);
      return {
        ...item,
        owned,
        canBuy: !owned && availablePoints >= item.points,
        buttonText: owned ? '已拥有' : '购买解锁'
      };
    });
  },

  buildThemeItems: function (availablePoints, mallState) {
    return mallUtil.SHOP_THEME_ITEMS.map(item => {
      const owned = mallState.unlockedThemeIds.includes(item.theme.id);
      return {
        ...item,
        owned,
        canBuy: !owned && availablePoints >= item.points,
        buttonText: owned ? '已解锁' : '购买配色'
      };
    });
  },

  buildTimerSkinItems: function (availablePoints, mallState) {
    return mallUtil.SHOP_TIMER_SKIN_ITEMS.map(item => {
      // Ensure we treat it safely in case it hasn't been initialized
      const owned = (mallState.unlockedTimerSkinIds || []).includes(item.skin.id);
      return {
        ...item,
        owned,
        canBuy: !owned && availablePoints >= item.points,
        buttonText: owned ? '已解锁' : '购买皮肤'
      };
    });
  },

  loadMallData: function () {
    const monthStart = util.getMonthStart();
    this.setData({ isLoading: true });

    sessionsCollection
      .where({ date: db.command.gte(monthStart) })
      .get()
      .then(res => {
        let monthMin = 0;
        res.data.forEach(session => {
          monthMin += session.durationMinutes;
        });

        const pointSummary = memberUtil.calculateTotalPoints(monthMin);
        const wallet = mallUtil.calculateAvailablePoints(pointSummary.totalPoints);
        const blindBoxButtonState = this.buildBlindBoxButtonState(wallet.availablePoints);

        this.setData({
          points: wallet.availablePoints,
          grossPoints: pointSummary.totalPoints,
          vipRewardPoints: pointSummary.bonusPoints,
          blindBoxBonusPoints: wallet.blindBoxBonusPoints,
          spentPoints: wallet.spentPoints,
          currentMultiplier: pointSummary.multiplierText,
          blindBoxHistory: wallet.mallState.blindBoxHistory.slice(0, 3),
          avatarItems: this.buildAvatarItems(wallet.availablePoints, wallet.mallState),
          themeItems: this.buildThemeItems(wallet.availablePoints, wallet.mallState),
          timerSkinItems: this.buildTimerSkinItems(wallet.availablePoints, wallet.mallState),
          blindBoxButtonText: blindBoxButtonState.blindBoxButtonText,
          blindBoxButtonDisabled: blindBoxButtonState.blindBoxButtonDisabled,
          isLoading: false
        });
      })
      .catch(err => {
        console.error('加载商城失败', err);
        this.setData({ isLoading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  consumeFreePull: function () {
    const today = util.formatDate(new Date());
    const nextCount = this.data.usedFreePulls + 1;
    wx.setStorageSync('dailyPullsInfo', { date: today, count: nextCount });
    this.setData({ usedFreePulls: nextCount });
  },

  onOpenBlindBox: function () {
    const isFree = this.data.usedFreePulls < this.data.maxFreePulls;

    if (!isFree && this.data.points < mallUtil.BLIND_BOX_COST) {
      wx.showToast({ title: '点数不足，无法开盒', icon: 'none' });
      return;
    }

    const modalContent = isFree
      ? '本次将使用会员赠送的免费盲盒次数，是否继续？'
      : `本次将花费 ${mallUtil.BLIND_BOX_COST} 点开启神秘盲盒，是否继续？`;

    wx.showModal({
      title: '开启神秘盲盒',
      content: modalContent,
      success: (res) => {
        if (!res.confirm) {
          return;
        }

        if (isFree) {
          this.consumeFreePull();
        }

        const result = mallUtil.drawBlindBox(isFree);
        this.loadMallData();

        const rewardText = result.reward.points > 0
          ? `恭喜抽中 ${result.reward.points} 点奖励，可用点数已自动增加。`
          : '这次没有抽中点数，再试一次看看。';

        wx.showModal({
          title: '盲盒结果',
          content: rewardText,
          showCancel: false
        });
      }
    });
  },

  onPurchaseItem: function (e) {
    const item = e.currentTarget.dataset.item;

    if (!item) {
      return;
    }

    if (item.owned || item.canBuy === false) {
      wx.showToast({ title: item.owned ? '已经拥有了' : '点数不足', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认购买',
      content: `确定花费 ${item.points} 点兑换【${item.name}】吗？`,
      success: (res) => {
        if (!res.confirm) {
          return;
        }

        mallUtil.purchaseItem(item);
        this.loadMallData();

        let successText = `已成功兑换【${item.name}】。`;
        if (item.type === 'avatar') {
          successText = `已解锁 ${item.name}，现在可以去个人信息页设置。`;
        }
        if (item.type === 'theme') {
          successText = `已解锁 ${item.name} 底色，现在可以去个人信息页设置页面背景。`;
        }
        if (item.type === 'timerSkin') {
          successText = `已解锁 ${item.name} 计时器皮肤，现在可以去个人信息页设置。`;
        }

        wx.showModal({
          title: '兑换成功',
          content: successText,
          showCancel: false
        });
      }
    });
  }
});
