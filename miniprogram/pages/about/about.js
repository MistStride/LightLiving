const app = getApp();
const theme = require('../../utils/theme.js');

function getStatusBarHeight() {
  try {
    if (wx.getWindowInfo) return wx.getWindowInfo().statusBarHeight || 20;
  } catch (e) {}
  try {
    return wx.getSystemInfoSync().statusBarHeight || 20;
  } catch (e2) { return 20; }
}

Page({
  data: {
    theme: 'mint',
    statusBarHeight: 20
  },

  onLoad() {
    this.setData({ statusBarHeight: getStatusBarHeight() });
  },

  onShow() {
    const t = app.globalData.theme;
    this.setData({ theme: t });
    theme.applyNav(t);
  }
});
