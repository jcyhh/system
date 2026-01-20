"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "user",
  setup(__props) {
    const systemInfo = common_vendor.ref(null);
    const loadSystemInfo = async () => {
      try {
        const db = common_vendor.tr.database();
        const res = await db.collection("system_info").where({
          key: "user_agreement",
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
        common_vendor.index.__f__("error", "at pages/home/user.vue:40", "加载失败：", e);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    };
    common_vendor.onLoad(() => {
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
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e13bad76"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/user.js.map
