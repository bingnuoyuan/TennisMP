// pages/booking/index.js
const app = getApp();

Page({
  data: {
    activityId: '',
    activityTitle: '',
    price: 0,
    email: '',
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

  // Name input
  onNameInput: function (e) {
    this.setData({ name: e.detail.value });
  },

  // Email input
  onEmailInput: function (e) {
    this.setData({ email: e.detail.value });
  },

  // Submit booking
  submitBooking: function () {
    const { activityId, name, email, price, submitting, activityTitle } = this.data;

    if (submitting) return;

    // Validation
    if (!name.trim()) {
      wx.showToast({ title: 'Please enter your name', icon: 'none' });
      return;
    }

    if (!email || !/^[^\s@]+@nike\.com$/i.test(email)) {
      wx.showToast({ title: 'Please use your @nike.com email', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    // ========== Mock ==========
    const USE_MOCK = true;
    
    if (USE_MOCK) {
      // Mock: simulate payment success after delay
      setTimeout(() => {
        wx.showModal({
          title: 'Payment',
          content: `Pay ¥${price} for "${activityTitle}"?`,
          confirmText: 'Pay',
          cancelText: 'Cancel',
          success: (res) => {
            if (res.confirm) {
              wx.showToast({
                title: 'Booking Success!',
                icon: 'success'
              });
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            } else {
              wx.showToast({ title: 'Payment cancelled', icon: 'none' });
            }
            this.setData({ submitting: false });
          }
        });
      }, 500);
      return;
    }
    // ========== Mock End ==========

    // Call cloud function to create order and pay
    wx.cloud.callFunction({
      name: 'pay',
      data: {
        action: 'createOrder',
        activityId: activityId,
        name: name.trim(),
        email: email,
        amount: price
      }
    }).then(res => {
      console.log('Order created', res.result);
      
      if (res.result.success) {
        // Invoke WeChat payment
        const payment = res.result.payment;
        wx.requestPayment({
          ...payment,
          success: (payRes) => {
            console.log('Payment success', payRes);
            wx.showToast({
              title: 'Booking Success!',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          },
          fail: (payErr) => {
            console.log('Payment failed or cancelled', payErr);
            if (payErr.errMsg.includes('cancel')) {
              wx.showToast({ title: 'Payment cancelled', icon: 'none' });
            } else {
              wx.showToast({ title: 'Payment failed', icon: 'none' });
            }
          },
          complete: () => {
            this.setData({ submitting: false });
          }
        });
      } else {
        wx.showToast({
          title: res.result.message || 'Failed to create order',
          icon: 'none'
        });
        this.setData({ submitting: false });
      }
    }).catch(err => {
      console.error('Failed to create order', err);
      wx.showToast({
        title: 'Network error, please retry',
        icon: 'none'
      });
      this.setData({ submitting: false });
    });
  }
});

