// 云函数 - user
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const action = event.action;

  switch (action) {
    case 'getOpenId':
      return { openid: openid };

    case 'updateUserInfo':
      return await updateUserInfo(openid, event.userInfo);

    case 'getStats':
      return await getStats(openid);

    case 'getPhoneNumber':
      return await getPhoneNumber(event.code);

    default:
      return { error: 'Unknown action' };
  }
};

// 更新用户信息
async function updateUserInfo(openid, userInfo) {
  try {
    const users = db.collection('users');
    const res = await users.where({ _id: openid }).get();

    if (res.data.length > 0) {
      // 更新
      await users.doc(openid).update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          updateTime: db.serverDate()
        }
      });
    } else {
      // 新增
      await users.add({
        data: {
          _id: openid,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          isAdmin: false,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });
    }

    return { success: true };
  } catch (err) {
    console.error('更新用户信息失败', err);
    return { success: false, error: err };
  }
}

// 获取用户统计数据
async function getStats(openid) {
  try {
    const registrations = db.collection('registrations');
    
    // 总参与活动数
    const totalRes = await registrations
      .where({ userId: openid, paymentStatus: 'paid' })
      .count();

    // 待参加活动数（活动日期大于今天）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingRes = await registrations
      .where({
        userId: openid,
        paymentStatus: 'paid'
      })
      .get();

    // 过滤出待参加的活动
    let upcomingCount = 0;
    for (const reg of upcomingRes.data) {
      if (reg.activityDate) {
        const actDate = new Date(reg.activityDate);
        if (actDate >= today) {
          upcomingCount++;
        }
      }
    }

    return {
      totalActivities: totalRes.total,
      upcomingActivities: upcomingCount
    };
  } catch (err) {
    console.error('获取统计数据失败', err);
    return { totalActivities: 0, upcomingActivities: 0 };
  }
}

// 获取手机号（需要解密）
async function getPhoneNumber(code) {
  try {
    const res = await cloud.openapi.phonenumber.getPhoneNumber({
      code: code
    });
    return {
      phoneNumber: res.phoneInfo.phoneNumber
    };
  } catch (err) {
    console.error('获取手机号失败', err);
    return { error: err };
  }
}

