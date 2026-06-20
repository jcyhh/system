"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
require("../../store/index.js");
const utils_loading = require("../../utils/loading.js");
const store_modules_app = require("../../store/modules/app.js");
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
    const appStore = store_modules_app.useAppStore();
    const detailData = common_vendor.ref(null);
    const isAdmin = common_vendor.computed(() => appStore.role === 1);
    const statusText = common_vendor.computed(() => {
      if (!detailData.value)
        return "";
      const statusMap = {
        0: "排队中",
        1: "处理中",
        2: "已完成",
        3: "已取消"
      };
      return statusMap[detailData.value.status] || "";
    });
    const loadDetail = async (id) => {
      try {
        utils_loading.showDelayedLoading({ title: "加载中..." });
        const truckObj = common_vendor._r.importObject("truck");
        const res = await truckObj.getDetail({ id });
        utils_loading.hideDelayedLoading();
        if (res.errCode === 0) {
          detailData.value = res.data;
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "获取失败",
            icon: "none"
          });
        }
      } catch (e) {
        utils_loading.hideDelayedLoading();
        common_vendor.index.__f__("error", "at pages/mine/detail.vue:165", "获取详情失败：", e);
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
    const adminStart = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定将该排队订单设为处理中吗？",
        success: async (res) => {
          if (!res.confirm)
            return;
          utils_loading.showDelayedLoading({ title: "处理中..." });
          try {
            const truckObj = common_vendor._r.importObject("truck");
            const result = await truckObj.adminStartProcessing({ id: detailData.value._id });
            utils_loading.hideDelayedLoading();
            if (result.errCode === 0) {
              common_vendor.index.showToast({ title: "已开始处理", icon: "success" });
              loadDetail(detailData.value._id);
            } else {
              common_vendor.index.showToast({ title: result.errMsg || "操作失败", icon: "none" });
            }
          } catch (e) {
            utils_loading.hideDelayedLoading();
            common_vendor.index.showToast({ title: e.message || "操作失败", icon: "none" });
          }
        }
      });
    };
    const adminComplete = () => {
      common_vendor.index.showModal({
        title: "确认完成",
        content: "确定要完成该订单吗？",
        success: async (res) => {
          if (!res.confirm)
            return;
          utils_loading.showDelayedLoading({ title: "处理中..." });
          try {
            const truckObj = common_vendor._r.importObject("truck");
            const result = await truckObj.adminComplete({ id: detailData.value._id });
            utils_loading.hideDelayedLoading();
            if (result.errCode === 0) {
              common_vendor.index.showToast({ title: "操作成功", icon: "success" });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1e3);
            } else {
              common_vendor.index.showToast({ title: result.errMsg || "操作失败", icon: "none" });
            }
          } catch (e) {
            utils_loading.hideDelayedLoading();
            common_vendor.index.showToast({ title: e.message || "操作失败", icon: "none" });
          }
        }
      });
    };
    const adminCancel = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消该用户的排队吗？",
        confirmColor: "#e43d33",
        success: async (res) => {
          if (!res.confirm)
            return;
          utils_loading.showDelayedLoading({ title: "取消中..." });
          try {
            const truckObj = common_vendor._r.importObject("truck");
            const result = await truckObj.adminCancelTask({ id: detailData.value._id });
            utils_loading.hideDelayedLoading();
            if (result.errCode === 0) {
              common_vendor.index.showToast({ title: "已取消", icon: "success" });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1e3);
            } else {
              common_vendor.index.showToast({ title: result.errMsg || "取消失败", icon: "none" });
            }
          } catch (e) {
            utils_loading.hideDelayedLoading();
            common_vendor.index.showToast({ title: e.message || "取消失败", icon: "none" });
          }
        }
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
        g: common_vendor.o(($event) => copy(detailData.value.driver_name), "69"),
        h: common_vendor.t(detailData.value.phone),
        i: common_assets._imports_1$1,
        j: common_vendor.o(($event) => copy(detailData.value.phone), "36"),
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
        s: common_vendor.o(($event) => copy(detailData.value.loading_province + detailData.value.loading_address), "8e")
      } : {}, {
        t: common_vendor.t(detailData.value.plate_number),
        v: common_assets._imports_1$1,
        w: common_vendor.o(($event) => copy(detailData.value.plate_number), "d6"),
        x: common_vendor.t(detailData.value.truck_type),
        y: common_vendor.t(formatTime(detailData.value.create_time)),
        z: detailData.value.complete_time
      }, detailData.value.complete_time ? {
        A: common_vendor.t(formatTime(detailData.value.complete_time))
      } : {}, {
        B: common_vendor.t(statusText.value),
        C: detailData.value.status === 1 ? 1 : "",
        D: detailData.value.status === 0 ? 1 : "",
        E: detailData.value.status === 3 ? 1 : "",
        F: isAdmin.value && detailData.value.admin_started
      }, isAdmin.value && detailData.value.admin_started ? {} : {}, {
        G: detailData.value.photo
      }, detailData.value.photo ? {
        H: detailData.value.photo,
        I: common_vendor.o(($event) => viewImg(detailData.value.photo), "ee")
      } : {}, {
        J: detailData.value.complete_photo
      }, detailData.value.complete_photo ? {
        K: detailData.value.complete_photo,
        L: common_vendor.o(($event) => viewImg(detailData.value.complete_photo), "fb")
      } : {}) : {}, {
        M: detailData.value && isAdmin.value
      }, detailData.value && isAdmin.value ? common_vendor.e({
        N: detailData.value.status === 0
      }, detailData.value.status === 0 ? {
        O: common_vendor.o(adminStart, "8f")
      } : {}, {
        P: detailData.value.status === 1
      }, detailData.value.status === 1 ? {
        Q: common_vendor.o(adminComplete, "47")
      } : {}, {
        R: detailData.value.status === 0
      }, detailData.value.status === 0 ? {
        S: common_vendor.o(adminCancel, "7e")
      } : {}) : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f66e8cf8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/detail.js.map
