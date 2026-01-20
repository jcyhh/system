// ============================================================
// 修改说明：使用 uni-subscribemsg 替代手动调用微信API
// ============================================================

// 1. 在文件开头引入 uni-subscribemsg
const uniID = require('uni-id-common');
const UniSubscribemsg = require('uni-subscribemsg'); // ← 新增
const db = uniCloud.database();
const dbCmd = db.command;

// 2. 删除以下代码（不再需要手动管理 access_token）
// - 删除 cachedAccessToken 相关变量
// - 删除 getWxAccessToken 函数
// - 删除 MINIPROGRAM_STATE 常量

// 3. 在需要发送订阅消息的地方，使用以下代码：

// 示例1：发送"排队成功提醒"
async function sendQueueSuccessNotice(userId, plateNumber) {
  try {
    // 获取用户 openid
    const userInfo = await db.collection('uni-id-users').doc(userId).get();
    if (!userInfo.data[0]?.wx_openid?.mp) {
      console.log('用户未绑定微信openid');
      return;
    }
    const openid = userInfo.data[0].wx_openid.mp;
    
    // 获取订阅模板ID
    const userDoc = await db.collection('uni-id-users').doc(userId).get();
    const templateList = userDoc.data[0]?.subscribe_templates || [];
    const templateId = '6dmIz67zTI9aE3PJCTrqK48vFvZOctRJDTnzFx0Wj2M';
    
    if (!templateList.includes(templateId)) {
      console.log('用户未订阅该模板');
      return;
    }
    
    // 初始化 uni-subscribemsg
    const uniSubscribemsg = new UniSubscribemsg({
      dcloudAppid: '__UNI__DD60F0F', // 你的DCloud AppID
      provider: 'weixin-mp' // 注意：微信小程序是 weixin-mp，不是 weixin-h5
    });
    
    // 发送订阅消息
    const res = await uniSubscribemsg.sendSubscribeMessage({
      touser: openid,
      template_id: templateId,
      page: 'pages/tabbar/home',
      miniprogram_state: 'formal', // developer=开发版, trial=体验版, formal=正式版
      lang: 'zh_CN',
      data: {
        car_number4: {
          value: plateNumber
        },
        number9: {
          value: '0'
        },
        thing3: {
          value: '轮到您了，请准备'
        }
      }
    });
    
    console.log('订阅消息发送结果:', res);
    
    if (res.errCode === 0) {
      console.log('✅ 订阅消息发送成功');
    } else {
      console.error('❌ 订阅消息发送失败:', res.errMsg);
    }
    
  } catch (err) {
    console.error('发送订阅消息异常:', err);
  }
}

// 示例2：发送"排队进度通知"
async function sendQueueProgressNotice(userId, plateNumber, queuePosition) {
  try {
    const userInfo = await db.collection('uni-id-users').doc(userId).get();
    const openid = userInfo.data[0]?.wx_openid?.mp;
    if (!openid) return;
    
    const uniSubscribemsg = new UniSubscribemsg({
      dcloudAppid: '__UNI__DD60F0F',
      provider: 'weixin-mp'
    });
    
    const res = await uniSubscribemsg.sendSubscribeMessage({
      touser: openid,
      template_id: '6dmIz67zTI9aE3PJCTrqK48vFvZOctRJDTnzFx0Wj2M',
      page: 'pages/tabbar/home',
      miniprogram_state: 'formal',
      lang: 'zh_CN',
      data: {
        car_number11: {
          value: plateNumber
        },
        number3: {
          value: String(queuePosition)
        }
      }
    });
    
    if (res.errCode === 0) {
      console.log('✅ 排队进度通知发送成功');
    } else {
      console.error('❌ 发送失败:', res.errMsg);
    }
    
  } catch (err) {
    console.error('发送异常:', err);
  }
}

// ============================================================
// 主要改动点总结：
// 1. 引入 uni-subscribemsg
// 2. 移除 getWxAccessToken 函数
// 3. 使用 uniSubscribemsg.sendSubscribeMessage() 替代手动 HTTP 请求
// 4. DCloud AppID 可以在 manifest.json 中的 appid 字段找到
// 5. provider 对于微信小程序是 'weixin-mp'
// ============================================================
