const uniID = require('uni-id-common');
const db = uniCloud.database();
const dbCmd = db.command;

module.exports = {
  _before: function () {
    // 云对象前置方法
  },

  /**
   * 获取公告列表
   * @param {Object} params
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页数量
   * @param {Number} params.limit 限制数量（首页使用）
   * @param {Boolean} params.showAll 是否显示所有（管理员用，包括未发布的）
   */
  async getList(params) {
    const { page = 1, pageSize = 20, limit, showAll } = params || {};

    try {
      // 构建查询条件
      let where = {};
      
      // 如果需要显示全部（管理员），检查权限
      if (showAll) {
        try {
          const uniIdIns = uniID.createInstance({
            clientInfo: this.getClientInfo()
          });
          const payload = await uniIdIns.checkToken(this.getUniIdToken());
          
          if (payload.errCode === 0) {
            const userInfo = await db.collection('uni-id-users').doc(payload.uid).get();
            // 如果是管理员，不过滤 is_published
            if (userInfo.data[0] && userInfo.data[0].role === 1) {
              where = {}; // 管理员看到所有公告
            } else {
              where = { is_published: true }; // 非管理员只看已发布的
            }
          } else {
            where = { is_published: true }; // 未登录只看已发布的
          }
        } catch (e) {
          where = { is_published: true }; // 出错时只看已发布的
        }
      } else {
        where = { is_published: true }; // 默认只看已发布的
      }

      // 优化查询：分别查询弹窗公告和普通公告，避免资源耗尽
      
      // 1. 查询弹窗公告（最多1条）
      const popupResult = await db.collection('notices')
        .where({ ...where, is_popup: true })
        .orderBy('create_time', 'desc')
        .limit(1)
        .get();

      // 2. 查询普通公告
      let normalQuery = db.collection('notices')
        .where({ ...where, is_popup: false })
        .orderBy('create_time', 'desc');

      if (limit) {
        // 首页模式：获取指定数量
        const remainingLimit = Math.max(0, limit - popupResult.data.length);
        const normalResult = await normalQuery.limit(remainingLimit).get();
        const list = [...popupResult.data, ...normalResult.data];
        
        return {
          errCode: 0,
          errMsg: '获取成功',
          data: {
            list,
            total: list.length
          }
        };
      } else {
        // 列表页分页模式
        if (page === 1) {
          // 第一页：包含弹窗公告（如果有）+ 普通公告
          const normalLimit = popupResult.data.length > 0 ? pageSize - 1 : pageSize;
          const normalResult = await normalQuery.limit(normalLimit).get();
          const list = [...popupResult.data, ...normalResult.data];
          
          // 计算总数
          const normalTotal = await db.collection('notices')
            .where({ ...where, is_popup: false })
            .count();
          const total = popupResult.data.length + normalTotal.total;
          
          return {
            errCode: 0,
            errMsg: '获取成功',
            data: {
              list,
              total,
              page,
              pageSize
            }
          };
        } else {
          // 其他页：只查普通公告，调整 skip（因为第一页有弹窗占了一个位置）
          const hasPopup = popupResult.data.length > 0;
          const adjustedSkip = hasPopup ? (page - 1) * pageSize - 1 : (page - 1) * pageSize;
          const normalResult = await normalQuery.skip(adjustedSkip).limit(pageSize).get();
          
          // 计算总数
          const normalTotal = await db.collection('notices')
            .where({ ...where, is_popup: false })
            .count();
          const total = popupResult.data.length + normalTotal.total;
          
          return {
            errCode: 0,
            errMsg: '获取成功',
            data: {
              list: normalResult.data,
              total,
              page,
              pageSize
            }
          };
        }
      }
    } catch (e) {
      console.error('获取公告列表失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 获取公告详情
   * @param {Object} params
   * @param {String} params.id 公告ID
   */
  async getDetail(params) {
    const { id } = params;

    if (!id) {
      return {
        errCode: 400,
        errMsg: '缺少公告ID'
      };
    }

    try {
      const result = await db.collection('notices')
        .doc(id)
        .get();

      if (!result.data || result.data.length === 0) {
        return {
          errCode: 404,
          errMsg: '公告不存在'
        };
      }

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: result.data[0]
      };
    } catch (e) {
      console.error('获取公告详情失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 创建公告（管理员）
   * @param {Object} params
   * @param {String} params.title 公告标题
   * @param {String} params.content 公告内容
   */
  async create(params) {
    const { title, content, is_published, is_popup } = params;

    if (!title || !content) {
      return {
        errCode: 400,
        errMsg: '标题和内容不能为空'
      };
    }

    try {
      // 验证管理员权限
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

      // 检查是否是管理员
      const userInfo = await db.collection('uni-id-users').doc(payload.uid).get();
      if (!userInfo.data[0] || userInfo.data[0].role !== 1) {
        return {
          errCode: 403,
          errMsg: '无权限操作'
        };
      }

      // 如果设置为弹窗，先将其他弹窗公告改为非弹窗
      if (is_popup === true) {
        await db.collection('notices').where({
          is_popup: true
        }).update({
          is_popup: false
        });
        console.log('✅ 已将其他弹窗公告改为非弹窗');
      }

      const now = Date.now();
      const addData = {
        title,
        content,
        user_id: payload.uid,
        is_published: is_published !== undefined ? is_published : true,
        is_popup: is_popup !== undefined ? is_popup : false,
        create_time: now,
        update_time: now
      };

      const result = await db.collection('notices').add(addData);

      return {
        errCode: 0,
        errMsg: '创建成功',
        data: {
          id: result.id
        }
      };
    } catch (e) {
      console.error('创建公告失败：', e);
      return {
        errCode: 500,
        errMsg: '创建失败：' + e.message
      };
    }
  },

  /**
   * 更新公告（管理员）
   * @param {Object} params
   * @param {String} params.id 公告ID
   * @param {String} params.title 公告标题
   * @param {String} params.content 公告内容
   */
  async update(params) {
    const { id, title, content, is_published, is_popup } = params;

    if (!id) {
      return {
        errCode: 400,
        errMsg: '缺少公告ID'
      };
    }

    if (!title && !content && is_published === undefined && is_popup === undefined) {
      return {
        errCode: 400,
        errMsg: '至少需要修改一个字段'
      };
    }

    try {
      // 验证管理员权限
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

      const userInfo = await db.collection('uni-id-users').doc(payload.uid).get();
      if (!userInfo.data[0] || userInfo.data[0].role !== 1) {
        return {
          errCode: 403,
          errMsg: '无权限操作'
        };
      }

      // 如果设置为弹窗，先将其他弹窗公告改为非弹窗
      if (is_popup === true) {
        await db.collection('notices').where({
          _id: dbCmd.neq(id),
          is_popup: true
        }).update({
          is_popup: false
        });
        console.log('✅ 已将其他弹窗公告改为非弹窗');
      }

      const updateData = {
        update_time: Date.now()
      };
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (is_published !== undefined) updateData.is_published = is_published;
      if (is_popup !== undefined) updateData.is_popup = is_popup;

      // 更新公告
      await db.collection('notices').doc(id).update(updateData);

      // 获取公告信息，检查是否为弹窗公告
      const noticeInfo = await db.collection('notices').doc(id).get();
      if (noticeInfo.data[0] && noticeInfo.data[0].is_popup) {
        // 如果是弹窗公告，清除所有用户的已读记录
        await db.collection('uni-id-users').where({
          read_popup_notices: dbCmd.elemMatch(dbCmd.eq(id))
        }).update({
          read_popup_notices: dbCmd.pull(id)
        });
        
        console.log(`✅ 已清除公告 ${id} 的所有用户已读记录`);
      }

      return {
        errCode: 0,
        errMsg: '更新成功'
      };
    } catch (e) {
      console.error('更新公告失败：', e);
      return {
        errCode: 500,
        errMsg: '更新失败：' + e.message
      };
    }
  },

  /**
   * 删除公告（管理员）
   * @param {Object} params
   * @param {String} params.id 公告ID
   */
  async delete(params) {
    const { id } = params;

    if (!id) {
      return {
        errCode: 400,
        errMsg: '缺少公告ID'
      };
    }

    try {
      // 验证管理员权限
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

      const userInfo = await db.collection('uni-id-users').doc(payload.uid).get();
      if (!userInfo.data[0] || userInfo.data[0].role !== 1) {
        return {
          errCode: 403,
          errMsg: '无权限操作'
        };
      }

      await db.collection('notices').doc(id).remove();

      return {
        errCode: 0,
        errMsg: '删除成功'
      };
    } catch (e) {
      console.error('删除公告失败：', e);
      return {
        errCode: 500,
        errMsg: '删除失败：' + e.message
      };
    }
  },

  /**
   * 获取弹窗公告（用户登录后首页展示）
   */
  async getPopupNotice() {
    try {
      // 验证登录状态
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

      // 获取用户已读的弹窗公告列表
      const userInfo = await db.collection('uni-id-users').doc(payload.uid).get();
      const readNotices = userInfo.data[0]?.read_popup_notices || [];

      // 查询最新的未读弹窗公告
      const result = await db.collection('notices')
        .where({
          is_published: true,
          is_popup: true,
          _id: dbCmd.nin(readNotices) // 排除已读的
        })
        .orderBy('create_time', 'desc')
        .limit(1)
        .get();

      if (result.data.length === 0) {
        return {
          errCode: 0,
          errMsg: '暂无弹窗公告',
          data: null
        };
      }

      return {
        errCode: 0,
        errMsg: '获取成功',
        data: result.data[0]
      };
    } catch (e) {
      console.error('获取弹窗公告失败：', e);
      return {
        errCode: 500,
        errMsg: '获取失败：' + e.message
      };
    }
  },

  /**
   * 标记弹窗公告为已读
   * @param {Object} params
   * @param {String} params.noticeId 公告ID
   */
  async markPopupAsRead(params) {
    const { noticeId } = params;

    if (!noticeId) {
      return {
        errCode: 400,
        errMsg: '缺少公告ID'
      };
    }

    try {
      // 验证登录状态
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

      // 将公告ID添加到用户的已读列表中
      await db.collection('uni-id-users').doc(payload.uid).update({
        read_popup_notices: dbCmd.addToSet(noticeId)
      });

      return {
        errCode: 0,
        errMsg: '标记成功'
      };
    } catch (e) {
      console.error('标记已读失败：', e);
      return {
        errCode: 500,
        errMsg: '标记失败：' + e.message
      };
    }
  }
}
