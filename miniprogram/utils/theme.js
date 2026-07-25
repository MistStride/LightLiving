// 主题令牌：三套配色 + 导航栏变色
const THEMES = {
  mint: {
    key: 'mint',
    name: '竹杖',
    navBg: '#3fae8e',
    navText: '#ffffff',
    bg: '#e6f6ee',
    primary: '#3fae8e',
    dot: '#3fae8e'
  },
  purple: {
    key: 'purple',
    name: '鸢尾',
    navBg: '#7c6ff0',
    navText: '#ffffff',
    bg: '#f3eefe',
    primary: '#8b5cf6',
    dot: '#8b5cf6'
  },
  night: {
    key: 'night',
    name: '星夜',
    navBg: '#1f2624',
    navText: '#e6efeb',
    bg: '#15191a',
    primary: '#6fd3b5',
    dot: '#000000'
  }
};

// 在页面 onShow 调用，按主题设置微信状态栏/导航栏文字色 + 窗口背景
// 说明：自定义导航栏下，状态栏背景由页面底色透出——薄荷/鸢尾底色浅，状态栏图标须用黑色；星夜底色深，用白色。
function applyNav(themeKey) {
  const t = THEMES[themeKey] || THEMES.mint;
  const front = (t.key === 'night') ? '#ffffff' : '#000000';
  wx.setNavigationBarColor({
    frontColor: front,
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
