const uniID = require('uni-id-common');
const db = uniCloud.database();

module.exports = {
  _before: function () {
    // 云对象前置方法
  },

  /**
   * 微信小程序登录
   * @param {Object} params
   * @param {String} params.code 微信登录code
   */
  async loginByWeixin(params) {
    const { code } = params;
    
    if (!code) {
      return {
        errCode: 400,
        errMsg: '缺少code参数'
      };
    }

    try {
      // 1. 调用微信接口，用 code 换取 openid 和 session_key
      const wxRes = await uniCloud.httpclient.request(
        'https://api.weixin.qq.com/sns/jscode2session',
        {
          method: 'GET',
          data: {
            appid: 'wx93f72f4bacc468f4',
            secret: '6e54ef01b2ca76c2b37fe360774ce7ae',
            js_code: code,
            grant_type: 'authorization_code'
          },
          dataType: 'json'
        }
      );

      if (wxRes.status !== 200 || wxRes.data.errcode) {
        return {
          errCode: wxRes.data.errcode || 500,
          errMsg: wxRes.data.errmsg || '微信登录失败'
        };
      }

      const { openid, session_key } = wxRes.data;

      // 2. 查询或创建用户
      const userQuery = await db.collection('uni-id-users')
        .where({
          wx_openid: {
            mp: openid
          }
        })
        .get();

      let userId;
      let userRole = 0;

      if (userQuery.data.length === 0) {
        // 新用户，创建记录
        const createRes = await db.collection('uni-id-users').add({
          wx_openid: {
            mp: openid
          },
          wx_sessionkey: {
            mp: session_key
          },
          role: 0,
          register_date: Date.now(),
          register_ip: this.getClientInfo().clientIP
        });
        userId = createRes.id;
      } else {
        // 已有用户，更新 session_key
        const user = userQuery.data[0];
        userId = user._id;
        userRole = user.role || 0;

        await db.collection('uni-id-users').doc(userId).update({
          wx_sessionkey: {
            mp: session_key
          },
          last_login_date: Date.now(),
          last_login_ip: this.getClientInfo().clientIP
        });
      }

      // 3. 使用 uni-id-common 创建 token
      const uniIdIns = uniID.createInstance({
        clientInfo: this.getClientInfo()
      });

      const tokenRes = await uniIdIns.createToken({
        uid: userId,
        role: [userRole === 1 ? 'admin' : 'user'],
        permission: []
      });

      if (tokenRes.errCode === 0) {
        return {
          errCode: 0,
          errMsg: '登录成功',
          data: {
            token: tokenRes.token,
            tokenExpired: tokenRes.tokenExpired,
            userInfo: {
              _id: userId,
              uid: userId,
              role: userRole
            }
          }
        };
      } else {
        return {
          errCode: tokenRes.errCode,
          errMsg: tokenRes.errMsg || '创建token失败'
        };
      }
    } catch (e) {
      console.error('登录异常：', e);
      return {
        errCode: 500,
        errMsg: '登录异常：' + e.message
      };
    }
  },

  /**
   * 设置用户角色（仅管理员可调用）
   * @param {Object} params
   * @param {String} params.userId 目标用户ID
   * @param {Number} params.role 角色：0-普通用户，1-管理员
   */
  async setUserRole(params) {
    const { userId, role } = params;
    
    if (!userId || role === undefined) {
      return {
        errCode: 400,
        errMsg: '参数不完整'
      };
    }
    
    try {
      // 1. 验证当前用户是管理员
      const uniIdIns = uniID.createInstance({
        clientInfo: this.getClientInfo()
      });
      
      const payload = await uniIdIns.checkToken(this.getUniIdToken());
      
      if (payload.errCode !== 0) {
        return {
          errCode: 401,
          errMsg: '请先登录'
        };
      }
      
      const currentUserId = payload.uid;
      const currentUserInfo = await db.collection('uni-id-users')
        .doc(currentUserId)
        .field({ role: true })
        .get();
      
      if (currentUserInfo.data.length === 0 || currentUserInfo.data[0].role !== 1) {
        return {
          errCode: 403,
          errMsg: '无权限操作'
        };
      }
      
      // 2. 检查目标用户是否存在
      const targetUser = await db.collection('uni-id-users')
        .doc(userId)
        .field({ _id: true, role: true })
        .get();
      
      if (targetUser.data.length === 0) {
        return {
          errCode: 404,
          errMsg: '目标用户不存在'
        };
      }
      
      // 3. 更新目标用户角色
      await db.collection('uni-id-users').doc(userId).update({
        role: role
      });
      
      const roleName = role === 1 ? '管理员' : '普通用户';
      console.log(`用户 ${currentUserId} 将用户 ${userId} 设置为 ${roleName}`);
      
      return {
        errCode: 0,
        errMsg: `已设置为${roleName}`
      };
    } catch (e) {
      console.error('设置用户角色失败：', e);
      return {
        errCode: 500,
        errMsg: '设置失败：' + e.message
      };
    }
  },

  /**
   * 获取用户信息
   */
  async getUserInfo() {
    try {
      const uniIdIns = uniID.createInstance({
        clientInfo: this.getClientInfo()
      });

      // 验证 token
      const payload = await uniIdIns.checkToken(this.getUniIdToken());
      
      if (payload.errCode !== 0) {
        return {
          errCode: 401,
          errMsg: '请先登录'
        };
      }

      const uid = payload.uid;
      const userInfo = await db.collection('uni-id-users')
        .doc(uid)
        .field({
          _id: true,
          role: true
        })
        .get();

      if (userInfo.data.length === 0) {
        return {
          errCode: 404,
          errMsg: '用户不存在'
        };
      }

      console.log('getUserInfo - 用户数据:', JSON.stringify(userInfo.data[0], null, 2));

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          _id: userInfo.data[0]._id,
          role: userInfo.data[0].role || 0
        }
      };
    } catch (e) {
      console.error('获取用户信息失败：', e);
      return {
        errCode: 500,
        errMsg: '获取用户信息失败：' + e.message
      };
    }
  }
}

