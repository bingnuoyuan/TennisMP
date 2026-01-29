// pages/profile/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    stats: {
      totalActivities: 0,
      upcomingActivities: 0
    }
  },

  onLoad: function () {
    this.checkUserInfo();
  },

  onShow: function () {
    this.loadStats();
  },

  // 检查用户信息
  checkUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    }
  },

  // 获取用户信息
  getUserProfile: function () {
    const that = this;
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        that.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });

        // 同步到云数据库
        wx.cloud.callFunction({
          name: 'user',
          data: {
            action: 'updateUserInfo',
            userInfo: userInfo
          }
        });
      },
      fail: (err) => {
        console.log('获取用户信息失败', err);
      }
    });
  },

  // 加载统计数据
  loadStats: function () {
    const that = this;
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
      console.error('获取统计数据失败', err);
    });
  },

  // 跳转到我的活动
  goToMyActivities: function () {
    wx.navigateTo({
      url: '/pages/my-activities/index'
    });
  },

  // 联系客服
  contactService: function () {
    // 可以配置客服功能
    wx.showToast({
      title: '请联系群管理员',
      icon: 'none'
    });
  },

  // 关于我们
  showAbout: function () {
    wx.showModal({
      title: 'Just Do Tennis',
      content: 'Nike Employee Tennis Club\n\n让我们一起享受网球的乐趣！🎾',
      showCancel: false,
      confirmText: '知道了'
    });
  }
});

