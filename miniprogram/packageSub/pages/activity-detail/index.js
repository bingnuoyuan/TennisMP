// pages/activity-detail/index.js
const app = getApp();

Page({
  data: {
    id: '',
    activity: null,
    loading: true,
    isRegistered: false,
    canRegister: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadActivity(options.id);
    }
  },

  // Load activity details
  loadActivity: function (id) {
    const that = this;
    this.setData({ loading: true });

    // ========== Mock Data ==========
    const USE_MOCK = true;
    
    if (USE_MOCK) {
      const mockActivities = {
        'mock_001': {
          _id: 'mock_001',
          title: 'Tennis Training',
          date: '2026-02-05',
          time: '18:00-20:00',
          location: 'OMC · One More Club',
          price: 70,
          maxPeople: 12,
          currentPeople: 8,
          status: 'open',
          description: 'Weekly tennis training session for all skill levels. Coach will provide guidance on techniques and strategies.'
        },
        'mock_002': {
          _id: 'mock_002',
          title: 'Singles Match',
          date: '2026-02-12',
          time: '18:00-20:00',
          location: 'OMC · One More Club',
          price: 70,
          maxPeople: 8,
          currentPeople: 6,
          status: 'open',
          description: 'Competitive singles matches. Players will be paired based on skill level.'
        },
        'mock_003': {
          _id: 'mock_003',
          title: 'Doubles Match',
          date: '2026-02-19',
          time: '18:00-20:00',
          location: 'OMC · One More Club',
          price: 70,
          maxPeople: 16,
          currentPeople: 16,
          status: 'closed',
          description: 'Fun doubles matches. Find a partner or we will match you with one!'
        },
        'mock_004': {
          _id: 'mock_004',
          title: 'Beginner Training',
          date: '2026-02-26',
          time: '18:00-20:00',
          location: 'OMC · One More Club',
          price: 70,
          maxPeople: 8,
          currentPeople: 3,
          status: 'open',
          description: 'Perfect for beginners! Learn the basics of tennis including grip, stance, and basic strokes.'
        }
      };

      setTimeout(() => {
        const activity = mockActivities[id];
        if (activity) {
          const canRegister = activity.status === 'open' && 
                            (activity.currentPeople || 0) < activity.maxPeople;
          
          that.setData({
            activity: activity,
            loading: false,
            isRegistered: false,
            canRegister: canRegister
          });

          wx.setNavigationBarTitle({
            title: activity.title
          });
        } else {
          wx.showToast({
            title: 'Event not found',
            icon: 'none'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }, 300);
      return;
    }
    // ========== Mock Data End ==========

    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'detail',
        activityId: id
      }
    }).then(res => {
      console.log('Activity details', res.result);
      const activity = res.result.data;
      
      if (activity) {
        const canRegister = activity.status === 'open' && 
                          (activity.currentPeople || 0) < activity.maxPeople;
        
        that.setData({
          activity: activity,
          loading: false,
          isRegistered: res.result.isRegistered || false,
          canRegister: canRegister
        });

        wx.setNavigationBarTitle({
          title: activity.title
        });
      } else {
        wx.showToast({
          title: 'Event not found',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    }).catch(err => {
      console.error('Failed to load activity', err);
      that.setData({ loading: false });
      wx.showToast({
        title: 'Load failed',
        icon: 'none'
      });
    });
  },

  // Go to booking
  goToBooking: function () {
    const { id, activity, isRegistered, canRegister } = this.data;
    
    if (isRegistered) {
      wx.showToast({
        title: 'Already registered',
        icon: 'none'
      });
      return;
    }

    if (!canRegister) {
      wx.showToast({
        title: 'Registration closed',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/packageSub/pages/booking/index?id=${id}&price=${activity.price}&title=${encodeURIComponent(activity.title)}`
    });
  },

  // Share
  onShareAppMessage: function () {
    const { activity } = this.data;
    return {
      title: activity ? activity.title : 'Just Do Tennis',
      path: `/pages/activity-detail/index?id=${this.data.id}`
    };
  }
});


