const app = getApp();
const theme = require('../../utils/theme.js');

Page({
  data: { theme: 'mint' },
  onShow() {
    const t = app.globalData.theme;
    this.setData({ theme: t });
    theme.applyNav(t);
  }
});
