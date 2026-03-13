const STORAGE_KEY = 'mallState';
const BLIND_BOX_COST = 2;
const cloudSync = require('./cloudSync.js');

const BLIND_BOX_REWARDS = [
  { points: 0, probability: 5, label: '0 点', tone: 'empty' },
  { points: 1, probability: 31, label: '1 点', tone: 'basic' },
  { points: 2, probability: 41, label: '2 点', tone: 'basic' },
  { points: 3, probability: 16, label: '3 点', tone: 'good' },
  { points: 10, probability: 6, label: '10 点', tone: 'rare' },
  { points: 66, probability: 1, label: '66 点', tone: 'legend' }
];

const SHOP_AVATAR_ITEMS = [
  {
    id: 'shop-avatar-bear',
    type: 'avatar',
    name: '奶油小熊头像',
    points: 5,
    icon: '🧸',
    desc: '软萌小熊，适合长期陪伴型学习搭子',
    avatar: {
      id: 'bear',
      text: '🧸',
      bg: 'linear-gradient(135deg, #f6d7b0, #e9b96e)',
      name: '奶油小熊'
    }
  },
  {
    id: 'shop-avatar-bunny',
    type: 'avatar',
    name: '软糖兔兔头像',
    points: 5,
    icon: '🐰',
    desc: '偏治愈气质，适合清爽轻盈的个人页',
    avatar: {
      id: 'bunny',
      text: '🐰',
      bg: 'linear-gradient(135deg, #ffd9ec, #ffc3d8)',
      name: '软糖兔兔'
    }
  },
  {
    id: 'shop-avatar-kitty',
    type: 'avatar',
    name: '薄荷猫猫头像',
    points: 5,
    icon: '🐱',
    desc: '更活泼一点，适合搭配浅色主题背景',
    avatar: {
      id: 'kitty',
      text: '🐱',
      bg: 'linear-gradient(135deg, #d9f5ef, #b8eadf)',
      name: '薄荷猫猫'
    }
  }
];

const SHOP_THEME_ITEMS = [
  {
    id: 'theme-cloud-blue',
    type: 'theme',
    name: '云朵蓝',
    points: 3,
    icon: '🩵',
    desc: '改变个人信息页和我的页面底色，偏微信风格的淡蓝配色',
    theme: {
      id: 'theme-cloud-blue',
      name: '云朵蓝',
      bg: 'linear-gradient(135deg, #dff1ff, #bfdcff)',
      pageBg: 'linear-gradient(180deg, #f4f9ff 0%, #e8f3ff 100%)',
      cardBg: '#f8fbff',
      tabBarBg: '#edf5ff'
    }
  },
  {
    id: 'theme-mint-green',
    type: 'theme',
    name: '薄荷绿',
    points: 3,
    icon: '💚',
    desc: '改变个人信息页和我的页面底色，柔和清新的浅绿主题',
    theme: {
      id: 'theme-mint-green',
      name: '薄荷绿',
      bg: 'linear-gradient(135deg, #e4f8ef, #c8eedb)',
      pageBg: 'linear-gradient(180deg, #f4fcf8 0%, #e7f7ef 100%)',
      cardBg: '#f7fcf9',
      tabBarBg: '#edf8f2'
    }
  },
  {
    id: 'theme-apricot',
    type: 'theme',
    name: '杏子奶油',
    points: 3,
    icon: '🧡',
    desc: '改变个人信息页和我的页面底色，带一点暖调的淡橙色',
    theme: {
      id: 'theme-apricot',
      name: '杏子奶油',
      bg: 'linear-gradient(135deg, #fff0e3, #ffd8bf)',
      pageBg: 'linear-gradient(180deg, #fff8f2 0%, #ffefe3 100%)',
      cardBg: '#fff8f3',
      tabBarBg: '#fff1e6'
    }
  }
];

const SHOP_TIMER_SKIN_ITEMS = [
  {
    id: 'skin-flip-clock',
    type: 'timerSkin',
    name: '机械翻页钟',
    points: 5,
    icon: '⏱️',
    desc: '复古经典的翻页动画效果，质感拉满',
    skin: {
      id: 'flip-clock',
      name: '机械翻页',
      previewBg: '#e67e22',
      badgeText: '商城购买'
    }
  },
  {
    id: 'skin-water-drop',
    type: 'timerSkin',
    name: '极简水滴',
    points: 5,
    icon: '💧',
    desc: '极致纯净的倒计时体验，专注无负担',
    skin: {
      id: 'water-drop',
      name: '极简水滴',
      previewBg: '#3498db',
      badgeText: '商城购买'
    }
  },
  {
    id: 'skin-cyberpunk',
    type: 'timerSkin',
    name: '赛博发光管',
    points: 8,
    icon: '⚡',
    desc: '暗色背景下耀眼的霓虹辉光，硬核专属',
    skin: {
      id: 'cyberpunk',
      name: '赛博发光',
      previewBg: '#9b59b6',
      badgeText: '商城购买'
    }
  }
];

function getDefaultState() {
  return {
    spentPoints: 0,
    blindBoxBonusPoints: 0,
    unlockedAvatarIds: [],
    unlockedThemeIds: [],
    unlockedTimerSkinIds: [],
    blindBoxHistory: [],
    purchaseHistory: []
  };
}

function uniqueList(list) {
  return Array.from(new Set(Array.isArray(list) ? list : []));
}

function normalizeState(state) {
  const baseState = state || {};
  return {
    spentPoints: Number(baseState.spentPoints || 0),
    blindBoxBonusPoints: Number(baseState.blindBoxBonusPoints || 0),
    unlockedAvatarIds: uniqueList(baseState.unlockedAvatarIds),
    unlockedThemeIds: uniqueList(baseState.unlockedThemeIds),
    unlockedTimerSkinIds: uniqueList(baseState.unlockedTimerSkinIds),
    blindBoxHistory: Array.isArray(baseState.blindBoxHistory) ? baseState.blindBoxHistory.slice(0, 20) : [],
    purchaseHistory: Array.isArray(baseState.purchaseHistory) ? baseState.purchaseHistory.slice(0, 50) : []
  };
}

function getMallState() {
  return normalizeState(wx.getStorageSync(STORAGE_KEY) || getDefaultState());
}

function saveMallState(state) {
  const normalizedState = normalizeState(state);
  cloudSync.saveAndSyncState(STORAGE_KEY, normalizedState);
  return normalizedState;
}

function calculateAvailablePoints(basePoints) {
  const mallState = getMallState();
  const availablePoints = basePoints + mallState.blindBoxBonusPoints - mallState.spentPoints;

  return {
    availablePoints: Math.max(0, availablePoints),
    spentPoints: mallState.spentPoints,
    blindBoxBonusPoints: mallState.blindBoxBonusPoints,
    mallState
  };
}

function pickBlindBoxReward() {
  const random = Math.random() * 100;
  let current = 0;

  for (let i = 0; i < BLIND_BOX_REWARDS.length; i++) {
    current += BLIND_BOX_REWARDS[i].probability;
    if (random <= current) {
      return BLIND_BOX_REWARDS[i];
    }
  }

  return BLIND_BOX_REWARDS[BLIND_BOX_REWARDS.length - 1];
}

function drawBlindBox(isFree) {
  const mallState = getMallState();
  const reward = pickBlindBoxReward();

  if (!isFree) {
    mallState.spentPoints += BLIND_BOX_COST;
  }

  mallState.blindBoxBonusPoints += reward.points;
  mallState.blindBoxHistory.unshift({
    points: reward.points,
    isFree: !!isFree,
    createdAt: Date.now()
  });

  return {
    reward,
    mallState: saveMallState(mallState)
  };
}

function purchaseItem(item) {
  const mallState = getMallState();
  const record = {
    id: item.id,
    type: item.type,
    name: item.name,
    points: item.points,
    createdAt: Date.now()
  };

  mallState.spentPoints += item.points;

  if (item.type === 'avatar' && item.avatar) {
    mallState.unlockedAvatarIds = uniqueList(mallState.unlockedAvatarIds.concat(item.avatar.id));
    record.unlockId = item.avatar.id;
  }

  if (item.type === 'theme' && item.theme) {
    mallState.unlockedThemeIds = uniqueList(mallState.unlockedThemeIds.concat(item.theme.id));
    record.unlockId = item.theme.id;
  }

  if (item.type === 'timerSkin' && item.skin) {
    mallState.unlockedTimerSkinIds = uniqueList(mallState.unlockedTimerSkinIds.concat(item.skin.id));
    record.unlockId = item.skin.id;
  }

  mallState.purchaseHistory.unshift(record);

  return saveMallState(mallState);
}

function hasUnlockedAvatar(avatarId) {
  return getMallState().unlockedAvatarIds.includes(avatarId);
}

function hasUnlockedTheme(themeId) {
  return getMallState().unlockedThemeIds.includes(themeId);
}

module.exports = {
  STORAGE_KEY,
  BLIND_BOX_COST,
  BLIND_BOX_REWARDS,
  SHOP_AVATAR_ITEMS,
  SHOP_THEME_ITEMS,
  SHOP_TIMER_SKIN_ITEMS,
  getMallState,
  saveMallState,
  calculateAvailablePoints,
  drawBlindBox,
  purchaseItem,
  hasUnlockedAvatar,
  hasUnlockedTheme
};
