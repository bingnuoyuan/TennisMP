// pages/my-activities/index.js
Page({
  data: {
    activities: [],
    loading: true,
    isEmpty: false
  },

  onLoad: function () {
    this.loadMyActivities();
  },

  onPullDownRefresh: function () {
    this.loadMyActivities().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载我的活动
  loadMyActivities: function () {
    const that = this;
    this.setData({ loading: true });

    return wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'myList'
      }
    }).then(res => {
      console.log('我的活动', res.result);
      const activities = res.result.data || [];
      that.setData({
        activities: activities,
        loading: false,
        isEmpty: activities.length === 0
      });
    }).catch(err => {
      console.error('获取我的活动失败', err);
      that.setData({
        loading: false,
        isEmpty: true
      });
    });
  },

  // 跳转到活动详情
  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${id}`
    });
  },

  // 获取状态文字
  getStatusText: function (status, activityDate) {
    const now = new Date();
    const date = new Date(activityDate);
    
    if (status === 'cancelled') return '已取消';
    if (status === 'refunded') return '已退款';
    if (date < now) return '已结束';
    return '待参加';
  }
});

