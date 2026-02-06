// pages/profile/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    stats: {
      totalActivities: 0,
      upcomingActivities: 0
    },
    showQRPopup: false
  },

  onLoad: function () {
    this.checkUserInfo();
  },

  onShow: function () {
    this.loadStats();
  },

  // Check user info
  checkUserInfo: function () {
    // ========== Mock ==========
    const USE_MOCK = true;
    
    if (USE_MOCK) {
      // Mock: simulate logged in user
      const mockUserInfo = {
        nickName: 'Tennis Player',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
      };
      this.setData({
        userInfo: mockUserInfo,
        hasUserInfo: true
      });
      return;
    }
    // ========== Mock End ==========

    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    }
  },

  // Get user profile
  getUserProfile: function () {
    const that = this;
    
    // ========== Mock ==========
    const USE_MOCK = true;
    
    if (USE_MOCK) {
      const mockUserInfo = {
        nickName: 'Tennis Player',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
      };
      that.setData({
        userInfo: mockUserInfo,
        hasUserInfo: true
      });
      wx.showToast({ title: 'Login success (mock)', icon: 'none' });
      return;
    }
    // ========== Mock End ==========

    wx.getUserProfile({
      desc: 'For membership profile',
      success: (res) => {
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        that.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });

        wx.cloud.callFunction({
          name: 'user',
          data: {
            action: 'updateUserInfo',
            userInfo: userInfo
          }
        });
      },
      fail: (err) => {
        console.log('Failed to get user info', err);
      }
    });
  },

  // Load stats
  loadStats: function () {
    const that = this;
    
    // ========== Mock ==========
    const USE_MOCK = true;
    
    if (USE_MOCK) {
      that.setData({
        stats: {
          totalActivities: 5,
          upcomingActivities: 2
        }
      });
      return;
    }
    // ========== Mock End ==========

    wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'getStats'
      }
    }).then(res => {
      if (res.result) {
        that.setData({
          stats: {
            totalActivities: res.result.totalActivities || 0,
            upcomingActivities: res.result.upcomingActivities || 0
          }
        });
      }
    }).catch(err => {
      console.error('Failed to load stats', err);
    });
  },

  // Go to my events
  goToMyActivities: function () {
    wx.navigateTo({
      url: '/pages/my-activities/index'
    });
  },

  // Go to my stats
  goToMyStats: function () {
    wx.navigateTo({
      url: '/pages/my-stats/index'
    });
  },

  // Go to photo gallery
  goToPhotoGallery: function () {
    wx.navigateTo({
      url: '/pages/photo-gallery/index'
    });
  },

  // Go to club funds
  goToClubFunds: function () {
    wx.navigateTo({
      url: '/pages/club-funds/index'
    });
  },

  // Contact support - show QR popup
  contactService: function () {
    this.setData({ showQRPopup: true });
  },

  // Close QR popup
  closeQRPopup: function () {
    this.setData({ showQRPopup: false });
  },

  // Prevent popup close when tapping content
  preventClose: function () {
    // Do nothing, just prevent event bubbling
  },

  // About
  showAbout: function () {
    wx.showModal({
      title: 'Just Do Tennis',
      content: 'Nike Employee Tennis Club\n\nLet\'s enjoy tennis together! 🎾',
      showCancel: false,
      confirmText: 'OK'
    });
  }
});


