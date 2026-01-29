// pages/booking/index.js
const app = getApp();

Page({
  data: {
    activityId: '',
    activityTitle: '',
    price: 0,
    phone: '',
    name: '',
    submitting: false
  },

  onLoad: function (options) {
    this.setData({
      activityId: options.id || '',
      activityTitle: decodeURIComponent(options.title || ''),
      price: Number(options.price) || 0
    });
  },

  // 输入姓名
  onNameInput: function (e) {
    this.setData({ name: e.detail.value });
  },

  // 输入手机号
  onPhoneInput: function (e) {
    this.setData({ phone: e.detail.value });
  },

  // 获取手机号（通过按钮授权）
  getPhoneNumber: function (e) {
    if (e.detail.code) {
      // 通过 code 获取手机号（需要云函数解密）
      wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'getPhoneNumber',
          code: e.detail.code
        }
      }).then(res => {
        if (res.result && res.result.phoneNumber) {
          this.setData({ phone: res.result.phoneNumber });
        }
      }).catch(err => {
        console.error('获取手机号失败', err);
      });
    }
  },

  // 提交报名
  submitBooking: function () {
    const { activityId, name, phone, price, submitting } = this.data;

    if (submitting) return;

    // 验证
    if (!name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }

    if (!phone || !/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    // 调用云函数创建订单并支付
    wx.cloud.callFunction({
      name: 'pay',
      data: {
        action: 'createOrder',
        activityId: activityId,
        name: name.trim(),
        phone: phone,
        amount: price
      }
    }).then(res => {
      console.log('创建订单成功', res.result);
      
      if (res.result.success) {
        // 调起微信支付
        const payment = res.result.payment;
        wx.requestPayment({
          ...payment,
          success: (payRes) => {
            console.log('支付成功', payRes);
            wx.showToast({
              title: '报名成功！',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          },
          fail: (payErr) => {
            console.log('支付取消或失败', payErr);
            if (payErr.errMsg.includes('cancel')) {
              wx.showToast({ title: '支付已取消', icon: 'none' });
            } else {
              wx.showToast({ title: '支付失败', icon: 'none' });
            }
          },
          complete: () => {
            this.setData({ submitting: false });
          }
        });
      } else {
        wx.showToast({
          title: res.result.message || '创建订单失败',
          icon: 'none'
        });
        this.setData({ submitting: false });
      }
    }).catch(err => {
      console.error('创建订单失败', err);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
      this.setData({ submitting: false });
    });
  }
});

