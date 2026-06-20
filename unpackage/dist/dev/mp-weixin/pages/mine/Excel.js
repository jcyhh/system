"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_loading = require("../../utils/loading.js");
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
  __name: "Excel",
  emits: ["submit"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const popupRef = common_vendor.ref();
    const startTime = common_vendor.ref();
    const startChange = (e) => startTime.value = e.detail.value;
    const endTime = common_vendor.ref();
    const endChange = (e) => endTime.value = e.detail.value;
    const open = () => {
      var _a;
      return (_a = popupRef.value) == null ? void 0 : _a.open();
    };
    const reset = () => {
      var _a;
      (_a = popupRef.value) == null ? void 0 : _a.close();
    };
    const submit = async () => {
      if (!startTime.value || !endTime.value) {
        common_vendor.index.showToast({
          title: "请选择完整的时间区间",
          icon: "none"
        });
        return;
      }
      if (new Date(startTime.value) > new Date(endTime.value)) {
        common_vendor.index.showToast({
          title: "开始日期不能晚于结束日期",
          icon: "none"
        });
        return;
      }
      try {
        utils_loading.showDelayedLoading({ title: "导出中..." });
        const start_time = (/* @__PURE__ */ new Date(startTime.value.replace(/-/g, "/") + " 08:00:00")).getTime();
        const end_time = (/* @__PURE__ */ new Date(endTime.value.replace(/-/g, "/") + " 08:00:00")).getTime();
        const truckObj = common_vendor._r.importObject("truck");
        const res = await truckObj.exportExcel({
          start_time,
          end_time
        });
        utils_loading.hideDelayedLoading();
        if (res.errCode === 0) {
          const downloadRes = await common_vendor.index.downloadFile({
            url: res.data.fileUrl
          });
          if (downloadRes.statusCode === 200) {
            common_vendor.index.shareFileMessage({
              filePath: downloadRes.tempFilePath,
              fileName: res.data.fileName || `已完成单子_${startTime.value}_${endTime.value}.xlsx`,
              success: () => {
                var _a;
                common_vendor.index.showToast({
                  title: "分享成功",
                  icon: "success"
                });
                (_a = popupRef.value) == null ? void 0 : _a.close();
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/mine/Excel.vue:113", "分享失败：", err);
                common_vendor.index.showToast({
                  title: "分享失败",
                  icon: "none"
                });
              }
            });
          } else {
            common_vendor.index.showToast({
              title: "文件下载失败",
              icon: "none"
            });
          }
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "导出失败",
            icon: "none"
          });
        }
      } catch (e) {
        utils_loading.hideDelayedLoading();
        common_vendor.index.__f__("error", "at pages/mine/Excel.vue:142", "导出失败：", e);
        common_vendor.index.showToast({
          title: e.message || "导出失败",
          icon: "none"
        });
      }
    };
    __expose({
      open
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "closeempty",
          color: "#FFFFFF",
          size: 25
        }),
        b: common_vendor.o(($event) => {
          var _a;
          return (_a = popupRef.value) == null ? void 0 : _a.close();
        }, "9d"),
        c: common_vendor.p({
          type: "closeempty",
          size: 25
        }),
        d: startTime.value
      }, startTime.value ? {
        e: common_vendor.t(startTime.value)
      } : {}, {
        f: startTime.value,
        g: common_vendor.o(startChange, "31"),
        h: endTime.value
      }, endTime.value ? {
        i: common_vendor.t(endTime.value)
      } : {}, {
        j: endTime.value,
        k: common_vendor.o(endChange, "63"),
        l: common_vendor.o(reset, "a9"),
        m: common_vendor.o(submit, "a1"),
        n: common_vendor.sr(popupRef, "93e05dfa-0", {
          "k": "popupRef"
        }),
        o: common_vendor.p({
          type: "center"
        })
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-93e05dfa"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/Excel.js.map
