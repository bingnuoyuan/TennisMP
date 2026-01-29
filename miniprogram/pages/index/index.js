// pages/index/index.js
const app = getApp();

Page({
  data: {
    activities: [],
    loading: true,
    isEmpty: false
  },

  onLoad: function () {
    this.loadActivities();
  },

  onShow: function () {
    // 每次显示时刷新数据
    this.loadActivities();
  },

  onPullDownRefresh: function () {
    this.loadActivities().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载活动列表
  loadActivities: function () {
    const that = this;
    this.setData({ loading: true });

    return wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'list'
      }
    }).then(res => {
      console.log('活动列表', res.result);
      const activities = res.result.data || [];
      that.setData({
        activities: activities,
        loading: false,
        isEmpty: activities.length === 0
      });
    }).catch(err => {
      console.error('获取活动列表失败', err);
      that.setData({
        loading: false,
        isEmpty: true
      });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
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

  // 格式化日期
  formatDate: function (dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    return `${month}月${day}日 ${weekDay}`;
  }
});

