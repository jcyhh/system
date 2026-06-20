"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../store/index.js");
const store_modules_app = require("../../store/modules/app.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "admin-rule",
  setup(__props) {
    const appStore = store_modules_app.useAppStore();
    const systemInfo = common_vendor.ref(null);
    const loadSystemInfo = async () => {
      try {
        const db = common_vendor._r.database();
        const res = await db.collection("system_info").where({
          key: "admin_operation_guide",
          is_published: true
        }).limit(1).get();
        if (res.result && res.result.data && res.result.data.length > 0) {
          systemInfo.value = res.result.data[0];
        } else {
          common_vendor.index.showToast({
            title: "暂无内容",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/admin-rule.vue:41", "加载失败：", e);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    };
    common_vendor.onLoad(() => {
      if (appStore.role !== 1) {
        common_vendor.index.showToast({
          title: "无权限访问",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 800);
        return;
      }
      loadSystemInfo();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: systemInfo.value
      }, systemInfo.value ? {
        b: common_vendor.t(systemInfo.value.title),
        c: systemInfo.value.content
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8c68bcda"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/admin-rule.js.map
