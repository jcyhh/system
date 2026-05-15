const uniID = require('uni-id-common');
const db = uniCloud.database();
const dbCmd = db.command;

// 微信小程序配置
const WECHAT_APPID = 'wx93f72f4bacc468f4';
const WECHAT_APPSECRET = '6e54ef01b2ca76c2b37fe360774ce7ae';

// 微信小程序环境配置
// developer: 开发版 | trial: 体验版 | formal: 正式版
const MINIPROGRAM_STATE = 'formal';

// 缓存 access_token
let cachedAccessToken = null;
let tokenExpireTime = 0;

// 获取微信 access_token（带缓存）
async function getWxAccessToken() {
  const now = Date.now();
  
  // 如果缓存有效，直接返回
  if (cachedAccessToken && now < tokenExpireTime) {
    console.log('✅ 使用缓存的 access_token');
    return cachedAccessToken;
  }
  
  console.log('🔄 重新获取 access_token');
  
  try {
    console.log('⏳ 请求微信API...');
    const tokenRes = await uniCloud.httpclient.request(
      'https://api.weixin.qq.com/cgi-bin/token',
      {
        method: 'GET',
        data: {
          grant_type: 'client_credential',
          appid: WECHAT_APPID,
          secret: WECHAT_APPSECRET
        },
        dataType: 'json',
        timeout: 10000
      }
    );
    
    console.log('📥 收到微信API响应');
    console.log('响应数据:', JSON.stringify(tokenRes.data, null, 2));
    
    if (tokenRes.status === 200 && tokenRes.data.access_token) {
      cachedAccessToken = tokenRes.data.access_token;
      // 提前5分钟过期，确保不会用到过期的token
      tokenExpireTime = now + (tokenRes.data.expires_in - 300) * 1000;
      console.log('✅ access_token 获取成功，有效期:', tokenRes.data.expires_in, '秒');
      return cachedAccessToken;
    } else {
      console.error('❌ 获取 access_token 失败:', tokenRes.data);
      return null;
    }
  } catch (err) {
    console.error('❌ 请求 access_token 异常:', err.message);
    return null;
  }
}

// 统一的发送订阅消息函数
async function sendSubscribeMsg(params) {
  const { openid, templateId, data, pagePath = 'pages/tabbar/home' } = params;
  
  console.log('========== 开始发送订阅消息 ==========');
  console.log('OpenID（前10位）:', openid.substring(0, 10) + '...');
  console.log('模板ID:', templateId);
  console.log('消息数据:', JSON.stringify(data, null, 2));
  
  try {
    console.log('⏳ 正在获取 access_token...');
    const accessToken = await getWxAccessToken();
    if (!accessToken) {
      console.error('❌ 获取 access_token 失败，终止发送');
      return { errCode: -1, errMsg: '获取access_token失败' };
    }
    console.log('✅ access_token 获取成功');
    
    const sendData = {
      touser: openid,
      template_id: templateId,
      page: pagePath,
      miniprogram_state: MINIPROGRAM_STATE,
      lang: 'zh_CN',
      data: data
    };
    
    console.log('🚀 发送订阅消息请求...');
    console.log('完整请求数据:', JSON.stringify(sendData, null, 2));
    
    const sendRes = await uniCloud.httpclient.request(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
      {
        method: 'POST',
        data: sendData,
        dataType: 'json',
        contentType: 'json',
        timeout: 10000
      }
    );
    
    console.log('📥 收到微信响应');
    console.log('状态码:', sendRes.status);
    console.log('响应数据:', JSON.stringify(sendRes.data, null, 2));
    
    if (sendRes.status === 200 && sendRes.data.errcode === 0) {
      console.log('✅ 订阅消息发送成功！');
      console.log('========== 发送流程结束 ==========');
      return { errCode: 0, errMsg: '发送成功' };
    } else {
      console.error('❌ 订阅消息发送失败');
      console.error('错误码:', sendRes.data.errcode);
      console.error('错误信息:', sendRes.data.errmsg);
      console.log('========== 发送流程结束（失败）==========');
      return { errCode: sendRes.data.errcode, errMsg: sendRes.data.errmsg };
    }
  } catch (err) {
    console.error('❌ 发送订阅消息异常:', err.message);
    console.error('错误堆栈:', err.stack);
    console.log('========== 发送流程结束（异常）==========');
    return { errCode: -1, errMsg: err.message };
  }
}

module.exports = {
  _before: async function () {
    // 云对象前置方法 - 验证登录状态
    
    // 不需要登录的方法列表
    const publicMethods = ['getCurrentTask', 'getQueueList'];
    const methodName = this.getMethodName();
    
    // 如果是公开方法，不需要验证登录
    if (publicMethods.includes(methodName)) {
      // 尝试获取用户ID，但不强制要求登录
      try {
        const uniIdIns = uniID.createInstance({
          clientInfo: this.getClientInfo()
        });
        const payload = await uniIdIns.checkToken(this.getUniIdToken());
        if (payload.errCode === 0) {
          this.currentUserId = payload.uid;
        } else {
          this.currentUserId = null;
        }
      } catch (e) {
        this.currentUserId = null;
      }
      return;
    }
    
    // 其他方法需要验证登录
    const uniIdIns = uniID.createInstance({
      clientInfo: this.getClientInfo()
    });
    
    const payload = await uniIdIns.checkToken(this.getUniIdToken());
    
    if (payload.errCode !== 0) {
      throw new Error('请先登录');
    }
    
    // 保存当前用户ID供后续方法使用
    this.currentUserId = payload.uid;
  },

  /**
   * 司机登记排队
   * @param {Object} params
   * @param {String} params.driver_name 司机姓名
   * @param {String} params.phone 手机号
   * @param {String} params.plate_number 车牌号
   * @param {String} params.truck_type 车型
   * @param {Number} params.operation_type 操作类型：0-装车，1-卸车
   * @param {String} params.loading_province 装货省市区（卸车时必填）
   * @param {String} params.loading_address 装货详细地址（卸车时必填）
   * @param {String} params.photo 水印相机照片URL
   */
  async register(params) {
    const {
      driver_name,
      phone,
      plate_number,
      truck_type,
      operation_type,
      loading_province,
      loading_address,
      photo,
      subscribedTmpls = [] // 用户订阅的模板ID列表
    } = params;

    // 基础参数验证
    if (!driver_name || !phone || !plate_number || !truck_type || operation_type === undefined || !photo) {
      return {
        errCode: 400,
        errMsg: '参数不完整'
      };
    }

    // 如果是卸车，必须填写装货地址
    if (operation_type === 1) {
      if (!loading_province || !loading_address) {
        return {
          errCode: 400,
          errMsg: '卸车时必须填写装货省市区和详细地址'
        };
      }
    }

    try {
      const now = Date.now();
      
      // 🧪 测试：提前预热微信API连接，获取access_token
      console.log('🔥 提前获取 access_token（预热连接）...');
      const preAccessToken = await getWxAccessToken();
      if (preAccessToken) {
        console.log('✅ access_token 预热成功！');
      } else {
        console.error('❌ access_token 预热失败！');
      }
      
      // 检查用户是否已有排队中或处理中的单子
      const existingTask = await db.collection('trucks')
        .where({
          user_id: this.currentUserId,
          status: dbCmd.in([0, 1])  // 0-排队中，1-处理中
        })
        .get();
      
      if (existingTask.data.length > 0) {
        const task = existingTask.data[0];
        const statusText = task.status === 1 ? '处理中' : '排队中';
        return {
          errCode: 400,
          errMsg: `您已有${statusText}的单子，请勿重复提交`,
          data: {
            existingTask: task
          }
        };
      }
      
      // 获取当前最大队列号
      const maxQueueResult = await db.collection('trucks')
        .orderBy('queue_number', 'desc')
        .limit(1)
        .get();
      
      const maxQueueNumber = maxQueueResult.data.length > 0 ? maxQueueResult.data[0].queue_number : 0;
      const newQueueNumber = maxQueueNumber + 1;
      
      // 查询是否已有处理中的单子
      const processingResult = await db.collection('trucks')
        .where({
          status: 1  // 处理中
        })
        .count();
      
      // 判断状态：如果没有处理中的单子，则新单子为"处理中"，否则为"排队中"
      const status = processingResult.total === 0 ? 1 : 0;
      
      // 插入登记记录
      const insertData = {
        user_id: this.currentUserId,
        driver_name,
        phone,
        plate_number,
        truck_type,
        operation_type,
        photo,
        arrival_time: now,
        status,
        queue_number: newQueueNumber,
        subscribed_tmpls: subscribedTmpls, // 保存用户订阅的模板ID
        create_time: now,
        update_time: now
      };

      // 如果是卸车，添加装货地址信息
      if (operation_type === 1) {
        insertData.loading_province = loading_province;
        insertData.loading_address = loading_address;
      }

      const insertResult = await db.collection('trucks').add(insertData);
      
      // 发送订阅消息（根据排队位置发送不同通知）
      try {
        console.log('📢 准备发送登记通知...');
        console.log('用户ID:', this.currentUserId);
        console.log('任务ID:', insertResult.id);
        console.log('当前状态:', status === 1 ? '处理中' : '排队中');
        
        const userInfo = await db.collection('uni-id-users').doc(this.currentUserId).get();
        if (!userInfo.data[0]?.wx_openid?.mp) {
          console.log('⚠️ 用户未绑定OpenID，跳过发送');
          return;
        }
        
        const openid = userInfo.data[0].wx_openid.mp;
        const taskInfo = await db.collection('trucks').doc(insertResult.id).get();
        const subscribedTmpls = taskInfo.data[0]?.subscribed_tmpls || [];
        
        // 根据状态发送不同的通知
        if (status === 1) {
          // 情况1：直接处理中 → 发送"排队到号通知"
          const templateId = '6dmIz67zTI9aE3PJCTrqK48vFvZOctRJDTnzFx0Wj2M';
          console.log('💡 没人排队，直接处理中，发送排队到号通知');
          
          if (subscribedTmpls.includes(templateId)) {
            const res = await sendSubscribeMsg({
              openid,
              templateId,
              data: {
                car_number22: { value: plate_number },
                phrase3: { value: '请就位' }
              }
            });
            
            if (res.errCode === 0) {
              console.log('✅ 排队到号通知发送成功');
            } else {
              console.error('❌ 排队到号通知发送失败:', res.errMsg);
            }
          }
        } else {
          // status = 0，需要排队，计算排队位置
          const allWaitingTasks = await db.collection('trucks')
            .where({ status: 0 })
            .orderBy('queue_number', 'asc')
            .get();
          
          // 找到当前任务在排队列表中的位置
          const currentIndex = allWaitingTasks.data.findIndex(t => t._id === insertResult.id);
          const queuePosition = currentIndex + 1; // 排队位置（1-based）
          
          console.log('💡 需要排队，当前排队位置:', queuePosition);
          
          if (queuePosition <= 3) {
            // 情况2：排队位置在前3名 → 发送"排队进度通知"
            const templateId = 'dKt-GXFHtyyoN_6Ag-ulck-eafezp1bQ6Sz95QCu6nM';
            console.log('💡 排队位置在前3名，发送排队进度通知');
            
            if (subscribedTmpls.includes(templateId)) {
              const res = await sendSubscribeMsg({
                openid,
                templateId,
                data: {
                  car_number11: { value: plate_number },
                  number3: { value: String(queuePosition) }
                }
              });
              
              if (res.errCode === 0) {
                console.log('✅ 排队进度通知发送成功');
              } else {
                console.error('❌ 排队进度通知发送失败:', res.errMsg);
              }
            }
          } else {
            // 情况3：排队位置超过3名 → 发送"排队成功提醒"
            const templateId = '7WbkjjD-w6tc28gX2Gn8-dWCQreta-M-Y5LltkXm3sk';
            console.log('💡 排队位置超过3名，发送排队成功提醒');
            
            if (subscribedTmpls.includes(templateId)) {
              const res = await sendSubscribeMsg({
                openid,
                templateId,
                data: {
                  car_number4: { value: plate_number },
                  number9: { value: String(queuePosition - 1) },  // 前面人数
                  thing3: { value: '排队成功请耐心等待' }
                }
              });
              
              if (res.errCode === 0) {
                console.log('✅ 排队成功提醒发送成功');
              } else {
                console.error('❌ 排队成功提醒发送失败:', res.errMsg);
              }
            }
          }
        }
      } catch (err) {
        console.error('❌ 发送通知异常：', err.message);
        console.error('错误堆栈:', err.stack);
      }

      return {
        errCode: 0,
        errMsg: '登记成功',
        data: {
          id: insertResult.id,
          queue_number: newQueueNumber,
          status,
          statusText: status === 1 ? '处理中' : '排队中'
        }
      };
    } catch (e) {
      console.error('登记失败：', e);
      return {
        errCode: 500,
        errMsg: '登记失败：' + e.message
      };
    }
  },

  /**
   * 更新排队信息
   * @param {Object} params
   * @param {String} params.id 记录ID
   * @param {String} params.driver_name 司机姓名
   * @param {String} params.phone 手机号
   * @param {String} params.plate_number 车牌号
   * @param {String} params.truck_type 车型
   * @param {Number} params.operation_type 操作类型：0-装车，1-卸车
   * @param {String} params.loading_province 装货省市区（卸车时必填）
   * @param {String} params.loading_address 装货详细地址（卸车时必填）
   * @param {String} params.photo 水印相机照片URL
   */
  async updateTask(params) {
    const {
      id,
      driver_name,
      phone,
      plate_number,
      truck_type,
      operation_type,
      loading_province,
      loading_address,
      photo
    } = params;

    if (!id) {
      return {
        errCode: 400,
        errMsg: '缺少记录ID'
      };
    }

    // 基础参数验证
    if (!driver_name || !phone || !plate_number || !truck_type || operation_type === undefined || !photo) {
      return {
        errCode: 400,
        errMsg: '参数不完整'
      };
    }

    // 如果是卸车，必须填写装货地址
    if (operation_type === 1) {
      if (!loading_province || !loading_address) {
        return {
          errCode: 400,
          errMsg: '卸车时必须填写装货省市区和详细地址'
        };
      }
    }

    try {
      // 获取当前记录
      const currentRecord = await db.collection('trucks').doc(id).get();
      
      if (currentRecord.data.length === 0) {
        return {
          errCode: 404,
          errMsg: '记录不存在'
        };
      }

      const record = currentRecord.data[0];
      
      // 验证是否是当前用户的记录
      if (record.user_id !== this.currentUserId) {
        return {
          errCode: 403,
          errMsg: '无权操作此记录'
        };
      }

      // 验证记录状态（只能修改排队中或处理中的记录）
      if (record.status === 2 || record.status === 3) {
        return {
          errCode: 400,
          errMsg: record.status === 2 ? '已完成的记录不能修改' : '已取消的记录不能修改'
        };
      }

      const now = Date.now();

      // 检查状态逻辑：如果当前是"排队中"，但没有其他"处理中"的单子，则改为"处理中"
      let newStatus = record.status;
      if (record.status === 0) {
        // 当前是排队中，检查是否有其他处理中的单子
        const processingResult = await db.collection('trucks')
          .where({
            status: 1,
            _id: dbCmd.neq(id)  // 排除当前记录
          })
          .count();
        
        // 如果没有其他处理中的单子，则将当前单子改为处理中
        if (processingResult.total === 0) {
          newStatus = 1;
        }
      }

      // 更新数据
      const updateData = {
        driver_name,
        phone,
        plate_number,
        truck_type,
        operation_type,
        photo,
        status: newStatus,
        update_time: now
      };

      // 如果是卸车，添加装货地址信息
      if (operation_type === 1) {
        updateData.loading_province = loading_province;
        updateData.loading_address = loading_address;
      } else {
        // 如果改成装车，清空装货地址
        updateData.loading_province = '';
        updateData.loading_address = '';
      }

      await db.collection('trucks').doc(id).update(updateData);

      return {
        errCode: 0,
        errMsg: '修改成功',
        data: {
          id
        }
      };
    } catch (e) {
      console.error('修改失败：', e);
      return {
        errCode: 500,
        errMsg: '修改失败：' + e.message
      };
    }
  },

  /**
   * 完成装/卸车
   * @param {Object} params
   * @param {String} params.id 记录ID
   * @param {String} params.complete_photo 完成照片URL
   */
  async complete(params) {
    const { id, complete_photo } = params;

    if (!id || !complete_photo) {
      return {
        errCode: 400,
        errMsg: '参数不完整'
      };
    }

    try {
      const now = Date.now();
      
      // 🔥 预热微信API连接，获取access_token
      console.log('🔥 complete方法：提前获取 access_token...');
      const preAccessToken = await getWxAccessToken();
      if (preAccessToken) {
        console.log('✅ access_token 预热成功！');
      } else {
        console.error('❌ access_token 预热失败（不影响主流程）');
      }
      
      // 获取当前记录
      const currentRecord = await db.collection('trucks').doc(id).get();
      
      if (currentRecord.data.length === 0) {
        return {
          errCode: 404,
          errMsg: '记录不存在'
        };
      }

      const record = currentRecord.data[0];
      
      // 验证是否是当前用户的记录
      if (record.user_id !== this.currentUserId) {
        return {
          errCode: 403,
          errMsg: '无权操作此记录'
        };
      }

      // 检查任务状态，只有处理中的单子才能提交完成
      if (record.status !== 1) {
        return {
          errCode: 400,
          errMsg: '只能完成处理中的任务'
        };
      }

      // 更新当前记录为已完成
      await db.collection('trucks').doc(id).update({
        complete_time: now,
        complete_photo,
        status: 2,  // 已完成
        update_time: now
      });

      // 查找下一个排队中的记录（按队列号排序，最小的优先）
      const nextRecord = await db.collection('trucks')
        .where({
          status: 0  // 排队中
        })
        .orderBy('queue_number', 'asc')
        .limit(1)
        .get();

      // 如果有下一个排队中的记录，将其状态改为"处理中"
      if (nextRecord.data.length > 0) {
        const nextTask = nextRecord.data[0];
        await db.collection('trucks').doc(nextTask._id).update({
          status: 1,  // 处理中
          update_time: now
        });
        
        // 发送"排队到号通知"给下一个用户（同步等待）
        try {
          const userInfo = await db.collection('uni-id-users').doc(nextTask.user_id).get();
          if (userInfo.data[0]?.wx_openid?.mp) {
            const openid = userInfo.data[0].wx_openid.mp;
            
            const taskInfo = await db.collection('trucks').doc(nextTask._id).get();
            const subscribedTmpls = taskInfo.data[0]?.subscribed_tmpls || [];
            const templateId = '6dmIz67zTI9aE3PJCTrqK48vFvZOctRJDTnzFx0Wj2M';  // 排队到号通知
            
            if (subscribedTmpls.includes(templateId)) {
              const res = await sendSubscribeMsg({
                openid,
                templateId,
                data: {
                  car_number22: { value: nextTask.plate_number },
                  phrase3: { value: '请就位' }
                }
              });
              
              if (res.errCode === 0) {
                console.log('✅ 排队到号通知发送成功');
              } else {
                console.error('❌ 排队到号通知发送失败:', res.errMsg);
              }
            }
          }
        } catch (err) {
          console.error('发送排队到号通知失败：', err);
        }
      }
      
      // 查询所有排队中的单子，通知前面≤3人的用户
      const allWaitingTasks = await db.collection('trucks')
        .where({
          status: 0  // 排队中
        })
        .orderBy('queue_number', 'asc')
        .get();
      
      // 遍历排队中的单子，计算每个单子前面的数量，发送"排队进度通知"
      for (let i = 0; i < allWaitingTasks.data.length; i++) {
        const waitingTask = allWaitingTasks.data[i];
        const queuePosition = i + 1; // 前面的数量（不包括处理中的）
        
        // 如果前面≤3人，发送"排队进度通知"（同步等待）
        if (queuePosition <= 3) {
          try {
            const userInfo = await db.collection('uni-id-users').doc(waitingTask.user_id).get();
            if (userInfo.data[0]?.wx_openid?.mp) {
              const openid = userInfo.data[0].wx_openid.mp;
              
              const taskInfo = await db.collection('trucks').doc(waitingTask._id).get();
              const subscribedTmpls = taskInfo.data[0]?.subscribed_tmpls || [];
              const templateId = 'dKt-GXFHtyyoN_6Ag-ulck-eafezp1bQ6Sz95QCu6nM';
              
              if (subscribedTmpls.includes(templateId)) {
                const res = await sendSubscribeMsg({
                  openid,
                  templateId,
                  data: {
                    car_number11: { value: waitingTask.plate_number },
                    number3: { value: String(queuePosition) }
                  }
                });
                
                if (res.errCode === 0) {
                  console.log('✅ 排队进度通知发送成功');
                } else {
                  console.error('❌ 排队进度通知发送失败:', res.errMsg);
                }
              }
            }
          } catch (err) {
            console.error('发送排队进度通知失败：', err);
          }
        }
      }

      return {
        errCode: 0,
        errMsg: '操作成功'
      };
    } catch (e) {
      console.error('完成卸货失败：', e);
      return {
        errCode: 500,
        errMsg: '操作失败：' + e.message
      };
    }
  },

  /**
   * 获取首页排队列表（处理中和排队中的单子）
   * @param {Object} params
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页数量
   */
  async getQueueList(params) {
    const { page = 1, pageSize = 20 } = params || {};

    try {
      // 先获取处理中的单子
      const processingResult = await db.collection('trucks')
        .where({
          status: 1  // 处理中
        })
        .orderBy('create_time', 'asc')
        .get();

      // 再获取排队中的单子（按创建时间排序）
      const waitingResult = await db.collection('trucks')
        .where({
          status: 0  // 排队中
        })
        .orderBy('create_time', 'asc')
        .get();

      // 合并列表：处理中的在前，排队中的在后
      const allList = [...processingResult.data, ...waitingResult.data];

      // 分页处理
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const list = allList.slice(start, end);

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          list,
          total: allList.length,
          page,
          pageSize
        }
      };
    } catch (e) {
      console.error('获取列表失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 获取列表（管理员用）
   * @param {Object} params
   * @param {Number} params.status 状态：0-排队中，1-处理中，2-已完成
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页数量
   */
  async getList(params) {
    const { status, page = 1, pageSize = 20 } = params;

    try {
      const where = {};
      if (status !== undefined) {
        where.status = status;
      }

      const result = await db.collection('trucks')
        .where(where)
        .orderBy('create_time', 'asc')  // 改为升序，时间小的（早创建的）排在前面
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get();

      const total = await db.collection('trucks')
        .where(where)
        .count();

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          list: result.data,
          total: total.total,
          page,
          pageSize
        }
      };
    } catch (e) {
      console.error('获取列表失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 获取详情
   * @param {Object} params
   * @param {String} params.id 记录ID
   */
  async getDetail(params) {
    const { id } = params;

    if (!id) {
      return {
        errCode: 400,
        errMsg: '缺少ID参数'
      };
    }

    try {
      const result = await db.collection('trucks').doc(id).get();

      if (result.data.length === 0) {
        return {
          errCode: 404,
          errMsg: '记录不存在'
        };
      }

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: result.data[0]
      };
    } catch (e) {
      console.error('获取详情失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 获取当前用户的当前任务（未完成的记录）
   */
  async getCurrentTask() {
    try {
      // 未登录时直接返回空数据
      if (!this.currentUserId) {
        return {
          errCode: 0,
          errMsg: '未登录',
          data: null
        };
      }
      
      const result = await db.collection('trucks')
        .where({
          user_id: this.currentUserId,
          status: dbCmd.in([0, 1])  // 排队中或处理中
        })
        .orderBy('create_time', 'desc')
        .limit(1)
        .get();

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: result.data.length > 0 ? result.data[0] : null
      };
    } catch (e) {
      console.error('获取当前任务失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 获取我的历史记录
   * @param {Object} params
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页数量
   */
  async getMyRecords(params) {
    const { page = 1, pageSize = 20 } = params || {};

    try {
      const result = await db.collection('trucks')
        .where({
          user_id: this.currentUserId
        })
        .orderBy('create_time', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get();

      const total = await db.collection('trucks')
        .where({
          user_id: this.currentUserId
        })
        .count();

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          list: result.data,
          total: total.total,
          page,
          pageSize
        }
      };
    } catch (e) {
      console.error('获取记录失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 获取队列统计
   */
  async getQueueStats() {
    try {
      const waiting = await db.collection('trucks')
        .where({ status: 0 })
        .count();

      const processing = await db.collection('trucks')
        .where({ status: 1 })
        .count();

      const completed = await db.collection('trucks')
        .where({ status: 2 })
        .count();

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          waiting: waiting.total,
          processing: processing.total,
          completed: completed.total
        }
      };
    } catch (e) {
      console.error('获取统计失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 导出Excel
   * @param {Object} params
   * @param {Number} params.start_time 开始时间（时间戳，开始日期08:00）
   * @param {Number} params.end_time 结束时间（时间戳，结束日期08:00）
   */
  async exportExcel(params) {
    const { start_time, end_time } = params;

    if (!start_time || !end_time) {
      return {
        errCode: 400,
        errMsg: '缺少时间参数'
      };
    }

    try {
      // 查询时间区间内已完成的单子
      const result = await db.collection('trucks')
        .where({
          status: 2,  // 已完成
          complete_time: dbCmd.and([
            dbCmd.gte(start_time),
            dbCmd.lt(end_time)  // 注意：结束时间不包含当天08:00
          ])
        })
        .orderBy('complete_time', 'asc')
        .get();

      if (result.data.length === 0) {
        return {
          errCode: 404,
          errMsg: '该时间段内没有已完成的单子'
        };
      }

      // 构建Excel数据
      const excelData = [];
      
      // 表头
      excelData.push([
        '序号',
        '司机姓名',
        '手机号',
        '车牌号',
        '车型',
        '装卸车',
        '装货省市区',
        '装货详细地址',
        '到达时间',
        '完成时间'
      ]);

      // 格式化时间的辅助函数
      const formatDateTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      };

      // 数据行
      result.data.forEach((item, index) => {
        excelData.push([
          index + 1,
          item.driver_name,
          item.phone,
          item.plate_number,
          item.truck_type,
          item.operation_type === 0 ? '装车' : '卸车',
          item.loading_province || '',
          item.loading_address || '',
          formatDateTime(item.create_time),
          formatDateTime(item.complete_time)
        ]);
      });

      // 生成Excel文件（使用云存储）
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      // 设置列宽
      worksheet['!cols'] = [
        { wch: 6 },   // 序号
        { wch: 12 },  // 司机姓名
        { wch: 15 },  // 手机号
        { wch: 12 },  // 车牌号
        { wch: 10 },  // 车型
        { wch: 8 },   // 装卸车
        { wch: 20 },  // 装货省市区
        { wch: 30 },  // 装货详细地址
        { wch: 20 },  // 到达时间
        { wch: 20 }   // 完成时间
      ];
      
      XLSX.utils.book_append_sheet(workbook, worksheet, '已完成单子');
      
      // 生成buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // 上传到云存储
      const startDate = new Date(start_time).toISOString().split('T')[0];
      const endDate = new Date(end_time).toISOString().split('T')[0];
      const fileName = `已完成单子_${startDate}_${endDate}.xlsx`;
      const cloudPath = `excel/${Date.now()}_${fileName}`;
      
      const uploadResult = await uniCloud.uploadFile({
        cloudPath,
        fileContent: buffer
      });

      // 获取临时下载链接
      const tempFileURL = await uniCloud.getTempFileURL({
        fileList: [uploadResult.fileID]
      });

      return {
        errCode: 0,
        errMsg: '导出成功',
        data: {
          fileUrl: tempFileURL.fileList[0].tempFileURL,
          fileName,
          count: result.data.length
        }
      };
    } catch (e) {
      console.error('导出Excel失败：', e);
      return {
        errCode: 500,
        errMsg: '导出失败：' + e.message
      };
    }
  },

  /**
   * 获取已完成单子列表（带筛选）
   * @param {Object} params
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页数量
   * @param {String} params.truck_type 车型
   * @param {Number} params.operation_type 操作类型：0-装车，1-卸车
   * @param {Number} params.start_time 开始时间（时间戳）
   * @param {Number} params.end_time 结束时间（时间戳）
   * @param {String} params.plate_number 车牌号（模糊搜索）
   * @param {String} params.phone 手机号（模糊搜索）
   * @param {String} params.driver_name 司机姓名（模糊搜索）
   */
  async getFinishedList(params) {
    const {
      page = 1,
      pageSize = 20,
      truck_type,
      operation_type,
      start_time,
      end_time,
      plate_number,
      phone,
      driver_name
    } = params || {};

    try {
      // 构建查询条件
      const where = {
        status: 2  // 已完成
      };

      // 车型筛选
      if (truck_type) {
        where.truck_type = truck_type;
      }

      // 装卸车类型筛选
      if (operation_type !== undefined) {
        where.operation_type = operation_type;
      }

      // 时间范围筛选（按完成时间）
      if (start_time && end_time) {
        where.complete_time = dbCmd.and([
          dbCmd.gte(start_time),
          dbCmd.lte(end_time)
        ]);
      }

      // 车牌号模糊搜索
      if (plate_number) {
        where.plate_number = new RegExp(plate_number, 'i');
      }

      // 手机号模糊搜索
      if (phone) {
        where.phone = new RegExp(phone, 'i');
      }

      // 司机姓名模糊搜索
      if (driver_name) {
        where.driver_name = new RegExp(driver_name, 'i');
      }

      // 查询列表
      const result = await db.collection('trucks')
        .where(where)
        .orderBy('complete_time', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get();

      // 查询总数
      const total = await db.collection('trucks')
        .where(where)
        .count();

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          list: result.data,
          total: total.total,
          page,
          pageSize
        }
      };
    } catch (e) {
      console.error('获取已完成列表失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 管理员确认完成
   * @param {Object} params
   * @param {String} params.id 任务ID
   */
  async adminComplete(params) {
    const { id } = params;

    if (!id) {
      return {
        errCode: 400,
        errMsg: '参数不完整'
      };
    }

    try {
      // 🔥 预热微信API连接，获取access_token
      console.log('🔥 adminComplete方法：提前获取 access_token...');
      const preAccessToken = await getWxAccessToken();
      if (preAccessToken) {
        console.log('✅ access_token 预热成功！');
      } else {
        console.error('❌ access_token 预热失败（不影响主流程）');
      }
      
      // 1. 验证管理员权限
      console.log('管理员确认 - 当前用户ID:', this.currentUserId);
      const userInfo = await db.collection('uni-id-users').doc(this.currentUserId).get();
      console.log('用户信息:', JSON.stringify(userInfo.data[0], null, 2));
      console.log('用户角色:', userInfo.data[0]?.role);
      
      if (!userInfo.data[0] || userInfo.data[0].role !== 1) {
        console.error('权限验证失败 - role:', userInfo.data[0]?.role);
        return {
          errCode: 403,
          errMsg: '无权限操作，当前角色: ' + (userInfo.data[0]?.role ?? '未知')
        };
      }
      console.log('✅ 管理员权限验证通过');

      // 2. 查询任务
      const task = await db.collection('trucks').doc(id).get();
      if (!task.data[0]) {
        return {
          errCode: 404,
          errMsg: '任务不存在'
        };
      }

      // 3. 检查任务状态
      if (task.data[0].status !== 1) {
        return {
          errCode: 400,
          errMsg: '只能完成处理中的任务'
        };
      }

      const now = Date.now();

      // 4. 更新任务为已完成状态（管理员完成不需要上传图片）
      await db.collection('trucks').doc(id).update({
        status: 2,
        complete_time: now,
        admin_complete: true,  // 标记为管理员完成
        update_time: now
      });

      // 5. 查找下一个排队中的记录（按队列号排序，最小的优先）
      const nextRecord = await db.collection('trucks')
        .where({
          status: 0  // 排队中
        })
        .orderBy('queue_number', 'asc')
        .limit(1)
        .get();

      console.log('下一个排队中的记录数量:', nextRecord.data.length);

      // 6. 如果有下一个排队中的记录，将其状态改为"处理中"
      if (nextRecord.data.length > 0) {
        console.log('准备通知下一个用户:', nextRecord.data[0].plate_number);
        const nextTask = nextRecord.data[0];
        await db.collection('trucks').doc(nextTask._id).update({
          status: 1,  // 处理中
          update_time: now
        });
        
        // 发送"排队到号通知"给下一个用户（同步等待）
        try {
          const userInfo = await db.collection('uni-id-users').doc(nextTask.user_id).get();
          if (userInfo.data[0]?.wx_openid?.mp) {
            const openid = userInfo.data[0].wx_openid.mp;
            
            const taskInfo = await db.collection('trucks').doc(nextTask._id).get();
            const subscribedTmpls = taskInfo.data[0]?.subscribed_tmpls || [];
            const templateId = '6dmIz67zTI9aE3PJCTrqK48vFvZOctRJDTnzFx0Wj2M';  // 排队到号通知
            
            if (subscribedTmpls.includes(templateId)) {
              const res = await sendSubscribeMsg({
                openid,
                templateId,
                data: {
                  car_number22: { value: nextTask.plate_number },
                  phrase3: { value: '请就位' }
                }
              });
              
              if (res.errCode === 0) {
                console.log('✅ 排队到号通知发送成功（管理员完成后）');
              } else {
                console.error('❌ 排队到号通知发送失败:', res.errMsg);
              }
            }
          }
        } catch (err) {
          console.error('发送排队到号通知失败：', err);
        }
      }
      
      // 7. 查询所有排队中的单子，通知前面≤3人的用户
      const allWaitingTasks = await db.collection('trucks')
        .where({
          status: 0  // 排队中
        })
        .orderBy('queue_number', 'asc')
        .get();
      
      // 遍历排队中的单子，计算每个单子前面的数量，发送"排队进度通知"
      for (let i = 0; i < allWaitingTasks.data.length; i++) {
        const waitingTask = allWaitingTasks.data[i];
        const queuePosition = i + 1; // 前面的数量（不包括处理中的）
        
        // 如果前面≤3人，发送"排队进度通知"（同步等待）
        if (queuePosition <= 3) {
          try {
            const userInfo = await db.collection('uni-id-users').doc(waitingTask.user_id).get();
            if (userInfo.data[0]?.wx_openid?.mp) {
              const openid = userInfo.data[0].wx_openid.mp;
              
              const taskInfo = await db.collection('trucks').doc(waitingTask._id).get();
              const subscribedTmpls = taskInfo.data[0]?.subscribed_tmpls || [];
              const templateId = 'dKt-GXFHtyyoN_6Ag-ulck-eafezp1bQ6Sz95QCu6nM';
              
              if (subscribedTmpls.includes(templateId)) {
                const res = await sendSubscribeMsg({
                  openid,
                  templateId,
                  data: {
                    car_number11: { value: waitingTask.plate_number },
                    number3: { value: String(queuePosition) }
                  }
                });
                
                if (res.errCode === 0) {
                  console.log('✅ 排队进度通知发送成功（管理员完成后）');
                } else {
                  console.error('❌ 排队进度通知发送失败:', res.errMsg);
                }
              }
            }
          } catch (err) {
            console.error('发送排队进度通知失败：', err);
          }
        }
      }

      return {
        errCode: 0,
        errMsg: '操作成功'
      };
    } catch (e) {
      console.error('管理员确认完成失败：', e);
      return {
        errCode: 500,
        errMsg: '操作失败：' + e.message
      };
    }
  },

  /**
   * 取消排队
   * @param {Object} params
   * @param {String} params.id 任务ID
   */
  async cancelTask(params) {
    const { id } = params || {};

    if (!id) {
      return { errCode: 400, errMsg: '缺少任务ID' };
    }

    if (!this.currentUserId) {
      return { errCode: 401, errMsg: '请先登录' };
    }

    try {
      const task = await db.collection('trucks').doc(id).get();
      if (!task.data[0]) {
        return { errCode: 404, errMsg: '任务不存在' };
      }

      const record = task.data[0];

      // 验证是否是当前用户的记录
      if (record.user_id !== this.currentUserId) {
        return { errCode: 403, errMsg: '无权操作此记录' };
      }

      // 只有排队中和处理中的单子才能取消
      if (record.status !== 0 && record.status !== 1) {
        return { errCode: 400, errMsg: '当前状态无法取消' };
      }

      const wasProcessing = record.status === 1;
      const now = Date.now();

      // 更新为已取消
      await db.collection('trucks').doc(id).update({
        status: 3,  // 已取消
        cancel_time: now,
        update_time: now
      });

      // 如果取消的是"处理中"的单子，需要把下一个排队中的单子变为"处理中"
      if (wasProcessing) {
        const nextRecord = await db.collection('trucks')
          .where({ status: 0 })
          .orderBy('queue_number', 'asc')
          .limit(1)
          .get();

        if (nextRecord.data.length > 0) {
          const nextTask = nextRecord.data[0];
          await db.collection('trucks').doc(nextTask._id).update({
            status: 1,
            update_time: now
          });

          // 发送排队到号通知给下一个用户
          try {
            const preAccessToken = await getWxAccessToken();
            if (preAccessToken) {
              const userInfo = await db.collection('uni-id-users').doc(nextTask.user_id).get();
              if (userInfo.data[0]?.wx_openid?.mp) {
                const openid = userInfo.data[0].wx_openid.mp;
                const taskInfo = await db.collection('trucks').doc(nextTask._id).get();
                const subscribedTmpls = taskInfo.data[0]?.subscribed_tmpls || [];
                const templateId = '6dmIz67zTI9aE3PJCTrqK48vFvZOctRJDTnzFx0Wj2M';

                if (subscribedTmpls.includes(templateId)) {
                  await sendSubscribeMsg({
                    openid,
                    templateId,
                    data: {
                      car_number22: { value: nextTask.plate_number },
                      phrase3: { value: '请就位' }
                    }
                  });
                }
              }
            }
          } catch (err) {
            console.error('取消后通知下一位失败：', err);
          }
        }
      }

      return { errCode: 0, errMsg: '已取消排队' };
    } catch (e) {
      console.error('取消排队失败：', e);
      return { errCode: 500, errMsg: '操作失败：' + e.message };
    }
  },

  /**
   * 管理员取消排队
   * @param {Object} params
   * @param {String} params.id 任务ID
   */
  async adminCancelTask(params) {
    const { id } = params || {};

    if (!id) {
      return { errCode: 400, errMsg: '缺少任务ID' };
    }

    try {
      // 验证管理员权限
      const adminInfo = await db.collection('uni-id-users').doc(this.currentUserId).get();
      if (!adminInfo.data[0] || adminInfo.data[0].role !== 1) {
        return { errCode: 403, errMsg: '无权限操作' };
      }

      const task = await db.collection('trucks').doc(id).get();
      if (!task.data[0]) {
        return { errCode: 404, errMsg: '任务不存在' };
      }

      const record = task.data[0];

      if (record.status !== 0) {
        return { errCode: 400, errMsg: '只能取消排队中的单子' };
      }

      const now = Date.now();

      await db.collection('trucks').doc(id).update({
        status: 3,
        cancel_time: now,
        admin_cancel: true,
        update_time: now
      });

      return { errCode: 0, errMsg: '已取消该用户的排队' };
    } catch (e) {
      console.error('管理员取消排队失败：', e);
      return { errCode: 500, errMsg: '操作失败：' + e.message };
    }
  }
}

