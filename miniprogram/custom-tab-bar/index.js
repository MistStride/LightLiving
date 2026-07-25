Component({
  data: {
    selected: 0,
    theme: 'mint',
    list: [
      { page: '/pages/index/index', text: '陪伴册', icon: '🪶' },
      { page: '/pages/settings/settings', text: '我的', icon: '👤' }
    ]
  },
  methods: {
    onTap(e) {
      const i = e.currentTarget.dataset.i;
      const url = this.data.list[i].page;
      wx.switchTab({ url });
    }
  }
});
