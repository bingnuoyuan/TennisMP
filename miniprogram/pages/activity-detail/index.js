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

  // 加载活动详情
  loadActivity: function (id) {
    const that = this;
    this.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'detail',
        activityId: id
      }
    }).then(res => {
      console.log('活动详情', res.result);
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
          title: '活动不存在',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    }).catch(err => {
      console.error('获取活动详情失败', err);
      that.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
  },

  // 去报名
  goToBooking: function () {
    const { id, activity, isRegistered, canRegister } = this.data;
    
    if (isRegistered) {
      wx.showToast({
        title: '您已报名此活动',
        icon: 'none'
      });
      return;
    }

    if (!canRegister) {
      wx.showToast({
        title: '报名已截止',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/booking/index?id=${id}&price=${activity.price}&title=${encodeURIComponent(activity.title)}`
    });
  },

  // 分享
  onShareAppMessage: function () {
    const { activity } = this.data;
    return {
      title: activity ? activity.title : 'Just Do Tennis',
      path: `/pages/activity-detail/index?id=${this.data.id}`
    };
  }
});

