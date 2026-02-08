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

    // ========== Mock 数据（开发预览用）==========
    const USE_MOCK = true; // 设为 false 可切换回云函数
    
    if (USE_MOCK) {
      const mockActivities = [
        {
          _id: 'mock_001',
          title: 'Tennis Training',
          date: '2026-02-05',
          time: '18:00-20:00',
          location: 'OMC · One More Club',
          price: 70,
          maxPeople: 12,
          currentPeople: 8,
          status: 'open'
        },
        {
          _id: 'mock_002',
          title: 'Singles Match',
          date: '2026-02-12',
          time: '18:00-20:00',
          location: 'OMC · One More Club',
          price: 70,
          maxPeople: 8,
          currentPeople: 6,
          status: 'open'
        },
        {
          _id: 'mock_003',
          title: 'Doubles Match',
          date: '2026-02-19',
          time: '18:00-20:00',
          location: 'OMC · One More Club',
          price: 70,
          maxPeople: 16,
          currentPeople: 16,
          status: 'closed'
        },
        {
          _id: 'mock_004',
          title: 'Beginner Training',
          date: '2026-02-26',
          time: '18:00-20:00',
          location: 'OMC · One More Club',
          price: 70,
          maxPeople: 8,
          currentPeople: 3,
          status: 'open'
        }
      ];

      // 模拟加载延迟
      return new Promise((resolve) => {
        setTimeout(() => {
          that.setData({
            activities: mockActivities,
            loading: false,
            isEmpty: false
          });
          console.log('使用 Mock 数据', mockActivities);
          resolve();
        }, 500);
      });
    }
    // ========== Mock 数据结束 ==========

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
        title: 'Load failed',
        icon: 'none'
      });
    });
  },

  // 跳转到活动详情
  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packageSub/pages/activity-detail/index?id=${id}`
    });
  },

  // Format date
  formatDate: function (dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    return `${month}/${day} ${weekDay}`;
  }
});




