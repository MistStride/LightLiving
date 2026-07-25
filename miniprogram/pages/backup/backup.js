const app = getApp();
const store = require('../../utils/store.js');
const theme = require('../../utils/theme.js');

function fmt(ts) {
  const d = new Date(ts);
  const p = n => (n < 10 ? '0' + n : '' + n);
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
}

// 最近一次自动备份 → 「今天 14:30 / 昨天 / N 天前 / 暂无记录」
function fmtLastBackup() {
  const arr = store.getAutoBackups();
  if (!arr.length) return '暂无记录';
  const ts = arr[arr.length - 1].ts;
  const d = new Date(ts);
  const now = new Date();
  const p = n => (n < 10 ? '0' + n : '' + n);
  const hm = p(d.getHours()) + ':' + p(d.getMinutes());
  const startOfDay = t => new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  const diffDay = Math.floor((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffDay <= 0) return '今天 ' + hm;
  if (diffDay === 1) return '昨天 ' + hm;
  if (diffDay < 30) return diffDay + ' 天前';
  return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

Page({
  data: {
    theme: 'mint',
    backups: [],
    exportedAt: '',
    lastBackup: '暂无记录'
  },

  onShow() {
    const t = app.globalData.theme;
    this.setData({ theme: t, lastBackup: fmtLastBackup() });
    theme.applyNav(t);
    this.load();
  },

  load() {
    const arr = store.getAutoBackups().map(b => ({ ts: b.ts, label: fmt(b.ts) }));
    arr.reverse();
    this.setData({ backups: arr });
  },

  restore(e) {
    const ts = +e.currentTarget.dataset.ts;
    wx.showModal({
      title: '恢复自动备份', content: '将用该时间点的数据覆盖当前内容，确定继续？',
      confirmText: '恢复', confirmColor: '#57b89c',
      success: r => {
        if (r.confirm) {
          if (store.restoreAuto(ts)) {
            wx.showToast({ title: '已恢复到该时间点 🕑', icon: 'none' });
            this.load();
          } else wx.showToast({ title: '恢复失败', icon: 'none' });
        }
      }
    });
  },

  exportFile() {
    const obj = store.exportObj();
    const str = JSON.stringify(obj, null, 2);
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/light-living-备份-${fmt(Date.now())}.json`;
    fs.writeFile({
      filePath, data: str, encoding: 'utf8',
      success: () => {
        if (wx.shareFileMessage) {
          wx.shareFileMessage({
            filePath, fileName: 'light-living-备份.json',
            success: () => wx.showToast({ title: '已发出，可存到云盘/文件传输助手', icon: 'none' }),
            fail: () => this.copyFallback(str)
          });
        } else this.copyFallback(str);
      },
      fail: () => this.copyFallback(str)
    });
  },

  copyFallback(str) {
    wx.setClipboardData({
      data: str,
      success: () => wx.showModal({
        title: '已复制备份内容', content: '当前环境不支持直接发文件，备份 JSON 已复制到剪贴板。可粘贴到「文件传输助手」或备忘录留存。',
        showCancel: false, confirmText: '好的'
      })
    });
  },

  importFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: res => {
        const f = res.tempFiles[0];
        const fs = wx.getFileSystemManager();
        fs.readFile({
          filePath: f.path,
          encoding: 'utf8',
          success: r => {
            try {
              const obj = JSON.parse(r.data);
              if (store.importObj(obj)) {
                wx.showToast({ title: '已从备份还原 📥', icon: 'none' });
                this.load();
              } else wx.showToast({ title: '文件格式不对', icon: 'none' });
            } catch (e) { wx.showToast({ title: '解析失败', icon: 'none' }); }
          },
          fail: () => wx.showToast({ title: '读取失败', icon: 'none' })
        });
      }
    });
  }
});
