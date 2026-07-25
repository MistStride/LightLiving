const app = getApp();
const store = require('../../utils/store.js');
const themeMod = require('../../utils/theme.js');

Page({
  data: {
    theme: 'mint',
    themes: [],
    lastBackup: '暂无记录',
    guardStatus: '已开启'
  },

  onShow() {
    const t = store.getTheme();
    app.globalData.theme = t;
    this.setData({ theme: t, themes: themeMod.list(), lastBackup: this.fmtLastBackup() });
    themeMod.applyNav(t);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1, theme: t });
    }
  },

  // 把最近一次自动备份的时间，转成「今天 14:30 / 昨天 / N天前 / 暂无记录」
  fmtLastBackup() {
    const arr = store.getAutoBackups();
    if (!arr.length) return '暂无记录';
    const ts = arr[arr.length - 1].ts;
    const d = new Date(ts);
    const now = new Date();
    const p = n => (n < 10 ? '0' + n : '' + n);
    const hm = p(d.getHours()) + ':' + p(d.getMinutes());
    const startOfDay = t => new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
    const diffDay = Math.floor((startOfDay(now) - startOfDay(d)) / 86400000);
    if (diffDay <= 0) return '今天 ' + hm;
    if (diffDay === 1) return '昨天 ' + hm;
    if (diffDay < 30) return diffDay + ' 天前';
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  },

  pickTheme(e) {
    const key = e.currentTarget.dataset.key;
    app.setTheme(key);
    this.setData({ theme: key });
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
