const fortunes = [
  { text: '大吉', color: '#e74c3c', desc: '今天学习效率很高，适合直接攻克最难的内容。' },
  { text: '中吉', color: '#e67e22', desc: '状态不错，适合稳步推进计划中的重点任务。' },
  { text: '小吉', color: '#f39c12', desc: '今天适合做整理、复盘和温和推进。' },
  { text: '平', color: '#2ecc71', desc: '节奏平稳，按计划完成就已经很不错。' },
  { text: '末吉', color: '#3498db', desc: '别太急，先把状态找回来，再继续学习。' },
  { text: '超吉', color: '#9b59b6', desc: '好运加持，适合挑战新的难点和陌生知识。' },
  { text: '顺利', color: '#1abc9c', desc: '复习旧知识会有明显收获，适合巩固。' },
  { text: '加油', color: '#e84393', desc: '今天更适合先开始，再慢慢进入状态。' }
];

const studySigns = [
  {
    level: '上上签',
    title: '状态拉满',
    summary: '适合直接啃最难的任务，今天的行动力会比平时更足。',
    action: '先做最难的一题或最难的一章，再处理其他内容。',
    accent: '#e74c3c'
  },
  {
    level: '上签',
    title: '稳步推进',
    summary: '今天更适合持续输出，把计划表上最重要的部分完成。',
    action: '挑 1 个主任务，给它留一整段不被打断的时间。',
    accent: '#f39c12'
  },
  {
    level: '中签',
    title: '复盘见效',
    summary: '适合整理笔记、改错和回看旧题，效率会比较高。',
    action: '把最近做错的题单独整理成一页复盘卡。',
    accent: '#1abc9c'
  },
  {
    level: '平签',
    title: '轻量坚持',
    summary: '不一定适合猛冲，但很适合做完今天该做的部分。',
    action: '降低目标量，先完成最低标准，再决定要不要加码。',
    accent: '#3498db'
  },
  {
    level: '吉签',
    title: '适合输出',
    summary: '今天讲给别人听、自己写总结，会比闷头看更有效。',
    action: '把今天学到的内容写成一段 100 字总结。',
    accent: '#9b59b6'
  },
  {
    level: '守签',
    title: '先稳住节奏',
    summary: '今天更需要稳，不适合同时开太多任务。',
    action: '关掉多余页面，只保留一个任务窗口，先专心 25 分钟。',
    accent: '#16a085'
  }
];

const segCount = fortunes.length;
const segDeg = 360 / segCount;

const quotes = [
  { text: '"学而不思则罔，思而不学则殆。"', author: '孔子《论语》' },
  { text: '"业精于勤，荒于嬉；行成于思，毁于随。"', author: '韩愈《进学解》' },
  { text: '"书山有路勤为径，学海无涯苦作舟。"', author: '韩愈' },
  { text: '"黑发不知勤学早，白首方悔读书迟。"', author: '颜真卿' },
  { text: '"君子博学而日参省乎己，则知明而行无过矣。"', author: '荀子《劝学》' }
];

Page({
  data: {
    fortunes,
    studySigns,
    segDeg,
    isSpinning: false,
    result: null,
    showResult: false,
    pointerAnimation: {},
    quote: {},
    animateTrigger: false,
    viewMode: 'menu',
    currentSign: null,
    isDrawingSign: false
  },

  onLoad: function () {
    this.currentAngle = 0;
    this.setRandomQuote();
  },

  onShow: function () {
    this.playTabEnter();
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

  setRandomQuote: function () {
    const idx = Math.floor(Math.random() * quotes.length);
    this.setData({ quote: quotes[idx] });
  },

  openEntry: function (e) {
    const mode = e.currentTarget.dataset.mode;
    if (!mode) {
      return;
    }

    this.setRandomQuote();
    this.setData({
      viewMode: mode,
      showResult: false
    });
  },

  backToMenu: function () {
    this.setRandomQuote();
    this.setData({
      viewMode: 'menu',
      showResult: false
    });
  },

  onSpin: function () {
    if (this.data.isSpinning) return;

    const rounds = 4 + Math.floor(Math.random() * 3);
    const randomDeg = Math.floor(Math.random() * 360);
    const totalDeg = rounds * 360 + randomDeg;

    const animation = wx.createAnimation({
      duration: 4000,
      timingFunction: 'ease-out'
    });

    this.currentAngle += totalDeg;
    animation.rotate(this.currentAngle).step();

    this.setData({
      isSpinning: true,
      showResult: false,
      pointerAnimation: animation.export()
    });

    setTimeout(() => {
      const finalDeg = this.currentAngle % 360;
      const idx = Math.floor(finalDeg / segDeg) % segCount;
      const fortune = fortunes[idx];

      this.setData({
        isSpinning: false,
        result: fortune,
        showResult: true
      });

      this.setRandomQuote();
      wx.vibrateShort({ type: 'medium' });
    }, 4200);
  },

  drawStudySign: function () {
    if (this.data.isDrawingSign) {
      return;
    }

    this.setData({
      isDrawingSign: true,
      currentSign: null
    });

    setTimeout(() => {
      const idx = Math.floor(Math.random() * studySigns.length);
      this.setData({
        isDrawingSign: false,
        currentSign: studySigns[idx]
      });
      this.setRandomQuote();
      wx.vibrateShort({ type: 'light' });
    }, 900);
  },

  onCloseResult: function () {
    this.setData({ showResult: false });
  },

  onAdminTap: function () {
    wx.showModal({
      title: '进入管理员模式',
      content: '请输入管理员密码',
      editable: true,
      placeholderText: 'Password',
      success(res) {
        if (res.confirm) {
          const pwd = res.content;
          if (pwd === 'admin123' || pwd === '888888') {
            wx.navigateTo({
              url: '/pages/admin/admin',
            });
          } else {
            wx.showToast({
              title: '密码错误',
              icon: 'error'
            });
          }
        }
      }
    });
  }
});
