// 云函数 - pay
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const action = event.action;

  switch (action) {
    case 'createOrder':
      return await createOrder(event, openid);

    case 'payCallback':
      return await payCallback(event);

    default:
      return { error: 'Unknown action' };
  }
};

// 创建订单并发起支付
async function createOrder(event, openid) {
  const { activityId, name, phone, amount } = event;

  try {
    // 1. 检查活动是否存在且可报名
    const activities = db.collection('activities');
    const activityRes = await activities.doc(activityId).get();
    const activity = activityRes.data;

    if (!activity) {
      return { success: false, message: '活动不存在' };
    }

    if (activity.status !== 'open') {
      return { success: false, message: '活动报名已截止' };
    }

    if (activity.currentPeople >= activity.maxPeople) {
      return { success: false, message: '活动名额已满' };
    }

    // 2. 检查是否已报名
    const registrations = db.collection('registrations');
    const existRes = await registrations
      .where({
        activityId: activityId,
        userId: openid,
        paymentStatus: 'paid'
      })
      .get();

    if (existRes.data.length > 0) {
      return { success: false, message: '您已报名此活动' };
    }

    // 3. 生成订单号
    const orderId = 'T' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();

    // 4. 创建报名记录
    await registrations.add({
      data: {
        orderId: orderId,
        activityId: activityId,
        activityTitle: activity.title,
        activityDate: activity.date,
        activityTime: activity.time,
        activityLocation: activity.location,
        userId: openid,
        userName: name,
        phone: phone,
        amount: amount,
        paymentStatus: 'pending',
        createTime: db.serverDate()
      }
    });

    // 5. 调用微信支付
    const res = await cloud.cloudPay.unifiedOrder({
      body: activity.title,
      outTradeNo: orderId,
      spbillCreateIp: '127.0.0.1',
      subMchId: '', // 填入你的商户号
      totalFee: Math.round(amount * 100), // 单位：分
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'pay', // 支付结果回调云函数
      nonceStr: Math.random().toString(36).substr(2, 15),
      tradeType: 'JSAPI'
    });

    if (res.returnCode === 'SUCCESS' && res.resultCode === 'SUCCESS') {
      return {
        success: true,
        orderId: orderId,
        payment: res.payment
      };
    } else {
      console.error('统一下单失败', res);
      return {
        success: false,
        message: res.returnMsg || res.errCodeDes || '支付发起失败'
      };
    }
  } catch (err) {
    console.error('创建订单失败', err);
    return { success: false, message: '系统错误，请重试', error: err };
  }
}

// 支付回调
async function payCallback(event) {
  const { outTradeNo, resultCode, returnCode } = event;

  if (returnCode === 'SUCCESS' && resultCode === 'SUCCESS') {
    try {
      // 更新订单状态
      const registrations = db.collection('registrations');
      await registrations
        .where({ orderId: outTradeNo })
        .update({
          data: {
            paymentStatus: 'paid',
            payTime: db.serverDate()
          }
        });

      // 更新活动报名人数
      const regRes = await registrations.where({ orderId: outTradeNo }).get();
      if (regRes.data.length > 0) {
        const activityId = regRes.data[0].activityId;
        const activities = db.collection('activities');
        await activities.doc(activityId).update({
          data: {
            currentPeople: db.command.inc(1)
          }
        });
      }

      return { errcode: 0, errmsg: 'SUCCESS' };
    } catch (err) {
      console.error('支付回调处理失败', err);
      return { errcode: -1, errmsg: 'FAIL' };
    }
  }

  return { errcode: 0, errmsg: 'SUCCESS' };
}




