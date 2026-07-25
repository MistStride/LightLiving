const app = getApp();
const store = require('../../utils/store.js');
const themeMod = require('../../utils/theme.js');

Page({
  data: {
    theme: 'mint',
    themes: [],
    ver: '1.2.0'
  },

  onShow() {
    const t = app.globalData.theme;
    this.setData({ theme: t, themes: themeMod.list() });
    themeMod.applyNav(t);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1, theme: t });
    }
  },

  pickTheme(e) {
    const key = e.currentTarget.dataset.key;
    app.globalData.theme = key;
    store.setTheme(key);
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
    wx.showModal({
      title: '关于 物尽其轻',
      content: '一款极简的物品陪伴记录工具。记录你与每件物品的相处：相伴多久、每次使用的真实成本，长期闲置时温柔提醒你断舍离。数据只存在本机，不上传云端。\n\n版本 ' + this.data.ver,
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
