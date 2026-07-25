const app = getApp();
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');

Page({
  data: {
    theme: 'mint',
    cats: [],
    counts: {}
  },

  onShow() {
    const t = app.globalData.theme;
    this.setData({ theme: t });
    theme.applyNav(t);
    this.load();
  },

  load() {
    const cats = store.getCats();
    const counts = {};
    store.getItems().forEach(it => { counts[it.category] = (counts[it.category] || 0) + 1; });
    this.setData({ cats, counts });
  },

  addCat() {
    wx.showModal({
      title: '新增分类',
      editable: true,
      placeholderText: '例如：运动户外',
      success: r => {
        if (r.confirm && r.content && r.content.trim()) {
          const ok = store.addCategory(r.content.trim());
          if (!ok) wx.showToast({ title: '已存在该分类', icon: 'none' });
          this.load();
        }
      }
    });
  },

  renameCat(e) {
    const old = e.currentTarget.dataset.cat;
    wx.showModal({
      title: '重命名分类',
      editable: true,
      content: old,
      success: r => {
        if (r.confirm && r.content && r.content.trim() && r.content.trim() !== old) {
          store.renameCategory(old, r.content.trim());
          this.load();
        }
      }
    });
  },

  delCat(e) {
    const cat = e.currentTarget.dataset.cat;
    const n = this.data.counts[cat] || 0;
    let msg = '确定删除分类「' + cat + '」？';
    if (n > 0) msg += '\n其中 ' + n + ' 件物品将改派到其余分类的第一个。';
    wx.showModal({
      title: '删除分类', content: msg, confirmText: '删除', confirmColor: '#e07a6b',
      success: r => {
        if (r.confirm) {
          if (store.deleteCategory(cat)) this.load();
          else wx.showToast({ title: '至少保留一个分类', icon: 'none' });
        }
      }
    });
  }
});
