const app = getApp();
const store = require('../../utils/store.js');
const themeMod = require('../../utils/theme.js');

Page({
  data: {
    theme: 'mint',
    themes: [],
    poem: ''
  },

  onShow() {
    const t = store.getTheme();
    app.globalData.theme = t;
    const th = themeMod.THEMES[t] || themeMod.THEMES.mint;
    this.setData({ theme: t, themes: themeMod.list(), poem: th.poem });
    themeMod.applyNav(t);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1, theme: t });
    }
  },

  pickTheme(e) {
    const key = e.currentTarget.dataset.key;
    app.setTheme(key);
    const th = themeMod.THEMES[key] || themeMod.THEMES.mint;
    this.setData({ theme: key, poem: th.poem });
    themeMod.applyNav(key);
    const bar = (typeof this.getTabBar === 'function') ? this.getTabBar() : null;
    if (bar) bar.setData({ theme: key });
    wx.showToast({ title: '已切换：' + (themeMod.THEMES[key] ? themeMod.THEMES[key].name : key), icon: 'none' });
  },

  goGuide() { wx.navigateTo({ url: '/pages/guide/guide' }); },
  goRules() { wx.navigateTo({ url: '/pages/rules/rules' }); },
  goCats() { wx.navigateTo({ url: '/pages/categories/categories' }); },
  goBackup() { wx.navigateTo({ url: '/pages/backup/backup' }); },

  loadSamples() {
    const added = store.loadSamples();
    wx.showToast({ title: added > 0 ? '已载入 ' + added + ' 件示例' : '示例已存在', icon: 'none' });
  },

  about() {
    wx.navigateTo({ url: '/pages/about/about' });
  }
});
