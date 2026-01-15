"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const noticeDetail = common_vendor.ref(null);
    const isLoading = common_vendor.ref(false);
    const loadNoticeDetail = async (id) => {
      try {
        isLoading.value = true;
        const noticeObj = common_vendor.tr.importObject("notice");
        const res = await noticeObj.getDetail({ id });
        if (res.errCode === 0) {
          noticeDetail.value = res.data;
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "获取失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/notice/detail.vue:53", "获取失败：", e);
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
    common_vendor.onLoad((options) => {
      if (options.id) {
        loadNoticeDetail(options.id);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: noticeDetail.value
      }, noticeDetail.value ? {
        b: common_vendor.t(noticeDetail.value.title),
        c: common_vendor.t(formatTime(noticeDetail.value.create_time)),
        d: noticeDetail.value.content
      } : !isLoading.value ? {
        f: common_assets._imports_0
      } : {}, {
        e: !isLoading.value,
        g: isLoading.value
      }, isLoading.value ? {} : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f737f11"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notice/detail.js.map
