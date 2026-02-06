// pages/my-stats/index.js
Page({
  data: {
    stats: {
      totalJoined: 0,
      cancelled: 0,
      attendanceRate: 0,
      totalSpent: 0,
      currentWarnings: 0,
      memberSince: ''
    },
    monthlyData: [],
    activityTypes: [],
    recentActivities: []
  },

  onLoad: function () {
    this.loadStats();
  },

  onPullDownRefresh: function () {
    this.loadStats().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // Load all stats
  loadStats: function () {
    // ========== Mock Data ==========
    const USE_MOCK = true;

    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.setData({
            stats: {
              totalJoined: 12,
              cancelled: 1,
              attendanceRate: 92,
              totalSpent: 840,
              currentWarnings: 1,
              memberSince: 'Oct 2025'
            },
            monthlyData: [
              { month: 'Nov', count: 4, percentage: 100 },  // 4/4 = 100%
              { month: 'Dec', count: 3, percentage: 75 },   // 3/4 = 75%
              { month: 'Jan', count: 4, percentage: 100 },  // 4/4 = 100%
              { month: 'Feb', count: 2, percentage: 50 }    // 2/4 = 50% (ongoing month)
            ],
            activityTypes: [
              { icon: '🎾', name: 'Training', count: 7, percentage: 58 },
              { icon: '🏸', name: 'Singles Match', count: 3, percentage: 25 },
              { icon: '👥', name: 'Doubles Match', count: 2, percentage: 17 }
            ],
            recentActivities: [
              {
                _id: '1',
                title: 'Tennis Training',
                date: '2026-02-05',
                status: 'upcoming',
                statusText: 'Upcoming'
              },
              {
                _id: '2',
                title: 'Singles Match',
                date: '2026-01-29',
                status: 'attended',
                statusText: 'Attended'
              },
              {
                _id: '3',
                title: 'Doubles Match',
                date: '2026-01-22',
                status: 'attended',
                statusText: 'Attended'
              },
              {
                _id: '4',
                title: 'Beginner Training',
                date: '2026-01-15',
                status: 'cancelled',
                statusText: 'Cancelled'
              },
              {
                _id: '5',
                title: 'Tennis Training',
                date: '2026-01-08',
                status: 'attended',
                statusText: 'Attended'
              }
            ]
          });
          resolve();
        }, 300);
      });
    }
    // ========== Mock Data End ==========

    // Real API call
    return wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'getDetailedStats'
      }
    }).then(res => {
      if (res.result) {
        this.setData({
          stats: res.result.stats || {},
          monthlyData: res.result.monthlyData || [],
          activityTypes: res.result.activityTypes || [],
          recentActivities: res.result.recentActivities || []
        });
      }
    }).catch(err => {
      console.error('Failed to load stats', err);
      wx.showToast({
        title: 'Failed to load stats',
        icon: 'none'
      });
    });
  }
});

