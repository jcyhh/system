"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
  __name: "dealing",
  setup(__props) {
    const appStore = store_modules_app.useAppStore();
    const dealingData = common_vendor.ref(null);
    const loadDealingData = async () => {
      try {
        const truckObj = common_vendor.tr.importObject("truck");
        const res = await truckObj.getList({
          status: 1,
          // 处理中
          page: 1,
          pageSize: 1
        });
        if (res.errCode === 0) {
          if (res.data.list.length > 0) {
            dealingData.value = res.data.list[0];
          } else {
            dealingData.value = null;
          }
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "获取失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/dealing.vue:141", "获取失败：", e);
        common_vendor.index.showToast({
          title: e.message || "获取失败",
          icon: "none"
        });
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
    const submit = async () => {
      if (!dealingData.value)
        return;
      common_vendor.index.__f__("log", "at pages/mine/dealing.vue:181", "当前用户角色:", appStore.role);
      common_vendor.index.__f__("log", "at pages/mine/dealing.vue:182", "是否管理员:", appStore.role === 1);
      if (appStore.role === 1) {
        common_vendor.index.showModal({
          title: "确认完成",
          content: "确定要完成该订单吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                common_vendor.index.showLoading({ title: "处理中..." });
                const truckObj = common_vendor.tr.importObject("truck");
                const result = await truckObj.adminComplete({
                  id: dealingData.value._id
                });
                common_vendor.index.hideLoading();
                if (result.errCode === 0) {
                  common_vendor.index.showToast({
                    title: "操作成功",
                    icon: "success"
                  });
                  setTimeout(() => {
                    common_vendor.index.navigateBack();
                  }, 1500);
                } else {
                  common_vendor.index.showToast({
                    title: result.errMsg || "操作失败",
                    icon: "none"
                  });
                }
              } catch (e) {
                common_vendor.index.hideLoading();
                common_vendor.index.__f__("error", "at pages/mine/dealing.vue:219", "操作失败：", e);
                common_vendor.index.showToast({
                  title: e.message || "操作失败",
                  icon: "none"
                });
              }
            }
          }
        });
      } else {
        common_vendor.index.navigateTo({
          url: `/pages/home/Finish?id=${dealingData.value._id}`
        });
      }
    };
    common_vendor.onLoad(() => {
      loadDealingData();
    });
    common_vendor.onPullDownRefresh(async () => {
      try {
        await loadDealingData();
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/dealing.vue:251", "刷新失败：", e);
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !dealingData.value
      }, !dealingData.value ? {
        b: common_assets._imports_0
      } : {}, {
        c: !dealingData.value
      }, !dealingData.value ? {} : {}, {
        d: dealingData.value
      }, dealingData.value ? common_vendor.e({
        e: common_vendor.t(dealingData.value.driver_name),
        f: common_assets._imports_1$1,
        g: common_vendor.o(($event) => copy(dealingData.value.driver_name)),
        h: common_vendor.t(dealingData.value.phone),
        i: common_assets._imports_1$1,
        j: common_vendor.o(($event) => copy(dealingData.value.phone)),
        k: dealingData.value.operation_type === 0
      }, dealingData.value.operation_type === 0 ? {
        l: common_assets._imports_2$1
      } : {
        m: common_assets._imports_3
      }, {
        n: dealingData.value.operation_type === 1 && dealingData.value.loading_province
      }, dealingData.value.operation_type === 1 && dealingData.value.loading_province ? {
        o: common_assets._imports_1$1,
        p: common_vendor.p({
          type: "location-filled",
          size: 40
        }),
        q: common_vendor.t(dealingData.value.loading_province),
        r: common_vendor.t(dealingData.value.loading_address),
        s: common_vendor.o(($event) => copy(dealingData.value.loading_province + dealingData.value.loading_address))
      } : {}, {
        t: common_vendor.t(dealingData.value.plate_number),
        v: common_assets._imports_1$1,
        w: common_vendor.o(($event) => copy(dealingData.value.plate_number)),
        x: common_vendor.t(dealingData.value.truck_type),
        y: common_vendor.t(formatTime(dealingData.value.create_time)),
        z: dealingData.value.complete_time
      }, dealingData.value.complete_time ? {
        A: common_vendor.t(formatTime(dealingData.value.complete_time))
      } : {}, {
        B: dealingData.value.photo,
        C: common_vendor.o(($event) => viewImg(dealingData.value.photo)),
        D: dealingData.value.complete_photo
      }, dealingData.value.complete_photo ? {
        E: dealingData.value.complete_photo,
        F: common_vendor.o(($event) => viewImg(dealingData.value.complete_photo))
      } : {}, {
        G: common_vendor.o(submit)
      }) : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cd52b11d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/dealing.js.map
