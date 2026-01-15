"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "Popup",
  setup(__props, { expose: __expose }) {
    const popupRef = common_vendor.ref();
    const noticeData = common_vendor.ref(null);
    const open = (data) => {
      var _a;
      noticeData.value = data;
      (_a = popupRef.value) == null ? void 0 : _a.open();
    };
    const close = () => {
      var _a;
      (_a = popupRef.value) == null ? void 0 : _a.close();
    };
    const submit = async () => {
      var _a;
      if (!((_a = noticeData.value) == null ? void 0 : _a._id)) {
        close();
        return;
      }
      try {
        const noticeObj = common_vendor.tr.importObject("notice");
        const res = await noticeObj.markPopupAsRead({
          noticeId: noticeData.value._id
        });
        if (res.errCode === 0) {
          close();
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "操作失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/Popup.vue:56", "标记已读失败：", e);
        common_vendor.index.showToast({
          title: e.message || "操作失败",
          icon: "none"
        });
      }
    };
    __expose({
      open
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return {
        a: common_vendor.p({
          type: "closeempty",
          color: "#FFFFFF",
          size: 25
        }),
        b: common_vendor.t(((_a = noticeData.value) == null ? void 0 : _a.title) || "公告"),
        c: common_vendor.o(($event) => close()),
        d: common_vendor.p({
          type: "closeempty",
          size: 25
        }),
        e: (_b = noticeData.value) == null ? void 0 : _b.content,
        f: common_vendor.o(submit),
        g: common_vendor.sr(popupRef, "76b2c95b-0", {
          "k": "popupRef"
        }),
        h: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        })
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-76b2c95b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/Popup.js.map
