const app = getApp();
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');

const EMOJIS = ['📱', '💻', '📷', '👟', '👜', '🧥', '🪑', '📚', '🎮', '🎧', '⌚', '🪴', '✨', '💜', '🍳', '🚲', '🧴', '🎒'];

Page({
  data: {
    theme: 'mint',
    id: '',
    isEdit: false,
    name: '',
    emoji: '✨',
    emojis: EMOJIS,
    cats: [],
    catIndex: 0,
    price: '',
    mode: 'time',
    purchase: '',
    useCount: ''
  },

  onLoad(q) {
    const t = app.globalData.theme;
    this.setData({ theme: t });
    theme.applyNav(t);

    const cats = store.getCats();
    const d = {
      cats,
      purchase: store.todayStr()
    };
    if (q && q.id) {
      const it = store.getItems().find(x => x.id === q.id);
      if (it) {
        d.id = it.id;
        d.isEdit = true;
        d.name = it.name || '';
        d.emoji = it.emoji || '✨';
        d.price = it.price != null ? String(it.price) : '';
        d.mode = it.mode || 'time';
        d.purchase = it.purchase || store.todayStr();
        d.useCount = it.useCount != null ? String(it.useCount) : '';
        const ci = cats.indexOf(it.category);
        d.catIndex = ci >= 0 ? ci : 0;
      }
    }
    this.setData(d);
    wx.setNavigationBarTitle({ title: d.isEdit ? '编辑好物' : '添一件好物' });
  },

  onName(e) { this.setData({ name: e.detail.value }); },
  onPrice(e) { this.setData({ price: e.detail.value }); },
  onUseCount(e) { this.setData({ useCount: e.detail.value }); },
  onEmoji(e) { this.setData({ emoji: e.detail.currentTarget.dataset.e }); },
  onCat(e) { this.setData({ catIndex: +e.detail.value }); },
  onMode(e) { this.setData({ mode: e.detail.value }); },
  onDate(e) { this.setData({ purchase: e.detail.value }); },

  save() {
    const d = this.data;
    const name = (d.name || '').trim();
    if (!name) { wx.showToast({ title: '给好物起个名字', icon: 'none' }); return; }
    const price = parseFloat(d.price);
    if (isNaN(price) || price < 0) { wx.showToast({ title: '价格填个数字', icon: 'none' }); return; }

    const obj = {
      id: d.id || '',
      name,
      emoji: d.emoji,
      category: d.cats[d.catIndex],
      price,
      mode: d.mode,
      purchase: d.purchase
    };
    if (d.mode === 'use') {
      const uc = parseInt(d.useCount, 10);
      obj.useCount = isNaN(uc) ? 0 : uc;
    }
    if (d.isEdit) {
      const old = store.getItems().find(x => x.id === d.id);
      if (old) {
        obj.checkins = old.checkins || [];
        obj.createdAt = old.createdAt;
        obj.archived = !!old.archived;
        obj.farewellAt = old.farewellAt || '';
      }
    }
    store.upsertItem(obj);
    wx.showToast({ title: d.isEdit ? '已保存' : '已收入陪伴册', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  },

  cancel() { wx.navigateBack(); }
});
