const mallUtil = require('../../utils/mall.js');
const memberUtil = require('../../utils/member.js');
const cloudSync = require('../../utils/cloudSync.js');

const DEFAULT_THEME_ID = 'avatar-default';
const DEFAULT_AVATAR_ID = 'coder';
const DEFAULT_TIMER_SKIN_ID = 'skin-default';

const BASE_AVATAR_LIST = [
  {
    id: 'coder',
    name: '程序员头像',
    text: '👨‍💻',
    bg: 'linear-gradient(135deg, #4A90D9, #357ABD)',
    reqHours: 0,
    reqLevel: '见习会员'
  },
  {
    id: 'worker',
    name: '实干家头像',
    text: '👨‍🏭',
    bg: 'linear-gradient(135deg, #16a085, #1abc9c)',
    reqHours: 0,
    reqLevel: '见习会员'
  },
  {
    id: 'scholar',
    name: '讲师头像',
    text: '🧑‍🏫',
    bg: 'linear-gradient(135deg, #e67e22, #d35400)',
    reqHours: 0,
    reqLevel: '见习会员'
  },
  {
    id: 'student',
    name: '学霸头像',
    text: '👩‍🎓',
    bg: 'linear-gradient(135deg, #6dd5ed, #2193b0)',
    reqHours: 10,
    reqLevel: '普通会员'
  },
  {
    id: 'panda',
    name: '熊猫头像',
    text: '🐼',
    bg: 'linear-gradient(135deg, #f6d365, #fda085)',
    reqHours: 100,
    reqLevel: '黄金会员'
  },
  {
    id: 'fox',
    name: '紫狐头像',
    text: '🦊',
    bg: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
    reqHours: 200,
    reqLevel: '铂金会员'
  },
  {
    id: 'unicorn',
    name: '独角兽头像',
    text: '🦄',
    bg: 'linear-gradient(135deg, #FF6B6B, #5352ED)',
    reqHours: 300,
    reqLevel: '钻石会员'
  },
  {
    id: 'dragon',
    name: '龙神头像',
    text: '🐉',
    bg: 'linear-gradient(135deg, #2C3A47, #1B1464)',
    reqHours: 500,
    reqLevel: '黑金会员'
  }
];

const AVATAR_TEXT_TO_ID = BASE_AVATAR_LIST.concat(
  mallUtil.SHOP_AVATAR_ITEMS.map(item => ({
    id: item.avatar.id,
    text: item.avatar.text
  }))
).reduce((map, item) => {
  map[item.text] = item.id;
  return map;
}, {});

function getGenderIndex(gender) {
  if (gender === '男') {
    return 0;
  }
  if (gender === '女') {
    return 1;
  }
  return 2;
}

function buildAvatarList(userHours, mallState) {
  const memberAvatars = BASE_AVATAR_LIST.map(item => ({
    ...item,
    unlockType: 'member',
    badgeText: item.reqHours === 0 ? '默认可用' : '会员解锁',
    unlocked: userHours >= item.reqHours,
    lockText: item.reqHours === 0 ? '' : `${item.reqLevel} · ${item.reqHours} 小时`
  }));

  const shopAvatars = mallUtil.SHOP_AVATAR_ITEMS.map(item => ({
    id: item.avatar.id,
    name: item.avatar.name,
    text: item.avatar.text,
    bg: item.avatar.bg,
    unlockType: 'shop',
    badgeText: `商城 ${item.points} 点`,
    unlocked: mallState.unlockedAvatarIds.includes(item.avatar.id),
    lockText: '商城购买后可用'
  }));

  return memberAvatars.concat(shopAvatars);
}

function buildThemeList(mallState) {
  const defaultTheme = {
    id: DEFAULT_THEME_ID,
    name: '默认底色',
    desc: '恢复系统默认的页面背景和卡片底色',
    bg: 'linear-gradient(135deg, #eef3f9, #d7e4f2)',
    pageBg: '',
    cardBg: '',
    tabBarBg: '',
    unlockType: 'default',
    badgeText: '默认',
    unlocked: true,
    isDefault: true,
    lockText: ''
  };

  const shopThemes = mallUtil.SHOP_THEME_ITEMS.map(item => ({
    id: item.theme.id,
    name: item.theme.name,
    desc: item.desc,
    bg: item.theme.bg,
    pageBg: item.theme.pageBg,
    cardBg: item.theme.cardBg,
    tabBarBg: item.theme.tabBarBg,
    unlockType: 'shop',
    badgeText: `商城 ${item.points} 点`,
    unlocked: mallState.unlockedThemeIds.includes(item.theme.id),
    isDefault: false,
    lockText: '商城购买后可用'
  }));

  return [defaultTheme].concat(shopThemes);
}

function buildTimerSkinList(userHours, mallState) {
  const defaultSkin = {
    id: DEFAULT_TIMER_SKIN_ID,
    name: '经典数字',
    desc: '系统默认的标准计时器样式',
    previewBg: '#95a5a6',
    icon: '⏱️',
    unlockType: 'default',
    badgeText: '默认',
    unlocked: true,
    isDefault: true,
    lockText: ''
  };

  const shopSkins = mallUtil.SHOP_TIMER_SKIN_ITEMS.map(item => ({
    id: item.skin.id,
    name: item.skin.name,
    desc: item.desc,
    previewBg: item.skin.previewBg,
    icon: item.icon,
    unlockType: 'shop',
    badgeText: `商城 ${item.points} 点`,
    unlocked: (mallState.unlockedTimerSkinIds || []).includes(item.skin.id),
    isDefault: false,
    lockText: '商城购买'
  }));

  const vipSkins = memberUtil ? memberUtil.getTiers().filter(tier => tier.reward.timerSkin).map(tier => ({
    id: tier.reward.timerSkin.id,
    name: tier.reward.timerSkin.name,
    desc: `专属皮肤，彰显尊贵身份`,
    previewBg: tier.cardBg,
    icon: tier.icon,
    unlockType: 'member',
    badgeText: `${tier.level}解锁`,
    unlocked: userHours >= tier.reqHours,
    isDefault: false,
    lockText: `${tier.level}解锁`
  })) : [];

  return [defaultSkin].concat(shopSkins).concat(vipSkins);
}

function resolveSelectedAvatarId(userInfo, avatarList) {
  const fallbackId = userInfo.avatarId || AVATAR_TEXT_TO_ID[userInfo.avatarText] || DEFAULT_AVATAR_ID;
  const currentAvatar = avatarList.find(item => item.id === fallbackId && item.unlocked);
  return currentAvatar ? currentAvatar.id : DEFAULT_AVATAR_ID;
}

function resolveSelectedThemeId(userInfo, themeList) {
  if (userInfo.themeColorId) {
    const matchedTheme = themeList.find(item => item.id === userInfo.themeColorId && item.unlocked);
    if (matchedTheme) {
      return matchedTheme.id;
    }
  }

  return DEFAULT_THEME_ID;
}

function resolveSelectedTimerSkinId(userInfo, skinList) {
  if (userInfo.timerSkinId) {
    const matchedSkin = skinList.find(item => item.id === userInfo.timerSkinId && item.unlocked);
    if (matchedSkin) {
      return matchedSkin.id;
    }
  }
  return DEFAULT_TIMER_SKIN_ID;
}

function buildThemeStyleState(theme) {
  return {
    themePageStyle: theme && theme.pageBg ? `background: ${theme.pageBg};` : '',
    themeCardStyle: theme && theme.cardBg ? `background: ${theme.cardBg};` : ''
  };
}

Page({
  data: {
    avatarList: [],
    themeList: [],
    timerSkinList: [],
    userHours: 0,
    selectedAvatarId: DEFAULT_AVATAR_ID,
    selectedThemeId: DEFAULT_THEME_ID,
    selectedTimerSkinId: DEFAULT_TIMER_SKIN_ID,
    nickname: '',
    genderList: ['男', '女', '保密'],
    genderIndex: 2,
    motto: '',
    themePageStyle: '',
    themeCardStyle: ''
  },

  onLoad: function () {
    this.refreshPageData();
  },

  onShow: function () {
    this.refreshPageData();
  },

  refreshPageData: function () {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const userHours = Number(wx.getStorageSync('userCumulativeHours') || 0);
    const mallState = mallUtil.getMallState();
    const avatarList = buildAvatarList(userHours, mallState);
    const themeList = buildThemeList(mallState);
    const timerSkinList = buildTimerSkinList(userHours, mallState);
    const selectedThemeId = resolveSelectedThemeId(userInfo, themeList);
    const selectedTheme = themeList.find(item => item.id === selectedThemeId) || themeList[0];
    const selectedTimerSkinId = resolveSelectedTimerSkinId(userInfo, timerSkinList);

    this.setData({
      avatarList,
      themeList,
      timerSkinList,
      userHours,
      nickname: userInfo.name || '刘',
      motto: userInfo.motto || '',
      genderIndex: getGenderIndex(userInfo.gender),
      selectedAvatarId: resolveSelectedAvatarId(userInfo, avatarList),
      selectedThemeId,
      selectedTimerSkinId,
      ...buildThemeStyleState(selectedTheme)
    });
  },

  onSelectAvatar: function (e) {
    const item = e.currentTarget.dataset.item;

    if (!item.unlocked) {
      const title = item.unlockType === 'shop'
        ? '请先在商城购买这个头像'
        : `需达到${item.reqLevel}（${item.reqHours}小时）`;

      wx.showToast({
        title,
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({ selectedAvatarId: item.id });
  },

  onSelectTheme: function (e) {
    const item = e.currentTarget.dataset.item;

    if (!item.unlocked) {
      wx.showToast({
        title: '请先在商城购买这个配色',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({
      selectedThemeId: item.id,
      ...buildThemeStyleState(item)
    });
  },

  onSelectTimerSkin: function (e) {
    const item = e.currentTarget.dataset.item;

    if (!item.unlocked) {
      wx.showToast({
        title: item.unlockType === 'shop' ? '请先在商城兑换' : item.lockText,
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({ selectedTimerSkinId: item.id });
  },

  onInputName: function (e) {
    this.setData({ nickname: e.detail.value });
  },

  onInputMotto: function (e) {
    this.setData({ motto: e.detail.value });
  },

  onChangeGender: function (e) {
    this.setData({ genderIndex: parseInt(e.detail.value, 10) });
  },

  onSave: function () {
    const { nickname, motto, genderIndex, genderList, selectedAvatarId, selectedThemeId, selectedTimerSkinId, avatarList, themeList, timerSkinList } = this.data;

    if (!nickname.trim()) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }

    const selectedAvatar = avatarList.find(item => item.id === selectedAvatarId);
    const selectedTheme = themeList.find(item => item.id === selectedThemeId) || themeList[0];
    const selectedTimerSkin = timerSkinList.find(item => item.id === selectedTimerSkinId) || timerSkinList[0];

    if (!selectedAvatar || !selectedAvatar.unlocked) {
      wx.showToast({ title: '当前头像未解锁', icon: 'none' });
      return;
    }

    if (!selectedTheme || !selectedTheme.unlocked) {
      wx.showToast({ title: '当前配色未解锁', icon: 'none' });
      return;
    }

    const previousUserInfo = wx.getStorageSync('userInfo') || {};

    const newUserInfo = {
      ...previousUserInfo,
      name: nickname.trim(),
      gender: genderList[genderIndex],
      motto: motto.trim(),
      avatarId: selectedAvatar.id,
      avatarText: selectedAvatar.text,
      avatarBg: selectedAvatar.bg,
      themeColorId: selectedTheme.id,
      themeColorBg: selectedTheme.bg || '',
      themePageBg: selectedTheme.pageBg || '',
      themeCardBg: selectedTheme.cardBg || '',
      themeTabBarBg: selectedTheme.tabBarBg || '',
      timerSkinId: selectedTimerSkin.id,
      timerSkinName: selectedTimerSkin.name
    };

    cloudSync.saveAndSyncState('userInfo', newUserInfo);
    wx.setStorageSync('customUserName', nickname.trim());

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
      success: function () {
        setTimeout(function () {
          wx.navigateBack();
        }, 1500);
      }
    });
  }
});
