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

