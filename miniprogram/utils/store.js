// ===== 物尽其轻 · 数据层（移植自 Android 单文件版 index.html）=====
// 微信小程序用 wx.getStorageSync / setStorageSync 替代 localStorage

const ITEMS_KEY = 'light_living_items_v1';
const CAT_KEY = 'light_living_categories_v1';
const STATUS_KEY = 'light_living_statuses_v1';
const THEME_KEY = 'light_living_theme_v1';
const AUTO_KEY = 'light_living_autobackup_v1';
const SEED_KEY = 'light_living_seeded_v1';
const DAY = 86400000;

const DEFAULT_CATS = ['数码电子', '服饰鞋包', '居家生活', '个人爱好', '其他'];

const DEFAULT_STATUSES = [
  { id: 's1', name: '物尽其用', emoji: '✨', color: '#57b89c', positive: true, applyTo: 'all', match: 'all', conditions: [] },
  { id: 's2', name: '独自吃灰', emoji: '🌫️', color: '#94a3b8', positive: false, applyTo: 'use', match: 'all', conditions: [{ metric: 'count', op: 'lte', value: 3 }, { metric: 'idle', op: 'gte', value: 30 }] },
  { id: 's3', name: '新伙伴', emoji: '💜', color: '#a78bfa', positive: true, applyTo: 'all', match: 'all', conditions: [{ metric: 'days', op: 'lte', value: 14 }] }
];

const METRICS = {
  unit: { label: '单位成本', unit: '¥' },
  days: { label: '陪伴天数', unit: '天' },
  count: { label: '打卡次数', unit: '次' },
  idle: { label: '未使用天数', unit: '天' }
};

const OPS = {
  gte: { label: '≥', fn: (a, b) => a >= b },
  lte: { label: '≤', fn: (a, b) => a <= b }
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function parseDate(s) {
  if (!s) return null;
  const p = String(s).split('-');
  if (p.length !== 3) return null;
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
function daysBetween(a, b) { return Math.floor((b - a) / DAY); }
function daysSince(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return 0;
  return Math.max(0, daysBetween(d, new Date()));
}

// ---------- 读取 / 保存 ----------
function getItems() { try { return wx.getStorageSync(ITEMS_KEY) || []; } catch (e) { return []; } }
function saveItems(items) { wx.setStorageSync(ITEMS_KEY, items); autoBackup(); }

function getCats() { try { return wx.getStorageSync(CAT_KEY) || DEFAULT_CATS.slice(); } catch (e) { return DEFAULT_CATS.slice(); } }
function saveCats(cats) { wx.setStorageSync(CAT_KEY, cats); autoBackup(); }

function getStatuses() {
  try {
    const s = wx.getStorageSync(STATUS_KEY);
    return (s && s.length) ? s : DEFAULT_STATUSES.slice();
  } catch (e) { return DEFAULT_STATUSES.slice(); }
}
function saveStatuses(s) { wx.setStorageSync(STATUS_KEY, s); autoBackup(); }

function getTheme() { try { return wx.getStorageSync(THEME_KEY) || 'mint'; } catch (e) { return 'mint'; } }
function setTheme(t) { wx.setStorageSync(THEME_KEY, t); }

// ---------- 示例案例（移植自网页版，首次打开自动载入，亦可手动载入） ----------
function seedItems() {
  const t = new Date();
  const d = (y, m, day) => {
    const dt = new Date(t.getFullYear() - y, m, day);
    return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
  };
  const now = Date.now();
  return [
    { id: 'seed1', name: '复古胶片相机', price: 1280, purchase: d(1, 8, 12), category: '个人爱好', mode: 'use', useCount: 46, checkins: ['2026-07-18'], emoji: '📸', image: '', note: '记录生活的眼睛，每一卷都值得。', archived: false, farewellAt: '', farewellNote: '', archiveReason: '', createdAt: now },
    { id: 'seed2', name: '机械键盘', price: 499, purchase: d(1, 0, 15), category: '数码电子', mode: 'time', useCount: 1, checkins: [], emoji: '⌨️', image: '', note: '敲字的手感，是每天的仪式感。', archived: false, farewellAt: '', farewellNote: '', archiveReason: '', createdAt: now + 1 },
    { id: 'seed3', name: '香薰蜡烛', price: 89, purchase: d(0, 5, 20), category: '居家生活', mode: 'time', useCount: 1, checkins: [], emoji: '🕯️', image: '', note: '睡前的一束微光与气息。', archived: false, farewellAt: '', farewellNote: '', archiveReason: '', createdAt: now + 2 },
    { id: 'seed4', name: '羊绒围巾', price: 259, purchase: d(1, 10, 2), category: '服饰鞋包', mode: 'use', useCount: 2, checkins: ['2026-01-05'], emoji: '🧣', image: '', note: '冬天的温柔铠甲，可惜很少戴。', archived: false, farewellAt: '', farewellNote: '', archiveReason: '', createdAt: now + 3 },
    { id: 'seed5', name: '便携蓝牙音箱', price: 399, purchase: d(2, 2, 1), category: '数码电子', mode: 'time', useCount: 1, checkins: [], emoji: '🔊', image: '', note: '露营与阳台的bgm。', archived: true, farewellAt: todayStr(), farewellNote: '用了几次就闲置了，希望下个人常带它出门。', archiveReason: '闲置处理', createdAt: now + 4 }
  ];
}
// 首次启动：若库为空且未载入过示例，则自动填充（仅触发一次）
function ensureSeed() {
  try {
    if (wx.getStorageSync(SEED_KEY)) return;
  } catch (e) { /* ignore */ }
  const items = getItems();
  if (!items.length) loadSamples();
  try { wx.setStorageSync(SEED_KEY, '1'); } catch (e) { /* ignore */ }
}
// 手动载入示例：仅补充缺失的示例条目，避免重复
function loadSamples() {
  const seeds = seedItems();
  const items = getItems();
  const have = {};
  items.forEach(it => { have[it.id] = true; });
  let added = 0;
  seeds.forEach(s => { if (!have[s.id]) { items.push(s); added++; } });
  if (added) saveItems(items);
  try { wx.setStorageSync(SEED_KEY, '1'); } catch (e) { /* ignore */ }
  return added;
}

// ---------- 物品指标 ----------
function companionDays(it) { return daysSince(it.purchase) + 1; }
function useCount(it) { return it.useCount || 0; }
function lastCheckin(it) {
  if (it.checkins && it.checkins.length) return it.checkins[it.checkins.length - 1];
  return it.purchase;
}
// 未使用天数：按次物品=距上次打卡（无打卡按入手日）；按天物品视为每天在用=0
function idleDays(it) { return it.mode === 'use' ? daysSince(lastCheckin(it)) : 0; }
// 每次使用成本
function unitCost(it) {
  const price = it.price || 0;
  if (it.mode === 'use') {
    const c = useCount(it);
    return c > 0 ? price / c : Infinity;
  }
  return price / companionDays(it);
}
// 每天成本（摊到陪伴天数）
function perDayCost(it) { return (it.price || 0) / companionDays(it); }

function metricValue(it, m) {
  if (m === 'unit') return unitCost(it);
  if (m === 'days') return companionDays(it);
  if (m === 'count') return useCount(it);
  if (m === 'idle') return idleDays(it);
  return 0;
}

// ---------- 状态规则评估 ----------
function evalStatuses(it) {
  const sts = getStatuses();
  const res = [];
  for (const s of sts) {
    if (s.applyTo !== 'all' && s.applyTo !== it.mode) continue;
    let ok = true;
    if (s.conditions && s.conditions.length) {
      for (const c of s.conditions) {
        const mv = metricValue(it, c.metric);
        const op = OPS[c.op];
        if (!op || !op.fn(mv, c.value)) { ok = false; break; }
      }
    }
    if (ok) res.push(s);
  }
  return res;
}
function isNegative(it) { return evalStatuses(it).some(s => s.positive === false); }

// ---------- 操作 ----------
function checkinItem(id) {
  const items = getItems();
  const it = items.find(x => x.id === id);
  if (!it) return;
  it.checkins = it.checkins || [];
  const t = todayStr();
  if (it.checkins[it.checkins.length - 1] !== t) it.checkins.push(t);
  it.useCount = (it.useCount || 0) + 1;
  it.lastUsed = t;
  saveItems(items);
}
function farewellItem(id, reason, note) {
  const items = getItems();
  const it = items.find(x => x.id === id);
  if (!it) return;
  it.archived = true;
  it.farewellAt = todayStr();
  it.archiveReason = reason || '闲置处理';
  it.farewellNote = note || '';
  saveItems(items);
}
function restoreItem(id) {
  const items = getItems();
  const it = items.find(x => x.id === id);
  if (!it) return;
  it.archived = false;
  it.farewellAt = '';
  saveItems(items);
}
function deleteItem(id) {
  let items = getItems();
  items = items.filter(x => x.id !== id);
  saveItems(items);
}
function upsertItem(it) {
  const items = getItems();
  if (it.id) {
    const idx = items.findIndex(x => x.id === it.id);
    if (idx >= 0) items[idx] = it; else items.unshift(it);
  } else {
    it.id = uid();
    it.createdAt = Date.now();
    it.checkins = [];
    it.useCount = 0;
    items.unshift(it);
  }
  saveItems(items);
  return it.id;
}

// 删除分类时把在用物品改派到其余分类
function deleteCategory(cat) {
  const cats = getCats().filter(c => c !== cat);
  if (!cats.length) return false;
  const fallback = cats[0];
  const items = getItems().map(it => {
    if (it.category === cat) it.category = fallback;
    return it;
  });
  saveCats(cats);
  saveItems(items);
  return true;
}
function renameCategory(oldName, newName) {
  const cats = getCats().map(c => c === oldName ? newName : c);
  const items = getItems().map(it => {
    if (it.category === oldName) it.category = newName;
    return it;
  });
  saveCats(cats);
  saveItems(items);
}
function addCategory(name) {
  const cats = getCats();
  if (cats.indexOf(name) >= 0) return false;
  cats.push(name);
  saveCats(cats);
  return true;
}

function saveStatus(s) {
  const sts = getStatuses();
  if (s.id) {
    const i = sts.findIndex(x => x.id === s.id);
    if (i >= 0) sts[i] = s; else sts.push(s);
  } else {
    s.id = uid();
    sts.push(s);
  }
  saveStatuses(sts);
  return s.id;
}
function deleteStatus(id) {
  const sts = getStatuses().filter(x => x.id !== id);
  saveStatuses(sts);
}

// ---------- 统计 ----------
function computeStats(itemsArg) {
  const items = itemsArg || getItems();
  let total = 0, perDay = 0, neg = 0, inf = false, count = 0;
  for (const it of items) {
    if (it.archived) continue;
    total += (it.price || 0);
    perDay += perDayCost(it);
    if (isNegative(it)) neg++;
    if (it.mode === 'use' && useCount(it) === 0) inf = true;
    count++;
  }
  return { total, perDay, neg, inf, count };
}

// ---------- 自动备份（保留 5 份带时间戳） ----------
function autoBackup() {
  try {
    const snap = { ts: Date.now(), items: getItems(), cats: getCats(), statuses: getStatuses() };
    let arr = wx.getStorageSync(AUTO_KEY) || [];
    arr.push(snap);
    if (arr.length > 5) arr = arr.slice(arr.length - 5);
    wx.setStorageSync(AUTO_KEY, arr);
  } catch (e) { /* ignore */ }
}
function getAutoBackups() { try { return wx.getStorageSync(AUTO_KEY) || []; } catch (e) { return []; } }
function restoreAuto(ts) {
  const arr = getAutoBackups();
  const s = arr.find(x => x.ts === ts);
  if (!s) return false;
  if (s.items) wx.setStorageSync(ITEMS_KEY, s.items);
  if (s.cats) wx.setStorageSync(CAT_KEY, s.cats);
  if (s.statuses) wx.setStorageSync(STATUS_KEY, s.statuses);
  return true;
}

// ---------- 导出 / 导入 ----------
function exportObj() {
  return {
    app: '物尽其轻',
    version: 1,
    exportedAt: Date.now(),
    items: getItems(),
    cats: getCats(),
    statuses: getStatuses()
  };
}
function importObj(obj) {
  if (!obj || !obj.items) return false;
  wx.setStorageSync(ITEMS_KEY, obj.items);
  if (obj.cats) wx.setStorageSync(CAT_KEY, obj.cats);
  if (obj.statuses) wx.setStorageSync(STATUS_KEY, obj.statuses);
  autoBackup();
  return true;
}

// ---------- 格式化 ----------
function money(n) {
  if (!isFinite(n)) return '∞';
  return '¥' + (Math.round(n * 100) / 100).toLocaleString();
}

function ruleSummary(s) {
  if (!s.conditions || !s.conditions.length) return '无条件（始终适用）';
  return s.conditions.map(c => {
    const m = METRICS[c.metric]; const o = OPS[c.op];
    return (m ? m.label : c.metric) + (o ? o.label : c.op) + c.value + (m ? m.unit : '');
  }).join(' 且 ');
}

module.exports = {
  METRICS, OPS, DEFAULT_CATS, DEFAULT_STATUSES,
  uid, todayStr, daysSince, companionDays, useCount, idleDays, unitCost, perDayCost, metricValue,
  getItems, saveItems, getCats, saveCats, getStatuses, saveStatuses, getTheme, setTheme,
  evalStatuses, isNegative, computeStats,
  checkinItem, farewellItem, restoreItem, deleteItem, upsertItem,
  deleteCategory, renameCategory, addCategory, saveStatus, deleteStatus,
  seedItems, loadSamples, ensureSeed,
  getAutoBackups, restoreAuto, exportObj, importObj, money, ruleSummary
};
