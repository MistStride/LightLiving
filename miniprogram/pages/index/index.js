const app = getApp();
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');

// 单位成本比较（对齐网页 cmpCost：∞ 视为最贵，desc 时排最前）
function cmpCost(a, b, desc) {
  const x = store.unitCost(a), y = store.unitCost(b);
  const infX = !isFinite(x), infY = !isFinite(y);
  if (infX && infY) return 0;
  if (infX) return desc ? -1 : 1;
  if (infY) return desc ? 1 : -1;
  return desc ? y - x : x - y;
}

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
    _archived: !!it.archived,
    _archiveReason: it.archiveReason || '',
    _farewellNote: it.farewellNote || '',
    _note: it.note || ''
  });
}

Page({
  data: {
    items: [],
    theme: 'mint',
    statusBarHeight: 20,
    tab: 'active',
    cats: ['全部'],
    filterCat: '全部',
    sort: 'cost_desc',
    sorts: [
      { key: 'cost_desc', label: '成本 高→低' },
      { key: 'cost_asc', label: '成本 低→高' },
      { key: 'date_desc', label: '陪伴时间' },
      { key: 'unseen_desc', label: '长久未见' }
    ],
    search: '',
    count: 0,
    emptyTitle: '这里还空空如也',
    emptySub: '点击右下角 ＋ ，记录第一件陪伴你的好物',
    stats: { total: '¥0', perDay: '¥0', neg: 0, inf: false, count: 0 },
    // 告别 sheet 状态
    showFarewell: false,
    farewellId: '',
    farewellMsg: '',
    farewellReason: '闲置处理',
    farewellReasons: ['赠送他人', '回收丢弃', '闲置处理'],
    farewellNote: '',
    celebrate: false,
    confetti: [],
    tabs: [
      { key: 'active', label: '陪伴中' },
      { key: 'gone', label: '圆满告别' }
    ]
  },

  onLoad() {
    try {
      const info = (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync());
      this.setData({ statusBarHeight: info.statusBarHeight || 20 });
    } catch (e) { /* 忽略 */ }
  },

  onShow() {
    // 从持久化读取主题（唯一可信来源），保证切换配色后回到首页必定同步
    const t = store.getTheme();
    app.globalData.theme = t;
    this.setData({ theme: t });
    theme.applyNav(t);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0, theme: t });
    }
    this.refresh();
    // 注册主题监听：即便 onShow 时序异常，配色变化也能即时同步到本页
    if (this._offTheme) this._offTheme();
    this._offTheme = app.onTheme(key => {
      this.setData({ theme: key });
      theme.applyNav(key);
      if (typeof this.getTabBar === 'function' && this.getTabBar()) this.getTabBar().setData({ theme: key });
    });
  },

  onHide() {
    if (this._offTheme) { this._offTheme(); this._offTheme = null; }
  },

  onUnload() {
    if (this._offTheme) { this._offTheme(); this._offTheme = null; }
  },

  refresh() {
    const cats = ['全部'].concat(store.getCats());
    const st = store.computeStats(store.getItems());
    const lightness = st.count ? Math.round((st.count - st.neg) / st.count * 100) : 0;
    const kw = (this.data.search || '').trim();
    const gone = this.data.tab === 'gone';
    let emptyTitle, emptySub;
    if (gone) {
      emptyTitle = '圆满告别区还空着';
      emptySub = '当一件物品与你温柔告别，它会安静地安放在这里，仍可随时找回。';
    } else if (kw) {
      emptyTitle = '没有匹配的好物';
      emptySub = '换个关键词或分类试试。';
    } else {
      emptyTitle = '这里还空空如也';
      emptySub = '点击右下角 ＋ ，记录第一件陪伴你的好物';
    }
    this.setData({
      cats,
      emptyTitle,
      emptySub,
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
    const t = this.data.tab;
    let list = store.getItems().map(decorate);
    if (t === 'gone') list = list.filter(i => i._archived);
    else list = list.filter(i => !i._archived);

    if (this.data.filterCat !== '全部') list = list.filter(i => i.category === this.data.filterCat);

    const kw = (this.data.search || '').trim().toLowerCase();
    if (kw) list = list.filter(i => (i.name + ' ' + (i.note || '')).toLowerCase().indexOf(kw) >= 0);

    // 排序（对齐网页：单位成本/陪伴时间/长久未见，∞ 视为最贵）
    const s = this.data.sort;
    if (s === 'cost_desc') list.sort((a, b) => cmpCost(a, b, true));
    else if (s === 'cost_asc') list.sort((a, b) => cmpCost(a, b, false));
    else if (s === 'date_desc') list.sort((a, b) => (b.purchase || '').localeCompare(a.purchase || ''));
    else if (s === 'unseen_desc') list.sort((a, b) => store.idleDays(b) - store.idleDays(a));

    this.setData({ items: list, count: list.length });
  },

  onSearch(e) {
    this.setData({ search: e.detail.value });
    this.applyFilter();
  },
  onClearSearch() {
    this.setData({ search: '' });
    this.applyFilter();
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
  onSortTap(e) {
    this.setData({ sort: e.currentTarget.dataset.key });
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
        else if (pick === '圆满告别') this.openFarewell(id);
        else if (pick === '恢复陪伴') { store.restoreItem(id); this.refresh(); wx.showToast({ title: '已回到陪伴册', icon: 'none' }); }
        else if (pick === '删除') this.doDelete(id);
      }
    });
  },

  // 载入示例好物（仅补充缺失条目，不重复）
  loadSamples() {
    const added = store.loadSamples();
    this.refresh();
    wx.showToast({ title: added > 0 ? '已载入 ' + added + ' 件示例' : '示例已存在', icon: 'none' });
  },

  // ---------- 告别 sheet（对齐网页：个性化告别语 + 方式 + 必填评语 + 撒花） ----------
  openFarewell(id) {
    const it = store.getItems().find(x => x.id === id);
    if (!it) return;
    const msg = '感谢「' + it.name + '」陪伴了你 ' + store.companionDays(it) + ' 天。\n放手，轻盈地生活。';
    this.setData({
      showFarewell: true,
      farewellId: id,
      farewellMsg: msg,
      farewellReason: '闲置处理',
      farewellNote: ''
    });
  },
  pickReason(e) { this.setData({ farewellReason: e.currentTarget.dataset.r }); },
  onFarewellNote(e) { this.setData({ farewellNote: e.detail.value }); },
  closeFarewell() { this.setData({ showFarewell: false }); },
  noop() {},
  confirmFarewell() {
    const note = (this.data.farewellNote || '').trim();
    if (!note) { wx.showToast({ title: '写句告别评语再走吧 💬', icon: 'none' }); return; }
    store.farewellItem(this.data.farewellId, this.data.farewellReason, note);
    this.setData({ showFarewell: false });
    this.refresh();
    this.startCelebrate();
    wx.showToast({ title: '🎉 已圆满告别，轻装上阵！', icon: 'none' });
    wx.vibrateShort && wx.vibrateShort({ type: 'light' });
  },
  startCelebrate() {
    const emojis = ['🎉', '💜', '✨', '🌿', '🪶', '💫'];
    const arr = [];
    for (let i = 0; i < 20; i++) {
      const left = (Math.random() * 100).toFixed(2);
      const delay = (Math.random() * 0.6).toFixed(2);
      const dur = (1.2 + Math.random() * 0.9).toFixed(2);
      arr.push({ id: i, e: emojis[i % emojis.length], style: 'left:' + left + '%;animation-delay:' + delay + 's;animation-duration:' + dur + 's;' });
    }
    this.setData({ celebrate: true, confetti: arr });
    setTimeout(() => { this.setData({ celebrate: false }); }, 2300);
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

});
