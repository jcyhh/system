"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const detailData = common_vendor.ref(null);
    const statusText = common_vendor.computed(() => {
      if (!detailData.value)
        return "";
      const statusMap = {
        0: "排队中",
        1: "处理中",
        2: "已完成"
      };
      return statusMap[detailData.value.status] || "";
    });
    const loadDetail = async (id) => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const truckObj = common_vendor.tr.importObject("truck");
        const res = await truckObj.getDetail({ id });
        common_vendor.index.hideLoading();
        if (res.errCode === 0) {
          detailData.value = res.data;
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "获取失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/mine/detail.vue:153", "获取详情失败：", e);
        common_vendor.index.showToast({
          title: e.message || "获取失败",
          icon: "none"
        });
      }
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      const second = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    };
    const viewImg = (url) => {
      if (!url)
        return;
      common_vendor.index.previewImage({
        urls: [url]
      });
    };
    const copy = (text) => {
      common_vendor.index.setClipboardData({
        data: text
      });
    };
    common_vendor.onLoad((options) => {
      if (options.id) {
        loadDetail(options.id);
      } else {
        common_vendor.index.showToast({
          title: "缺少ID参数",
          icon: "none"
        });
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !detailData.value
      }, !detailData.value ? {
        b: common_assets._imports_0
      } : {}, {
        c: !detailData.value
      }, !detailData.value ? {} : {}, {
        d: detailData.value
      }, detailData.value ? common_vendor.e({
        e: common_vendor.t(detailData.value.driver_name),
        f: common_assets._imports_1$1,
        g: common_vendor.o(($event) => copy(detailData.value.driver_name)),
        h: common_vendor.t(detailData.value.phone),
        i: common_assets._imports_1$1,
        j: common_vendor.o(($event) => copy(detailData.value.phone)),
        k: detailData.value.operation_type === 0
      }, detailData.value.operation_type === 0 ? {
        l: common_assets._imports_2$1
      } : {
        m: common_assets._imports_3
      }, {
        n: detailData.value.operation_type === 1 && detailData.value.loading_province
      }, detailData.value.operation_type === 1 && detailData.value.loading_province ? {
        o: common_assets._imports_1$1,
        p: common_vendor.p({
          type: "location-filled",
          size: 40
        }),
        q: common_vendor.t(detailData.value.loading_province),
        r: common_vendor.t(detailData.value.loading_address),
        s: common_vendor.o(($event) => copy(detailData.value.loading_province + detailData.value.loading_address))
      } : {}, {
        t: common_vendor.t(detailData.value.plate_number),
        v: common_assets._imports_1$1,
        w: common_vendor.o(($event) => copy(detailData.value.plate_number)),
        x: common_vendor.t(detailData.value.truck_type),
        y: common_vendor.t(formatTime(detailData.value.create_time)),
        z: detailData.value.complete_time
      }, detailData.value.complete_time ? {
        A: common_vendor.t(formatTime(detailData.value.complete_time))
      } : {}, {
        B: common_vendor.t(statusText.value),
        C: detailData.value.status === 1 ? 1 : "",
        D: detailData.value.status === 0 ? 1 : "",
        E: detailData.value.status === 2 ? 1 : "",
        F: detailData.value.photo
      }, detailData.value.photo ? {
        G: detailData.value.photo,
        H: common_vendor.o(($event) => viewImg(detailData.value.photo))
      } : {}, {
        I: detailData.value.complete_photo
      }, detailData.value.complete_photo ? {
        J: detailData.value.complete_photo,
        K: common_vendor.o(($event) => viewImg(detailData.value.complete_photo))
      } : {}) : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f66e8cf8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/detail.js.map
