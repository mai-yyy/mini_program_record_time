const STORAGE_KEY = 'vipRewardState';
const BASE_MULTIPLIER = 0.8;
const cloudSync = require('./cloudSync.js');

const TIER_DEFINITIONS = [
  {
    id: 'apprentice',
    level: '见习会员',
    reqHours: 0,
    bgImage: '/images/vip/apprentice.jpg',
    cardBg: 'linear-gradient(135deg, #bdc3c7, #2c3e50)',
    containerBg: '#f8f9fa',
    color: '#ffffff',
    icon: '🌱',
    perks: [
      { label: '记录时长', value: '无限制' },
      { label: '初级头像', value: '1 款' }
    ],
    benefits: [
      { icon: '📖', text: '基础使用权限，记录每日学习时间', highlight: false },
      { icon: '🧑‍🏫', text: '解锁讲师专属头像', highlight: false },
      { icon: '📊', text: '查看本月与历史学习统计', highlight: false }
    ],
    reward: {
      points: 2,
      avatarId: 'scholar',
      avatarText: '🧑‍🏫',
      avatarBg: 'linear-gradient(135deg, #e67e22, #d35400)',
      avatarName: '讲师头像'
    }
  },
  {
    id: 'regular',
    level: '普通会员',
    reqHours: 10,
    bgImage: '/images/vip/regular.jpg',
    cardBg: 'linear-gradient(135deg, #6dd5ed, #2193b0)',
    containerBg: '#e0f7fa',
    color: '#ffffff',
    icon: '📝',
    perks: [
      { label: '解锁小时', value: '10 h' },
      { label: '专属头像', value: '1 款' },
      { label: '奖励点数', value: '+4' }
    ],
    benefits: [
      { icon: '🏷️', text: '专属普通会员标识', highlight: false },
      { icon: '👩‍🎓', text: '解锁学霸专属头像', highlight: false },
      { icon: '📈', text: '基础学习数据分析报告', highlight: false }
    ],
    reward: {
      points: 4,
      avatarId: 'student',
      avatarText: '👩‍🎓',
      avatarBg: 'linear-gradient(135deg, #6dd5ed, #2193b0)',
      avatarName: '学霸头像'
    }
  },
  {
    id: 'gold',
    level: '黄金会员',
    reqHours: 100,
    bgImage: '/images/vip/gold.jpg',
    cardBg: 'linear-gradient(135deg, #f6d365, #fda085)',
    containerBg: '#fff8e1',
    color: '#ffffff',
    icon: '⭐',
    perks: [
      { label: '解锁小时', value: '100 h' },
      { label: '每日盲盒', value: '1 次' },
      { label: '奖励点数', value: '+6' }
    ],
    benefits: [
      { icon: '🥇', text: '专属黄金会员勋章标识', highlight: false },
      { icon: '🐼', text: '解锁熊猫专属高级头像', highlight: false },
      { icon: '🎁', text: '商城「神秘盲盒」每天免费抽 1 次', highlight: true }
    ],
    reward: {
      points: 6,
      avatarId: 'panda',
      avatarText: '🐼',
      avatarBg: 'linear-gradient(135deg, #f6d365, #fda085)',
      avatarName: '熊猫头像',
      blindBox: {
        dailyFreePulls: 1,
        desc: '每日可免费抽 1 次神秘盲盒',
        buttonText: '去抽盲盒'
      }
    }
  },
  {
    id: 'platinum',
    level: '铂金会员',
    reqHours: 200,
    bgImage: '/images/vip/platinum.jpg',
    cardBg: 'linear-gradient(135deg, #e0eafc, #8ca0bb)',
    containerBg: '#f3f6f9',
    color: '#ffffff',
    icon: '💎',
    perks: [
      { label: '解锁小时', value: '200 h' },
      { label: '每日盲盒', value: '1 次' },
      { label: '计时器皮肤', value: '专属' }
    ],
    benefits: [
      { icon: '💠', text: '专属铂金会员动态标识', highlight: false },
      { icon: '🦊', text: '解锁紫狐专属高级头像', highlight: false },
      { icon: '🎁', text: '商城「神秘盲盒」每天免费抽 1 次', highlight: false },
      { icon: '⏱️', text: '解锁铂金专属皮肤：星空法阵', highlight: true }
    ],
    reward: {
      points: 8,
      avatarId: 'fox',
      avatarText: '🦊',
      avatarBg: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
      avatarName: '紫狐头像',
      timerSkin: {
        id: 'vip-starry',
        name: '星空法阵'
      },
      blindBox: {
        dailyFreePulls: 1,
        desc: '每日可免费抽 1 次神秘盲盒',
        buttonText: '去抽盲盒'
      }
    }
  },
  {
    id: 'diamond',
    level: '钻石会员',
    reqHours: 300,
    bgImage: '/images/vip/diamond.jpg',
    cardBg: 'linear-gradient(135deg, #00c6ff, #0072ff)',
    containerBg: '#e3f2fd',
    color: '#ffffff',
    icon: '🌟',
    perks: [
      { label: '解锁小时', value: '300 h' },
      { label: '每日盲盒', value: '3 次' },
      { label: '计时器皮肤', value: '专属' }
    ],
    benefits: [
      { icon: '✨', text: '专属钻石特效 UI 与粒子动画', highlight: false },
      { icon: '🦄', text: '解锁独角兽神话级头像', highlight: false },
      { icon: '🎁', text: '商城「神秘盲盒」每天免费抽 3 次', highlight: true },
      { icon: '⚡', text: '倍率调整至0.88', highlight: true },
      { icon: '⏱️', text: '解锁钻石专属皮肤：全息投影', highlight: true }
    ],
    reward: {
      points: 10,
      multiplier: 0.88,
      avatarId: 'unicorn',
      avatarText: '🦄',
      avatarBg: 'linear-gradient(135deg, #FF6B6B, #5352ED)',
      avatarName: '独角兽头像',
      timerSkin: {
        id: 'vip-holo',
        name: '全息投影'
      },
      blindBox: {
        dailyFreePulls: 3,
        desc: '每日可免费抽 3 次神秘盲盒',
        buttonText: '去抽盲盒'
      }
    }
  },
  {
    id: 'blackgold',
    level: '黑金会员',
    reqHours: 500,
    bgImage: '/images/vip/blackgold.jpg',
    cardBg: 'linear-gradient(135deg, #232526, #414345)',
    containerBg: '#e0e0e0',
    color: '#e6a23c',
    icon: '👑',
    perks: [
      { label: '解锁小时', value: '500 h' },
      { label: '每日盲盒', value: '5 次' },
      { label: '计时器皮肤', value: '限定' }
    ],
    benefits: [
      { icon: '👑', text: '尊贵黑金动态标识与专属页面主题', highlight: false },
      { icon: '🐉', text: '解锁龙神传奇限定头像', highlight: true },
      { icon: '🎁', text: '商城「神秘盲盒」每天免费抽 5 次', highlight: true },
      { icon: '⚡', text: '倍率调整至0.92', highlight: true },
      { icon: '⏱️', text: '解锁黑金专属皮肤：暗黑流金', highlight: true }
    ],
    reward: {
      points: 12,
      multiplier: 0.92,
      avatarId: 'dragon',
      avatarText: '🐉',
      avatarBg: 'linear-gradient(135deg, #2C3A47, #1B1464)',
      avatarName: '龙神头像',
      timerSkin: {
        id: 'vip-darkgold',
        name: '暗黑流金'
      },
      blindBox: {
        dailyFreePulls: 5,
        desc: '每日可免费抽 5 次神秘盲盒',
        buttonText: '去抽盲盒'
      }
    }
  }
];

function cloneReward(reward) {
  return {
    ...reward,
    blindBox: reward.blindBox ? { ...reward.blindBox } : undefined,
    timerSkin: reward.timerSkin ? { ...reward.timerSkin } : undefined
  };
}

function getTiers() {
  return TIER_DEFINITIONS.map(tier => ({
    ...tier,
    perks: tier.perks.slice(),
    benefits: tier.benefits.slice(),
    reward: cloneReward(tier.reward)
  }));
}

function getTierById(tierId) {
  return TIER_DEFINITIONS.find(tier => tier.id === tierId) || TIER_DEFINITIONS[0];
}

function getTierIndexByHours(hours) {
  let tierIndex = 0;
  TIER_DEFINITIONS.forEach((tier, index) => {
    if (hours >= tier.reqHours) {
      tierIndex = index;
    }
  });
  return tierIndex;
}

function getTierByHours(hours) {
  return TIER_DEFINITIONS[getTierIndexByHours(hours)];
}

function getTierByIndex(index) {
  return TIER_DEFINITIONS[index] || TIER_DEFINITIONS[0];
}

function normalizeClaimedTierIds(claimedTierIds) {
  if (!Array.isArray(claimedTierIds)) {
    return [];
  }

  const orderedTierIds = TIER_DEFINITIONS.map(tier => tier.id);
  return orderedTierIds.filter(tierId => claimedTierIds.includes(tierId));
}

function formatMultiplier(multiplier) {
  return Number(multiplier || BASE_MULTIPLIER).toFixed(2);
}

function buildRewardState(claimedTierIds) {
  const normalizedTierIds = normalizeClaimedTierIds(claimedTierIds);

  let bonusPoints = 0;
  let activeMultiplier = BASE_MULTIPLIER;

  normalizedTierIds.forEach(tierId => {
    const tier = getTierById(tierId);
    bonusPoints += tier.reward.points;

    if (typeof tier.reward.multiplier === 'number' && tier.reward.multiplier > activeMultiplier) {
      activeMultiplier = tier.reward.multiplier;
    }
  });

  return {
    claimedTierIds: normalizedTierIds,
    bonusPoints,
    activeMultiplier,
    activeMultiplierText: formatMultiplier(activeMultiplier)
  };
}

function getRewardState() {
  const savedState = wx.getStorageSync(STORAGE_KEY) || {};
  return buildRewardState(savedState.claimedTierIds);
}

function saveRewardState(claimedTierIds) {
  const rewardState = buildRewardState(claimedTierIds);
  cloudSync.saveAndSyncState(STORAGE_KEY, {
    claimedTierIds: rewardState.claimedTierIds
  });
  return rewardState;
}

function applyRewardAvatar(tier) {
  if (!tier || !tier.reward) {
    return;
  }

  const userInfo = wx.getStorageSync('userInfo') || {};

  const newUserInfo = {
    ...userInfo,
    avatarId: tier.reward.avatarId,
    avatarText: tier.reward.avatarText,
    avatarBg: tier.reward.avatarBg
  };
  cloudSync.saveAndSyncState('userInfo', newUserInfo);
}

function claimTierReward(tierId) {
  const rewardState = getRewardState();
  const tier = getTierById(tierId);

  if (rewardState.claimedTierIds.includes(tierId)) {
    return {
      ...rewardState,
      tier,
      alreadyClaimed: true
    };
  }

  const nextTierIds = rewardState.claimedTierIds.concat(tierId);
  const nextRewardState = saveRewardState(nextTierIds);
  applyRewardAvatar(tier);

  return {
    ...nextRewardState,
    tier,
    alreadyClaimed: false
  };
}

function getDiscountMinutes(totalMinutes, multiplier) {
  const activeMultiplier = typeof multiplier === 'number'
    ? multiplier
    : getRewardState().activeMultiplier;

  return Math.floor(totalMinutes * activeMultiplier);
}

function calculateStudyPoints(totalMinutes, multiplier) {
  const activeMultiplier = typeof multiplier === 'number'
    ? multiplier
    : getRewardState().activeMultiplier;
  const discountMinutes = getDiscountMinutes(totalMinutes, activeMultiplier);

  return {
    discountMinutes,
    studyPoints: Math.floor(discountMinutes / 60),
    multiplier: activeMultiplier,
    multiplierText: formatMultiplier(activeMultiplier)
  };
}

function calculateTotalPoints(totalMinutes) {
  const rewardState = getRewardState();
  const pointSummary = calculateStudyPoints(totalMinutes, rewardState.activeMultiplier);

  return {
    ...pointSummary,
    bonusPoints: rewardState.bonusPoints,
    totalPoints: pointSummary.studyPoints + rewardState.bonusPoints
  };
}

module.exports = {
  BASE_MULTIPLIER,
  STORAGE_KEY,
  getTiers,
  getTierById,
  getTierByIndex,
  getTierByHours,
  getTierIndexByHours,
  getRewardState,
  saveRewardState,
  claimTierReward,
  formatMultiplier,
  getDiscountMinutes,
  calculateStudyPoints,
  calculateTotalPoints
};
