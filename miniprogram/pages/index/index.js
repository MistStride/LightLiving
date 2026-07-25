const app = getApp();
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');

function decorate(it) {
  const sts = store.evalStatuses(it);
  const idle = store.idleDays(it);
  let idleText = '';
  if (it.mode === 'use') {
    if (store.useCount(it) === 0) idleText = '还没用过';
    else if (idle === 0) idleText = '今天用过';
    else idleText = idle + ' 天没用';
  }
  const img = it.image || '';
  const isImg = img.indexOf('data:') === 0;
  let thumb = it.emoji || '';
  if (!thumb) { const ch = Array.from(it.name || '')[0] || ''; thumb = /\p{Extended_Pictographic}/u.test(ch) ? ch : '📦'; }
  return Object.assign({}, it, {
    _img: isImg ? img : '',
    _thumb: thumb,
    _days: store.companionDays(it),
    _perDay: store.money(store.perDayCost(it)),
    _perUse: store.money(store.unitCost(it)),
    _priceText: store.money(it.price || 0),
    _idle: idle,
    _idleText: idleText,
    _statuses: sts,
    _neg: sts.some(s => s.positive === false),
    _archived: !!it.archived
  });
}

Page({
  data: {
    items: [],
    theme: 'mint',
    tab: '',
    cats: ['全部'],
    filterCat: '全部',
    sort: 'recent',
    stats: { total: '¥0', perDay: '¥0', neg: 0, inf: false, count: 0 },
    tabs: [
      { key: 'active', label: '陪伴中' },
      { key: 'neg', label: '断舍离' }
    ]
  },

  onShow() {
    const t = app.globalData.theme;
    this.setData({ theme: t });
    theme.applyNav(t);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0, theme: t });
    }
    this.refresh();
  },

  refresh() {
    const cats = ['全部'].concat(store.getCats());
    const st = store.computeStats(store.getItems());
    const lightness = st.count ? Math.round((st.count - st.neg) / st.count * 100) : 0;
    this.setData({
      cats,
      stats: {
        total: store.money(st.total),
        perDay: store.money(st.perDay) + (st.inf ? ' ＋ ∞' : ''),
        neg: st.neg,
        count: st.count,
        lightness
      }
    });
    this.applyFilter();
  },

  applyFilter() {
    let list = store.getItems().map(decorate);
    list = list.filter(i => !i._archived);
    const t = this.data.tab;
    if (t === 'active') list = list.filter(i => !i._neg);
    else if (t === 'neg') list = list.filter(i => i._neg);

    if (this.data.filterCat !== '全部') list = list.filter(i => i.category === this.data.filterCat);

    const s = this.data.sort;
    if (s === 'cost_desc') list.sort((a, b) => store.perDayCost(b) - store.perDayCost(a));
    else if (s === 'cost_asc') list.sort((a, b) => store.perDayCost(a) - store.perDayCost(b));
    else if (s === 'idle') list.sort((a, b) => store.idleDays(b) - store.idleDays(a));
    else list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    this.setData({ items: list });
  },

  onTab(e) {
    const k = e.currentTarget.dataset.key;
    this.setData({ tab: this.data.tab === k ? '' : k });
    this.applyFilter();
  },
  onFilter(e) {
    this.setData({ filterCat: e.currentTarget.dataset.cat });
    this.applyFilter();
  },
  onSort(e) {
    const SORTS = ['recent', 'cost_desc', 'cost_asc', 'idle'];
    const idx = +e.detail.value;
    this.setData({ sort: SORTS[idx] });
    this.applyFilter();
  },

  onAdd() { wx.navigateTo({ url: '/pages/add/add' }); },
  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/add/add?id=' + id });
  },

  onLongPress(e) {
    const id = e.currentTarget.dataset.id;
    const it = store.getItems().find(x => x.id === id);
    if (!it) return;
    const actions = it.archived
      ? ['编辑', '恢复陪伴', '删除']
      : ['编辑', '打卡一次', '圆满告别', '删除'];
    wx.showActionSheet({
      itemList: actions,
      success: res => {
        const pick = actions[res.tapIndex];
        if (pick === '编辑') this.onEdit({ currentTarget: { dataset: { id } } });
        else if (pick === '打卡一次') { store.checkinItem(id); this.refresh(); wx.showToast({ title: '已打卡 ✨', icon: 'none' }); }
        else if (pick === '圆满告别') this.doFarewell(id);
        else if (pick === '恢复陪伴') { store.restoreItem(id); this.refresh(); wx.showToast({ title: '已回到陪伴册', icon: 'none' }); }
        else if (pick === '删除') this.doDelete(id);
      }
    });
  },

  doFarewell(id) {
    const it = store.getItems().find(x => x.id === id);
    wx.showModal({
      title: '圆满告别',
      content: '确定让「' + (it ? it.name : '') + '」圆满告别吗？它会移入「圆满告别」，仍可恢复。',
      confirmText: '告别',
      confirmColor: '#e07a6b',
      success: r => { if (r.confirm) { store.farewellItem(id); this.refresh(); wx.showToast({ title: '放手，轻盈地生活。', icon: 'none' }); } }
    });
  },

  doDelete(id) {
    const it = store.getItems().find(x => x.id === id);
    wx.showModal({
      title: '删除物品',
      content: '确定删除「' + (it ? it.name : '') + '」？此操作不可恢复。',
      confirmText: '删除',
      confirmColor: '#e07a6b',
      success: r => { if (r.confirm) { store.deleteItem(id); this.refresh(); wx.showToast({ title: '已删除', icon: 'none' }); } }
    });
  },

  goSettings() { wx.switchTab({ url: '/pages/settings/settings' }); }
});
