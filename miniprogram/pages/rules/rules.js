const app = getApp();
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');

const EMOJIS = ['✨', '🌫️', '💜', '💎', '🔥', '🌿', '🌟', '💤', '⚡', '❤️', '🍃', '🛋️'];
const COLORS = ['#57b89c', '#2faa5a', '#a78bfa', '#f59e0b', '#ef6b6b', '#60a5fa', '#94a3b8', '#ec4899'];
const METRIC_KEYS = ['unit', 'days', 'count', 'idle'];
const OP_KEYS = ['gte', 'lte'];
const APPLY = ['all', 'time', 'use'];
const APPLY_LABEL = { all: '全部物品', time: '按天陪伴', use: '按次使用' };

Page({
  data: {
    theme: 'mint',
    statuses: [],
    editing: null,      // 编辑中的状态对象
    emojis: EMOJIS,
    colors: COLORS,
    metricKeys: METRIC_KEYS,
    metricLabels: METRIC_KEYS.map(k => store.METRICS[k].label),
    opKeys: OP_KEYS,
    opLabels: OP_KEYS.map(k => store.OPS[k].label),
    applyOptions: APPLY.map(k => APPLY_LABEL[k]),
    applyIndex: 0,
    condMetricIdx: [],
    condOpIdx: []
  },

  onShow() {
    const t = app.globalData.theme;
    this.setData({ theme: t });
    theme.applyNav(t);
    this.load();
  },

  load() {
    this.setData({ statuses: store.getStatuses().map(s => Object.assign({}, s, { _summary: store.ruleSummary(s) })) });
  },

  openAdd() {
    this.startEdit({ name: '', emoji: '✨', color: COLORS[0], positive: true, applyTo: 'all', match: 'all', conditions: [] });
  },
  openEdit(e) {
    const id = e.currentTarget.dataset.id;
    const s = store.getStatuses().find(x => x.id === id);
    if (s) this.startEdit(JSON.parse(JSON.stringify(s)));
  },
  startEdit(s) {
    const applyIndex = APPLY.indexOf(s.applyTo);
    const condMetricIdx = (s.conditions || []).map(c => METRIC_KEYS.indexOf(c.metric));
    const condOpIdx = (s.conditions || []).map(c => OP_KEYS.indexOf(c.op));
    this.setData({ editing: s, applyIndex: applyIndex < 0 ? 0 : applyIndex, condMetricIdx, condOpIdx });
  },
  closeEdit() { this.setData({ editing: null }); },
  noop() {},

  eName(e) { this.setData({ 'editing.name': e.detail.value }); },
  eEmoji(e) { this.setData({ 'editing.emoji': e.currentTarget.dataset.e }); },
  eColor(e) { this.setData({ 'editing.color': e.currentTarget.dataset.c }); },
  ePositive(e) { this.setData({ 'editing.positive': e.detail.value }); },
  eApply(e) { this.setData({ applyIndex: +e.detail.value, 'editing.applyTo': APPLY[+e.detail.value] }); },

  eCondMetric(e) {
    const i = e.currentTarget.dataset.i;
    const v = +e.detail.value;
    this.setData({ ['condMetricIdx[' + i + ']']: v, ['editing.conditions[' + i + '].metric']: METRIC_KEYS[v] });
  },
  eCondOp(e) {
    const i = e.currentTarget.dataset.i;
    const v = +e.detail.value;
    this.setData({ ['condOpIdx[' + i + ']']: v, ['editing.conditions[' + i + '].op']: OP_KEYS[v] });
  },
  eCondVal(e) {
    const i = e.currentTarget.dataset.i;
    this.setData({ ['editing.conditions[' + i + '].value']: +e.detail.value });
  },
  addCond() {
    const conds = this.data.editing.conditions.concat([{ metric: 'idle', op: 'gte', value: 30 }]);
    this.setData({ 'editing.conditions': conds, condMetricIdx: this.data.condMetricIdx.concat([METRIC_KEYS.indexOf('idle')]), condOpIdx: this.data.condOpIdx.concat([OP_KEYS.indexOf('gte')]) });
  },
  delCond(e) {
    const i = e.currentTarget.dataset.i;
    const conds = this.data.editing.conditions.slice();
    conds.splice(i, 1);
    const cm = this.data.condMetricIdx.slice(); cm.splice(i, 1);
    const co = this.data.condOpIdx.slice(); co.splice(i, 1);
    this.setData({ 'editing.conditions': conds, condMetricIdx: cm, condOpIdx: co });
  },

  saveEdit() {
    const s = this.data.editing;
    if (!s.name || !s.name.trim()) { wx.showToast({ title: '给状态起个名', icon: 'none' }); return; }
    (s.conditions || []).forEach(c => { c.value = +c.value || 0; });
    store.saveStatus(s);
    this.setData({ editing: null });
    this.load();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  del(e) {
    const id = e.currentTarget.dataset.id;
    const s = store.getStatuses().find(x => x.id === id);
    wx.showModal({
      title: '删除状态', content: '确定删除「' + (s ? s.name : '') + '」？',
      confirmText: '删除', confirmColor: '#e07a6b',
      success: r => { if (r.confirm) { store.deleteStatus(id); this.load(); } }
    });
  }
});
