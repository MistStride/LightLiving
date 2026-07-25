const store = require('./utils/store.js');

App({
  globalData: {
    theme: 'mint'
  },
  themeListeners: [],
  onLaunch() {
    this.globalData.theme = store.getTheme();
    store.ensureSeed();
  },
  // 统一切换主题：写全局 + 持久化 + 广播给已注册的页面（保证跨页面即时同步）
  setTheme(key) {
    this.globalData.theme = key;
    store.setTheme(key);
    (this.themeListeners || []).forEach(fn => { try { fn(key); } catch (e) {} });
  },
  // 页面注册主题监听，返回注销函数
  onTheme(fn) {
    this.themeListeners = this.themeListeners || [];
    this.themeListeners.push(fn);
    return () => {
      const i = this.themeListeners.indexOf(fn);
      if (i >= 0) this.themeListeners.splice(i, 1);
    };
  }
});
