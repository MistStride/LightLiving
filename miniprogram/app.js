const store = require('./utils/store.js');

App({
  globalData: {
    theme: 'mint'
  },
  onLaunch() {
    this.globalData.theme = store.getTheme();
  }
});
