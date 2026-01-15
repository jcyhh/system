"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const pageSize = 20;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "waiting",
  setup(__props) {
    const waitingList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const loadWaitingList = async (isRefresh = false) => {
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
        const res = await truckObj.getList({
          status: 0,
          // 排队中
          page: page.value,
          pageSize
        });
        if (res.errCode === 0) {
          if (isRefresh) {
            waitingList.value = res.data.list;
          } else {
            waitingList.value = [...waitingList.value, ...res.data.list];
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
        common_vendor.index.__f__("error", "at pages/mine/waiting.vue:101", "获取失败：", e);
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
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hour}:${minute}`;
    };
    const goDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/mine/detail?id=${item._id}`
      });
    };
    common_vendor.onLoad(() => {
      loadWaitingList(true);
    });
    common_vendor.onPullDownRefresh(async () => {
      try {
        await loadWaitingList(true);
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/waiting.vue:142", "刷新失败：", e);
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    });
    common_vendor.onReachBottom(() => {
      loadWaitingList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(waitingList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.t(item.driver_name),
            c: common_vendor.t(item.plate_number),
            d: common_vendor.t(item.phone),
            e: common_vendor.t(item.truck_type),
            f: item.operation_type == 1 ? "/static/imgs/5.png" : "/static/imgs/6.png",
            g: common_vendor.t(item.operation_type == 1 ? "卸车" : "装车"),
            h: common_vendor.t(formatTime(item.create_time)),
            i: item._id,
            j: common_vendor.o(($event) => goDetail(item), item._id)
          };
        }),
        b: waitingList.value.length === 0 && !isLoading.value
      }, waitingList.value.length === 0 && !isLoading.value ? {
        c: common_assets._imports_0
      } : {}, {
        d: isLoading.value
      }, isLoading.value ? {} : !hasMore.value && waitingList.value.length > 0 ? {} : {}, {
        e: !hasMore.value && waitingList.value.length > 0
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c6c1d4d9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/waiting.js.map
