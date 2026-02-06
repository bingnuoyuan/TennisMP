// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（bindbindwx.bindcloud bindcallFunction、binduploadFile 等）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'tennis-mp-cloud',
        traceUser: true,
      });
    }

    this.globalData = {};

    // 获取用户信息
    this.getUserInfo();
  },

  globalData: {
    userInfo: null,
    openid: null
  },

  // 获取用户 openid
  getUserInfo: function() {
    const that = this;
    // 调用云函数获取 openid
    wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'getOpenId'
      }
    }).then(res => {
      console.log('获取 openid 成功', res.result);
      that.globalData.openid = res.result.openid;
    }).catch(err => {
      console.error('获取 openid 失败', err);
    });
  }
});


