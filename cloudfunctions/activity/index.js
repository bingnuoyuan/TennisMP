// 云函数 - activity
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const action = event.action;

  switch (action) {
    case 'list':
      return await getActivityList();

    case 'detail':
      return await getActivityDetail(event.activityId, openid);

    case 'myList':
      return await getMyActivities(openid);

    case 'create':
      return await createActivity(event, openid);

    default:
      return { error: 'Unknown action' };
  }
};

// 获取活动列表
async function getActivityList() {
  try {
    const activities = db.collection('activities');
    const res = await activities
      .orderBy('date', 'asc')
      .where({
        status: _.in(['open', 'closed'])
      })
      .limit(20)
      .get();

    return { data: res.data };
  } catch (err) {
    console.error('获取活动列表失败', err);
    return { data: [], error: err };
  }
}

// 获取活动详情
async function getActivityDetail(activityId, openid) {
  try {
    const activities = db.collection('activities');
    const res = await activities.doc(activityId).get();

    // 检查用户是否已报名
    const registrations = db.collection('registrations');
    const regRes = await registrations
      .where({
        activityId: activityId,
        userId: openid,
        paymentStatus: 'paid'
      })
      .get();

    return {
      data: res.data,
      isRegistered: regRes.data.length > 0
    };
  } catch (err) {
    console.error('获取活动详情失败', err);
    return { data: null, error: err };
  }
}

// 获取我的活动
async function getMyActivities(openid) {
  try {
    const registrations = db.collection('registrations');
    const res = await registrations
      .where({ userId: openid })
      .orderBy('createTime', 'desc')
      .limit(50)
      .get();

    // 格式化时间
    const data = res.data.map(item => {
      const date = new Date(item.createTime);
      return {
        ...item,
        createTimeStr: `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
      };
    });

    return { data: data };
  } catch (err) {
    console.error('获取我的活动失败', err);
    return { data: [], error: err };
  }
}

// 创建活动（管理员功能）
async function createActivity(event, openid) {
  try {
    // 检查是否是管理员
    const users = db.collection('users');
    const userRes = await users.doc(openid).get();
    
    if (!userRes.data || !userRes.data.isAdmin) {
      return { success: false, message: '无权限创建活动' };
    }

    const activities = db.collection('activities');
    const res = await activities.add({
      data: {
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        price: event.price,
        maxPeople: event.maxPeople,
        currentPeople: 0,
        description: event.description || '',
        status: 'open',
        creatorId: openid,
        createTime: db.serverDate()
      }
    });

    return { success: true, activityId: res._id };
  } catch (err) {
    console.error('创建活动失败', err);
    return { success: false, error: err };
  }
}




