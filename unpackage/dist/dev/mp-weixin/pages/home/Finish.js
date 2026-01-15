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
  __name: "Finish",
  setup(__props, { expose: __expose }) {
    const popupRef = common_vendor.ref();
    const photoUrl = common_vendor.ref("");
    const taskId = common_vendor.ref("");
    const open = (id) => {
      var _a;
      taskId.value = id || "";
      photoUrl.value = "";
      (_a = popupRef.value) == null ? void 0 : _a.open();
    };
    const close = () => {
      var _a;
      (_a = popupRef.value) == null ? void 0 : _a.close();
      photoUrl.value = "";
      taskId.value = "";
    };
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          try {
            const uploadRes = await common_vendor.tr.uploadFile({
              filePath: tempFilePath,
              cloudPath: `trucks/complete_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
            });
            photoUrl.value = uploadRes.fileID;
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
          } catch (e) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "上传失败",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at pages/home/Finish.vue:85", "上传失败：", e);
          }
        }
      });
    };
    const deleteImage = () => {
      photoUrl.value = "";
    };
    const submit = async () => {
      if (!photoUrl.value) {
        common_vendor.index.showToast({
          title: "请先上传照片",
          icon: "none"
        });
        return;
      }
      if (!taskId.value) {
        common_vendor.index.showToast({
          title: "任务ID不存在",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      try {
        const truckObj = common_vendor.tr.importObject("truck");
        const res = await truckObj.complete({
          id: taskId.value,
          complete_photo: photoUrl.value
        });
        common_vendor.index.hideLoading();
        if (res.errCode === 0) {
          common_vendor.index.showToast({
            title: "操作成功",
            icon: "success"
          });
          close();
          common_vendor.index.$emit("refreshHome");
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "操作失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: e.message || "提交失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/home/Finish.vue:150", "提交失败：", e);
      }
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "closeempty",
          color: "#FFFFFF",
          size: 25
        }),
        b: common_vendor.o(($event) => close()),
        c: common_vendor.p({
          type: "closeempty",
          size: 25
        }),
        d: !photoUrl.value
      }, !photoUrl.value ? {
        e: common_vendor.p({
          type: "plusempty",
          size: 50,
          color: "#999999"
        }),
        f: common_vendor.o(chooseImage)
      } : {
        g: photoUrl.value,
        h: common_vendor.p({
          type: "closeempty",
          size: 20,
          color: "#FFFFFF"
        }),
        i: common_vendor.o(deleteImage)
      }, {
        j: common_vendor.o(submit),
        k: !photoUrl.value ? 1 : "",
        l: common_vendor.sr(popupRef, "8d1dbdbc-0", {
          "k": "popupRef"
        }),
        m: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        })
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8d1dbdbc"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/Finish.js.map
