// 主题令牌：三套配色 + 导航栏变色
const THEMES = {
  mint: {
    key: 'mint',
    name: '薄雾',
    navBg: '#3fae8e',
    navText: '#ffffff',
    bg: '#e6f6ee',
    primary: '#3fae8e'
  },
  purple: {
    key: 'purple',
    name: '鸢尾',
    navBg: '#7c6ff0',
    navText: '#ffffff',
    bg: '#f3eefe',
    primary: '#8b5cf6'
  },
  night: {
    key: 'night',
    name: '星夜',
    navBg: '#1f2624',
    navText: '#e6efeb',
    bg: '#15191a',
    primary: '#6fd3b5'
  }
};

// 在页面 onShow 调用，按主题设置微信导航栏颜色 + 窗口背景（消除夜间白色 overscroll）
function applyNav(themeKey) {
  const t = THEMES[themeKey] || THEMES.mint;
  // 三套主题的导航栏底色都偏深（薄荷绿 / 鸢尾紫 / 星夜黑），统一用白字最清晰
  wx.setNavigationBarColor({
    frontColor: '#ffffff',
    backgroundColor: t.navBg,
    animation: { duration: 200, timingFunc: 'easeIn' }
  });
  try {
    wx.setBackgroundColor({
      backgroundColor: t.bg,
      backgroundColorTop: t.bg,
      backgroundColorBottom: t.bg
    });
  } catch (e) { /* 部分基础库不支持，忽略 */ }
}

function list() {
  return Object.keys(THEMES).map(k => THEMES[k]);
}

module.exports = { THEMES, applyNav, list };
