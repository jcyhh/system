"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
require("../../store/index.js");
const store_modules_app = require("../../store/modules/app.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const pageSize = 20;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const appStore = store_modules_app.useAppStore();
    const noticeList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const isAdmin = common_vendor.computed(() => {
      return appStore.isLogin && appStore.role === 1;
    });
    const loadNoticeList = async (isRefresh = false) => {
      if (isLoading.value)
        return;
      if (!hasMore.value && !isRefresh)
        return;
      try {
        isLoading.value = true;
        if (isRefresh) {
          page.value = 1;
          hasMore.value = true;
        }
        const noticeObj = common_vendor.tr.importObject("notice");
        const res = await noticeObj.getList({
          page: page.value,
          pageSize,
          showAll: isAdmin.value
          // 管理员显示所有公告
        });
        if (res.errCode === 0) {
          if (isRefresh) {
            noticeList.value = res.data.list;
          } else {
            noticeList.value = [...noticeList.value, ...res.data.list];
          }
          if (res.data.list.length < pageSize) {
            hasMore.value = false;
          }
          if (res.data.list.length > 0) {
            page.value++;
          }
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "获取失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/notice/list.vue:107", "获取失败：", e);
        common_vendor.index.showToast({
          title: e.message || "获取失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    };
    const goDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/notice/detail?id=${id}`
      });
    };
    const addNotice = () => {
      common_vendor.index.navigateTo({
        url: "/pages/notice/edit"
      });
    };
    const editNotice = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/notice/edit?id=${item._id}`
      });
    };
    const deleteNotice = (item) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这条公告吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const noticeObj = common_vendor.tr.importObject("notice");
              const result = await noticeObj.delete({ id: item._id });
              if (result.errCode === 0) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                await loadNoticeList(true);
              } else {
                common_vendor.index.showToast({
                  title: result.errMsg || "删除失败",
                  icon: "none"
                });
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/notice/list.vue:174", "删除失败：", e);
              common_vendor.index.showToast({
                title: e.message || "删除失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    common_vendor.onLoad(() => {
      loadNoticeList(true);
    });
    common_vendor.onShow(() => {
      if (noticeList.value.length > 0) {
        loadNoticeList(true);
      }
    });
    common_vendor.onPullDownRefresh(async () => {
      try {
        await loadNoticeList(true);
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/notice/list.vue:207", "刷新失败：", e);
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    });
    common_vendor.onReachBottom(() => {
      loadNoticeList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(noticeList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title)
          }, isAdmin.value ? common_vendor.e({
            b: !item.is_published
          }, !item.is_published ? {} : {}, {
            c: item.is_popup
          }, item.is_popup ? {} : {}) : {}, {
            d: common_vendor.t(formatTime(item.create_time))
          }, isAdmin.value ? {
            e: common_vendor.o(($event) => editNotice(item), item._id),
            f: "b9ccfb1a-0-" + i0,
            g: common_vendor.p({
              type: "compose",
              size: 20
            }),
            h: common_vendor.o(($event) => deleteNotice(item), item._id),
            i: "b9ccfb1a-1-" + i0,
            j: common_vendor.p({
              type: "trash",
              size: 20,
              color: "#dd524d"
            }),
            k: common_vendor.o(() => {
            }, item._id)
          } : {}, {
            l: common_vendor.o(($event) => goDetail(item._id), item._id),
            m: item._id
          });
        }),
        b: isAdmin.value,
        c: isAdmin.value,
        d: noticeList.value.length === 0 && !isLoading.value
      }, noticeList.value.length === 0 && !isLoading.value ? {
        e: common_assets._imports_0
      } : {}, {
        f: isLoading.value
      }, isLoading.value ? {} : !hasMore.value && noticeList.value.length > 0 ? {} : {}, {
        g: !hasMore.value && noticeList.value.length > 0,
        h: isAdmin.value
      }, isAdmin.value ? {} : {}, {
        i: isAdmin.value
      }, isAdmin.value ? {
        j: common_vendor.o(addNotice)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b9ccfb1a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notice/list.js.map
