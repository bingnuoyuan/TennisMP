// pages/club-funds/index.js

Page({
  data: {
    loading: true,
    hasPermission: false,
    summary: {
      balance: 0,
      totalIncome: 0,
      totalExpense: 0
    },
    records: [],
    expandedWeeks: {} // Track which weeks are expanded
  },

  onLoad: function () {
    this.checkPermissionAndLoad();
  },

  // Check permission and load data
  checkPermissionAndLoad: function () {
    const that = this;
    
    // ========== Mock ==========
    const USE_MOCK = true;
    
    if (USE_MOCK) {
      // Mock: simulate permission check
      // In real app, this would check:
      // 1. If fundsVisibility === 'all' -> show to everyone
      // 2. If fundsVisibility === 'admin' -> check if user is admin
      const mockConfig = {
        fundsVisibility: 'all', // 'all' or 'admin'
        isAdmin: false // current user is admin?
      };
      
      const hasPermission = mockConfig.fundsVisibility === 'all' || mockConfig.isAdmin;
      
      if (!hasPermission) {
        that.setData({
          loading: false,
          hasPermission: false
        });
        return;
      }
      
      // Mock financial data
      const mockData = {
        summary: {
          balance: 320,
          totalIncome: 1200,
          totalExpense: 880
        },
        records: [
          {
            id: 1,
            week: 6,
            date: '2026-02-04',
            dateFormatted: 'Week 6 · February 4',
            income: [
              { id: 101, name: 'Registration (8 people)', amount: 240 }
            ],
            expense: [
              { id: 102, name: 'Court fee', amount: 150 },
              { id: 103, name: 'Tennis balls', amount: 30 }
            ],
            netAmount: 60
          },
          {
            id: 2,
            week: 5,
            date: '2026-01-28',
            dateFormatted: 'Week 5 · January 28',
            income: [
              { id: 201, name: 'Registration (10 people)', amount: 300 }
            ],
            expense: [
              { id: 202, name: 'Court fee', amount: 150 },
              { id: 203, name: 'Water', amount: 20 }
            ],
            netAmount: 130
          },
          {
            id: 3,
            week: 4,
            date: '2026-01-21',
            dateFormatted: 'Week 4 · January 21',
            income: [
              { id: 301, name: 'Registration (6 people)', amount: 180 }
            ],
            expense: [
              { id: 302, name: 'Court fee', amount: 150 }
            ],
            netAmount: 30
          },
          {
            id: 4,
            week: 3,
            date: '2026-01-14',
            dateFormatted: 'Week 3 · January 14',
            income: [
              { id: 401, name: 'Registration (8 people)', amount: 240 }
            ],
            expense: [
              { id: 402, name: 'Court fee', amount: 150 },
              { id: 403, name: 'Grip tape', amount: 40 }
            ],
            netAmount: 50
          },
          {
            id: 5,
            week: 2,
            date: '2026-01-07',
            dateFormatted: 'Week 2 · January 7',
            income: [
              { id: 501, name: 'Registration (8 people)', amount: 240 }
            ],
            expense: [
              { id: 502, name: 'Court fee', amount: 150 },
              { id: 503, name: 'New balls', amount: 40 }
            ],
            netAmount: 50
          }
        ]
      };
      
      // Default expand first week
      const expandedWeeks = {};
      if (mockData.records.length > 0) {
        expandedWeeks[mockData.records[0].id] = true;
      }
      
      setTimeout(() => {
        that.setData({
          loading: false,
          hasPermission: true,
          summary: mockData.summary,
          records: mockData.records,
          expandedWeeks: expandedWeeks
        });
      }, 500);
      return;
    }
    // ========== Mock End ==========

    // Real API call
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'getClubFunds'
      }
    }).then(res => {
      if (res.result) {
        if (!res.result.hasPermission) {
          that.setData({
            loading: false,
            hasPermission: false
          });
          return;
        }
        
        const expandedWeeks = {};
        if (res.result.records && res.result.records.length > 0) {
          expandedWeeks[res.result.records[0].id] = true;
        }
        
        that.setData({
          loading: false,
          hasPermission: true,
          summary: res.result.summary || {},
          records: res.result.records || [],
          expandedWeeks: expandedWeeks
        });
      } else {
        that.setData({ loading: false, hasPermission: false });
      }
    }).catch(err => {
      console.error('Failed to load funds data', err);
      that.setData({ loading: false, hasPermission: false });
      wx.showToast({
        title: 'Failed to load data',
        icon: 'none'
      });
    });
  },

  // Toggle week expansion
  toggleWeek: function (e) {
    const recordId = e.currentTarget.dataset.id;
    const expandedWeeks = this.data.expandedWeeks;
    expandedWeeks[recordId] = !expandedWeeks[recordId];
    this.setData({ expandedWeeks });
  },

  // Pull to refresh
  onPullDownRefresh: function () {
    this.checkPermissionAndLoad();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});

