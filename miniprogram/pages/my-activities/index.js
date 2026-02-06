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

  // Load my activities
  loadMyActivities: function () {
    const that = this;
    this.setData({ loading: true });

    // ========== Mock Data ==========
    const USE_MOCK = true;
    
    if (USE_MOCK) {
      const mockActivities = [
        {
          _id: 'reg_001',
          activityId: 'mock_001',
          activityTitle: 'Tennis Training',
          activityDate: '2026-02-05',
          activityTime: '18:00-20:00',
          activityLocation: 'OMC · One More Club',
          amount: 70,
          status: 'paid',
          createTimeStr: '1/28 14:30'
        },
        {
          _id: 'reg_002',
          activityId: 'mock_002',
          activityTitle: 'Singles Match',
          activityDate: '2026-02-12',
          activityTime: '18:00-20:00',
          activityLocation: 'OMC · One More Club',
          amount: 70,
          status: 'paid',
          createTimeStr: '1/30 10:15'
        },
        {
          _id: 'reg_003',
          activityId: 'mock_003',
          activityTitle: 'Doubles Match',
          activityDate: '2026-01-15',
          activityTime: '18:00-20:00',
          activityLocation: 'OMC · One More Club',
          amount: 70,
          status: 'paid',
          createTimeStr: '1/10 09:00'
        }
      ];

      return new Promise((resolve) => {
        setTimeout(() => {
          that.setData({
            activities: mockActivities,
            loading: false,
            isEmpty: false
          });
          resolve();
        }, 300);
      });
    }
    // ========== Mock Data End ==========

    return wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'myList'
      }
    }).then(res => {
      console.log('My activities', res.result);
      const activities = res.result.data || [];
      that.setData({
        activities: activities,
        loading: false,
        isEmpty: activities.length === 0
      });
    }).catch(err => {
      console.error('Failed to load activities', err);
      that.setData({
        loading: false,
        isEmpty: true
      });
    });
  },

  // Go to activity detail
  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${id}`
    });
  },

  // Get status text
  getStatusText: function (status, activityDate) {
    const now = new Date();
    const date = new Date(activityDate);
    
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'refunded') return 'Refunded';
    if (date < now) return 'Completed';
    return 'Upcoming';
  }
});


