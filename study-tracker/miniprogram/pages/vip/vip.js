const memberUtil = require('../../utils/member.js');

const db = wx.cloud.database();
const sessionsCollection = db.collection('study_sessions');

Page({
  data: {
    cumulativeHours: 0,
    currentLevel: '见习会员',
    currentLevelIndex: 0,
    currentSwiperIndex: 0,
    activeTierIndex: 0,
    tiers: memberUtil.getTiers(),
    claimedTierIds: [],
    totalRewardPoints: 0,
    activeMultiplier: memberUtil.formatMultiplier(memberUtil.BASE_MULTIPLIER),
    rewardTier: memberUtil.getTierByIndex(0),
    rewardTierMultiplier: '',
    hasRewardMultiplier: false,
    hasBlindBoxReward: false,
    hasTimerSkinReward: false,
    blindBoxButtonText: '去抽盲盒',
    blindBoxButtonDisabled: true,
    rewardButtonText: '立即领取',
    rewardButtonDisabled: false,
    rewardButtonClass: 'active',
    rewardStatusClass: 'available',
    rewardStatusText: '可领取',
    rewardStatusDesc: '领取后将自动应用专属头像，并刷新奖励点数。',
    panelAnimate: true
  },

  onLoad: function () {
    this.calculateLevel();
  },

  onShow: function () {
    this.syncRewardPanel();
    this.triggerPanelAnimation();
  },

  onHide: function () {
    if (this.panelAnimationTimer) {
      clearTimeout(this.panelAnimationTimer);
    }
  },

  onUnload: function () {
    if (this.panelAnimationTimer) {
      clearTimeout(this.panelAnimationTimer);
    }
  },

  triggerPanelAnimation: function () {
    if (this.panelAnimationTimer) {
      clearTimeout(this.panelAnimationTimer);
    }

    this.setData({ panelAnimate: false });
    this.panelAnimationTimer = setTimeout(() => {
      this.setData({ panelAnimate: true });
    }, 40);
  },

  buildRewardStatusDesc: function (rewardTier, isUnlocked, isClaimed, rewardTierMultiplier) {
    const rewardParts = [rewardTier.reward.avatarName, `${rewardTier.reward.points} 点`];

    if (rewardTier.reward.blindBox) {
      rewardParts.push(`每日盲盒 ${rewardTier.reward.blindBox.dailyFreePulls} 次`);
    }

    if (rewardTier.reward.timerSkin) {
      rewardParts.push(`专属皮肤「${rewardTier.reward.timerSkin.name}」`);
    }

    if (typeof rewardTier.reward.multiplier === 'number') {
      rewardParts.push(`倍率 ×${rewardTierMultiplier}`);
    }

    if (isClaimed) {
      return `已获得 ${rewardParts.join('、')}。`;
    }

    if (isUnlocked) {
      const prefix = [`领取后将自动应用${rewardTier.reward.avatarName}`, `发放 ${rewardTier.reward.points} 点`];

      if (rewardTier.reward.blindBox) {
        prefix.push(`并可前往商城使用每日 ${rewardTier.reward.blindBox.dailyFreePulls} 次盲盒特权`);
      }

      if (rewardTier.reward.timerSkin) {
        prefix.push(`解锁专属计时器皮肤`);
      }

      if (typeof rewardTier.reward.multiplier === 'number') {
        prefix.push(`倍率提升到 ×${rewardTierMultiplier}`);
      }

      return `${prefix.join('，')}。`;
    }

    let desc = `累计学习满 ${rewardTier.reqHours} 小时后即可领取该等级奖励`;
    if (rewardTier.reward.blindBox || typeof rewardTier.reward.multiplier === 'number' || rewardTier.reward.timerSkin) {
      desc += '并解锁对应权益';
    }
    return `${desc}。`;
  },

  buildClaimSuccessContent: function (rewardTier, rewardTierMultiplier) {
    const rewardParts = [rewardTier.reward.avatarName, `${rewardTier.reward.points} 点`];

    if (rewardTier.reward.blindBox) {
      rewardParts.push(`每日盲盒 ${rewardTier.reward.blindBox.dailyFreePulls} 次`);
    }

    if (rewardTier.reward.timerSkin) {
      rewardParts.push(`皮肤「${rewardTier.reward.timerSkin.name}」`);
    }

    if (typeof rewardTier.reward.multiplier === 'number') {
      rewardParts.push(`倍率提升至 ×${rewardTierMultiplier}`);
    }

    return `已获得 ${rewardParts.join('、')}。头像已自动应用。`;
  },

  calculateLevel: function () {
    sessionsCollection
      .orderBy('date', 'desc')
      .limit(1000)
      .get()
      .then(res => {
        let allMin = 0;
        res.data.forEach(session => {
          allMin += session.durationMinutes;
        });

        const hours = allMin / 60;
        const currentLevelIndex = memberUtil.getTierIndexByHours(hours);
        const currentTier = memberUtil.getTierByIndex(currentLevelIndex);
        const rewardState = memberUtil.getRewardState();

        wx.setStorageSync('userCumulativeHours', hours);

        this.setData({
          cumulativeHours: hours.toFixed(1),
          currentLevel: currentTier.level,
          currentLevelIndex,
          currentSwiperIndex: currentLevelIndex,
          activeTierIndex: currentLevelIndex,
          claimedTierIds: rewardState.claimedTierIds,
          totalRewardPoints: rewardState.bonusPoints,
          activeMultiplier: rewardState.activeMultiplierText
        }, () => {
          this.syncRewardPanel();
          this.triggerPanelAnimation();
        });
      })
      .catch(err => {
        console.error('查询会员等级失败', err);
        const rewardState = memberUtil.getRewardState();
        this.setData({
          claimedTierIds: rewardState.claimedTierIds,
          totalRewardPoints: rewardState.bonusPoints,
          activeMultiplier: rewardState.activeMultiplierText
        }, () => {
          this.syncRewardPanel();
          this.triggerPanelAnimation();
        });
      });
  },

  syncRewardPanel: function () {
    const rewardState = memberUtil.getRewardState();
    const rewardTier = memberUtil.getTierByIndex(this.data.activeTierIndex);
    const hasRewardMultiplier = typeof rewardTier.reward.multiplier === 'number';
    const rewardTierMultiplier = hasRewardMultiplier ? memberUtil.formatMultiplier(rewardTier.reward.multiplier) : '';
    const hasBlindBoxReward = !!rewardTier.reward.blindBox;
    const hasTimerSkinReward = !!rewardTier.reward.timerSkin;
    const isUnlocked = this.data.activeTierIndex <= this.data.currentLevelIndex;
    const isClaimed = rewardState.claimedTierIds.includes(rewardTier.id);

    let rewardButtonText = '暂未解锁';
    let rewardButtonDisabled = true;
    let rewardButtonClass = 'disabled';
    let rewardStatusClass = 'locked';
    let rewardStatusText = '未达成';
    let blindBoxButtonText = rewardTier.reward.blindBox ? rewardTier.reward.blindBox.buttonText : '去抽盲盒';
    let blindBoxButtonDisabled = !hasBlindBoxReward || !isUnlocked;

    if (isClaimed) {
      rewardButtonText = '已领取';
      rewardButtonClass = 'claimed';
      rewardStatusClass = 'claimed';
      rewardStatusText = '已领取';
    } else if (isUnlocked) {
      rewardButtonText = '领取奖励';
      rewardButtonDisabled = false;
      rewardButtonClass = 'active';
      rewardStatusClass = 'available';
      rewardStatusText = '可领取';
    }

    if (hasBlindBoxReward) {
      blindBoxButtonText = isUnlocked ? rewardTier.reward.blindBox.buttonText : '等级未解锁';
    }

    this.setData({
      claimedTierIds: rewardState.claimedTierIds,
      totalRewardPoints: rewardState.bonusPoints,
      activeMultiplier: rewardState.activeMultiplierText,
      rewardTier,
      rewardTierMultiplier,
      hasRewardMultiplier,
      hasBlindBoxReward,
      hasTimerSkinReward,
      blindBoxButtonText,
      blindBoxButtonDisabled,
      rewardButtonText,
      rewardButtonDisabled,
      rewardButtonClass,
      rewardStatusClass,
      rewardStatusText,
      rewardStatusDesc: this.buildRewardStatusDesc(rewardTier, isUnlocked, isClaimed, rewardTierMultiplier)
    });
  },

  onClaimReward: function () {
    const rewardTier = memberUtil.getTierByIndex(this.data.activeTierIndex);

    if (this.data.activeTierIndex > this.data.currentLevelIndex) {
      wx.showToast({ title: '当前等级尚未解锁', icon: 'none' });
      return;
    }

    if (this.data.claimedTierIds.includes(rewardTier.id)) {
      wx.showToast({ title: '该奖励已经领取过了', icon: 'none' });
      return;
    }

    const result = memberUtil.claimTierReward(rewardTier.id);
    const rewardTierMultiplier = typeof rewardTier.reward.multiplier === 'number'
      ? memberUtil.formatMultiplier(rewardTier.reward.multiplier)
      : '';

    this.setData({
      claimedTierIds: result.claimedTierIds,
      totalRewardPoints: result.bonusPoints,
      activeMultiplier: result.activeMultiplierText
    }, () => {
      this.syncRewardPanel();
      this.triggerPanelAnimation();
    });

    wx.showModal({
      title: '奖励领取成功',
      content: this.buildClaimSuccessContent(rewardTier, rewardTierMultiplier),
      showCancel: false
    });
  },

  onGoMall: function () {
    if (this.data.blindBoxButtonDisabled) {
      return;
    }

    wx.navigateTo({ url: '/pages/mall/mall' });
  },

  updateActiveTier: function (activeTierIndex) {
    this.setData({
      activeTierIndex,
      currentSwiperIndex: activeTierIndex
    }, () => {
      this.syncRewardPanel();
      this.triggerPanelAnimation();
    });
  },

  onSwiperChange: function (e) {
    this.updateActiveTier(e.detail.current);
  },

  prevTier: function () {
    if (this.data.activeTierIndex > 0) {
      this.updateActiveTier(this.data.activeTierIndex - 1);
    }
  },

  nextTier: function () {
    if (this.data.activeTierIndex < this.data.tiers.length - 1) {
      this.updateActiveTier(this.data.activeTierIndex + 1);
    }
  }
});