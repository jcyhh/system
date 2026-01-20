"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_index = require("./store/index.js");
const store_modules_app = require("./store/modules/app.js");
if (!Math) {
  "./pages/tabbar/home.js";
  "./pages/tabbar/mine.js";
  "./pages/home/apply.js";
  "./pages/mine/dealing.js";
  "./pages/mine/waiting.js";
  "./pages/mine/finished.js";
  "./pages/mine/detail.js";
  "./pages/mine/rule.js";
  "./pages/notice/list.js";
  "./pages/notice/detail.js";
  "./pages/notice/edit.js";
  "./pages/home/user.js";
  "./pages/home/private.js";
  "./pages/mine/system.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:6", "App Launch");
    const appStore = store_modules_app.useAppStore();
    appStore.restoreLoginState();
    this.checkToken();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:16", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:19", "App Hide");
  },
  methods: {
    async checkToken() {
      const appStore = store_modules_app.useAppStore();
      if (!appStore.token) {
        return;
      }
      try {
        const userObj = common_vendor.tr.importObject("user");
        const res = await userObj.getUserInfo();
        if (res.errCode === 0) {
          appStore.setLoginInfo(res.data, appStore.token);
          common_vendor.index.__f__("log", "at App.vue:36", "登录状态有效，角色：", res.data.role === 1 ? "管理员" : "普通用户");
        } else {
          appStore.clearLoginInfo();
          common_vendor.index.__f__("log", "at App.vue:40", "登录已过期");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at App.vue:43", "验证登录状态失败", e);
        appStore.clearLoginInfo();
      }
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  store_index.setupStore(app);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
