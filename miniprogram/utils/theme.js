// 主题令牌：三套配色 + 导航栏变色
const THEMES = {
  mint: {
    key: 'mint',
    name: '薄荷绿',
    navBg: '#57b89c',
    navText: '#ffffff',
    bg: '#f3f9f6',
    primary: '#57b89c'
  },
  green: {
    key: 'green',
    name: '森野绿',
    navBg: '#2faa5a',
    navText: '#ffffff',
    bg: '#eef7ee',
    primary: '#2faa5a'
  },
  night: {
    key: 'night',
    name: '夜间版',
    navBg: '#1f2624',
    navText: '#e6efeb',
    bg: '#15191a',
    primary: '#6fd3b5'
  }
};

// 在页面 onShow 调用，按主题设置微信导航栏颜色
function applyNav(themeKey) {
  const t = THEMES[themeKey] || THEMES.mint;
  const front = (t.navText === '#ffffff') ? '#ffffff' : '#000000';
  wx.setNavigationBarColor({
    frontColor: front,
    backgroundColor: t.navBg,
    animation: { duration: 200, timingFunc: 'easeIn' }
  });
}

function list() {
  return Object.keys(THEMES).map(k => THEMES[k]);
}

module.exports = { THEMES, applyNav, list };
