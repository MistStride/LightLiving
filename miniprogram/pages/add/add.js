const app = getApp();
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');

const EMOJIS = ['📱', '💻', '📷', '👟', '👜', '🧥', '📚', '🎮'];

Page({
  data: {
    theme: 'mint',
    id: '',
    isEdit: false,
    name: '',
    emoji: '✨',
    customEmoji: '',
    emojis: EMOJIS,
    image: '',
    cats: [],
    catIndex: 0,
    price: '',
    mode: 'time',
    purchase: '',
    useCount: '',
    note: ''
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
        d.customEmoji = EMOJIS.indexOf(d.emoji) >= 0 ? '' : d.emoji;
        d.image = it.image || '';
        d.price = it.price != null ? String(it.price) : '';
        d.mode = it.mode || 'time';
        d.purchase = it.purchase || store.todayStr();
        d.useCount = it.useCount != null ? String(it.useCount) : '';
        d.note = it.note || '';
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
  onNote(e) { this.setData({ note: e.detail.value }); },
  // 注意：tap 事件要用 e.currentTarget.dataset，而不是 e.detail.currentTarget（旧写法会抛错导致点击无反应）
  onEmoji(e) { this.setData({ emoji: e.currentTarget.dataset.e, customEmoji: '', image: '' }); },
  onCustomEmoji(e) {
    const v = e.detail.value;
    this.setData({ customEmoji: v, emoji: v, image: '' });
  },
  onCat(e) { this.setData({ catIndex: +e.detail.value }); },
  onMode(e) { this.setData({ mode: e.currentTarget.dataset.m }); },
  onDate(e) { this.setData({ purchase: e.detail.value }); },

  // 上传封面照片（压缩后转 base64 持久化，与原版行为一致）
  chooseCover() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const fp = res.tempFiles[0].tempFilePath;
        const fs = wx.getFileSystemManager();
        fs.readFile({
          filePath: fp,
          encoding: 'base64',
          success: (r) => {
            const ext = (fp.split('.').pop() || 'jpg').toLowerCase().replace('jpeg', 'jpg');
            const dataUrl = 'data:image/' + ext + ';base64,' + r.data;
            this.setData({ image: dataUrl });
          },
          fail: () => wx.showToast({ title: '读取图片失败', icon: 'none' })
        });
      }
    });
  },
  removeCover() { this.setData({ image: '' }); },

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
      image: d.image || '',
      category: d.cats[d.catIndex],
      price,
      mode: d.mode,
      purchase: d.purchase,
      note: (d.note || '').trim()
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
