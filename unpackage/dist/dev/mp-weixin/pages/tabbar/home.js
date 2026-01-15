"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
require("../../store/index.js");
const store_modules_app = require("../../store/modules/app.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup + Finish + Popup)();
}
const Finish = () => "../home/Finish.js";
const Popup = () => "../home/Popup.js";
const pageSize = 20;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "home",
  setup(__props) {
    const appStore = store_modules_app.useAppStore();
    const popupRef = common_vendor.ref();
    const finishRef = common_vendor.ref();
    const noticeRef = common_vendor.ref();
    const currentTask = common_vendor.ref(null);
    const queueList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const noticeList = common_vendor.ref([]);
    const goNotice = () => {
      common_vendor.index.navigateTo({
        url: "/pages/notice/list"
      });
    };
    const queueStats = common_vendor.ref({
      total: 0,
      processing: 0,
      waiting: 0
    });
    const loadNoticeList = async () => {
      try {
        const noticeObj = common_vendor.tr.importObject("notice");
        const res = await noticeObj.getList({ limit: 5 });
        if (res.errCode === 0) {
          noticeList.value = res.data.list;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/tabbar/home.vue:153", "加载公告列表失败：", e);
      }
    };
    const loadPopupNotice = async () => {
      if (!appStore.isLogin)
        return;
      try {
        const noticeObj = common_vendor.tr.importObject("notice");
        const res = await noticeObj.getPopupNotice();
        if (res.errCode === 0 && res.data) {
          setTimeout(() => {
            var _a;
            (_a = noticeRef.value) == null ? void 0 : _a.open(res.data);
          }, 500);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/tabbar/home.vue:173", "加载弹窗公告失败：", e);
      }
    };
    const myQueueNumber = common_vendor.computed(() => {
      if (!currentTask.value)
        return 0;
      const index = queueList.value.findIndex((item) => item._id === currentTask.value._id);
      return index !== -1 ? index + 1 : 0;
    });
    const estimatedWaitTime = common_vendor.computed(() => {
      if (!currentTask.value || currentTask.value.status === 1)
        return "";
      const myIndex = queueList.value.findIndex((item) => item._id === currentTask.value._id);
      if (myIndex <= 0)
        return "即将开始";
      const waitMinutes = myIndex * 30;
      const hours = Math.floor(waitMinutes / 60);
      const minutes = waitMinutes % 60;
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
      } else {
        return `${minutes}分钟`;
      }
    });
    const checkCurrentTask = async () => {
      if (!appStore.isLogin) {
        currentTask.value = null;
        return;
      }
      try {
        const truckObj = common_vendor.tr.importObject("truck");
        const res = await truckObj.getCurrentTask();
        if (res.errCode === 0 && res.data) {
          currentTask.value = res.data;
        } else {
          currentTask.value = null;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/tabbar/home.vue:223", "查询失败：", e);
        currentTask.value = null;
      }
    };
    const loadQueueList = async (isRefresh = false) => {
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
        const truckObj = common_vendor.tr.importObject("truck");
        const res = await truckObj.getQueueList({
          page: page.value,
          pageSize
        });
        if (res.errCode === 0) {
          if (isRefresh) {
            queueList.value = res.data.list;
          } else {
            queueList.value = [...queueList.value, ...res.data.list];
          }
          queueStats.value.total = res.data.total;
          queueStats.value.processing = queueList.value.filter((item) => item.status === 1).length;
          queueStats.value.waiting = queueList.value.filter((item) => item.status === 0).length;
          if (res.data.list.length < pageSize) {
            hasMore.value = false;
          }
          if (res.data.list.length > 0) {
            page.value++;
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/tabbar/home.vue:272", "获取列表失败：", e);
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
      const second = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    };
    common_vendor.onShow(async () => {
      await loadNoticeList();
      await loadQueueList(true);
      await checkCurrentTask();
      await loadPopupNotice();
    });
    common_vendor.index.$on("refreshHome", async () => {
      await loadQueueList(true);
      await checkCurrentTask();
    });
    common_vendor.onPullDownRefresh(async () => {
      try {
        await loadQueueList(true);
        await checkCurrentTask();
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/tabbar/home.vue:318", "刷新失败：", e);
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    });
    common_vendor.onReachBottom(() => {
      loadQueueList();
    });
    const goApply = () => {
      if (currentTask.value) {
        common_vendor.index.navigateTo({
          url: `/pages/home/apply?id=${currentTask.value._id}`
        });
      } else {
        common_vendor.index.navigateTo({
          url: "/pages/home/apply"
        });
      }
    };
    const openFinish = () => {
      var _a, _b;
      if (!appStore.isLogin) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.switchTab({
                url: "/pages/tabbar/mine"
              });
            }
          }
        });
        return;
      }
      if (currentTask.value && currentTask.value.status === 1) {
        (_a = finishRef.value) == null ? void 0 : _a.open(currentTask.value._id);
      } else {
        (_b = popupRef.value) == null ? void 0 : _b.open();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: noticeList.value.length > 0
      }, noticeList.value.length > 0 ? {
        b: common_vendor.p({
          type: "notification",
          size: 20
        }),
        c: common_vendor.f(noticeList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: item._id
          };
        }),
        d: common_vendor.o(goNotice)
      } : {}, {
        e: common_assets._imports_0$1,
        f: common_vendor.t(currentTask.value ? "修改信息" : "我要排队"),
        g: common_vendor.o(goApply),
        h: common_assets._imports_1,
        i: common_vendor.o(openFinish),
        j: common_assets._imports_2,
        k: common_vendor.t(queueStats.value.total),
        l: common_vendor.f(queueList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.status == 1
          }, item.status == 1 ? {} : {}, {
            b: common_vendor.t(index + 1),
            c: common_vendor.t(item.plate_number),
            d: common_vendor.t(formatTime(item.create_time)),
            e: common_vendor.t(item.truck_type),
            f: item.operation_type == 1
          }, item.operation_type == 1 ? {
            g: common_assets._imports_3
          } : {
            h: common_assets._imports_2$1
          }, {
            i: item._id
          });
        }),
        m: queueList.value.length === 0
      }, queueList.value.length === 0 ? {
        n: common_assets._imports_0
      } : {}, {
        o: common_vendor.unref(appStore).isLogin && currentTask.value
      }, common_vendor.unref(appStore).isLogin && currentTask.value ? common_vendor.e({
        p: common_vendor.t(myQueueNumber.value),
        q: common_vendor.t(currentTask.value.plate_number),
        r: currentTask.value.status === 0
      }, currentTask.value.status === 0 ? {
        s: common_vendor.t(estimatedWaitTime.value)
      } : {}, {
        t: currentTask.value.status === 0
      }, currentTask.value.status === 0 ? {} : {}) : {}, {
        v: common_vendor.p({
          type: "closeempty",
          color: "#FFFFFF",
          size: 25
        }),
        w: common_vendor.o(($event) => {
          var _a;
          return (_a = popupRef.value) == null ? void 0 : _a.close();
        }),
        x: common_vendor.p({
          type: "closeempty",
          size: 25
        }),
        y: common_assets._imports_0,
        z: common_vendor.sr(popupRef, "4764087f-1", {
          "k": "popupRef"
        }),
        A: common_vendor.p({
          type: "center"
        }),
        B: common_vendor.sr(finishRef, "4764087f-4", {
          "k": "finishRef"
        }),
        C: common_vendor.sr(noticeRef, "4764087f-5", {
          "k": "noticeRef"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4764087f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/tabbar/home.js.map
