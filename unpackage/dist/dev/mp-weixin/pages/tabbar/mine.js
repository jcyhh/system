"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
require("../../store/index.js");
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
  __name: "mine",
  setup(__props) {
    const appStore = store_modules_app.useAppStore();
    const { role, isLogin, userId } = common_vendor.storeToRefs(appStore);
    const handleLogin = async () => {
      if (isLogin.value) {
        return;
      }
      try {
        const loginRes = await common_vendor.index.login({
          provider: "weixin"
        });
        if (!loginRes.code) {
          common_vendor.index.showToast({
            title: "获取登录信息失败",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showLoading({
          title: "登录中..."
        });
        const userObj = common_vendor.tr.importObject("user");
        const res = await userObj.loginByWeixin({
          code: loginRes.code
        });
        common_vendor.index.hideLoading();
        if (res.errCode === 0) {
          appStore.setLoginInfo(res.data.userInfo, res.data.token);
          const roleName = res.data.userInfo.role === 1 ? "管理员" : "普通用户";
          common_vendor.index.showToast({
            title: `登录成功 (${roleName})`,
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "登录失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/tabbar/mine.vue:119", "登录失败", e);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      }
    };
    const goLog = (type) => {
      if (type == 0) {
        common_vendor.index.navigateTo({
          url: "/pages/mine/dealing"
        });
      } else if (type == 1) {
        common_vendor.index.navigateTo({
          url: "/pages/mine/waiting"
        });
      } else {
        common_vendor.index.navigateTo({
          url: "/pages/mine/finished"
        });
      }
    };
    const gorule = () => {
      common_vendor.index.navigateTo({
        url: "/pages/mine/rule"
      });
    };
    const copy = () => {
      common_vendor.index.setClipboardData({
        data: userId.value
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$2,
        b: common_vendor.t(common_vendor.unref(isLogin) ? common_vendor.unref(role) === 1 ? "管理员" : "用户" : "点击登录"),
        c: common_vendor.unref(isLogin)
      }, common_vendor.unref(isLogin) ? {
        d: common_vendor.t(common_vendor.unref(userId).slice(0, 8)),
        e: common_assets._imports_1$1,
        f: common_vendor.o(copy)
      } : {}, {
        g: common_vendor.o(handleLogin),
        h: common_vendor.unref(role) == 1
      }, common_vendor.unref(role) == 1 ? {
        i: common_assets._imports_2$2,
        j: common_vendor.o(($event) => goLog(0)),
        k: common_assets._imports_3$1,
        l: common_vendor.o(($event) => goLog(1)),
        m: common_assets._imports_4,
        n: common_vendor.o(($event) => goLog(2))
      } : {}, {
        o: common_assets._imports_5,
        p: common_vendor.p({
          type: "right",
          color: "#999999",
          size: 20
        }),
        q: common_assets._imports_6,
        r: common_vendor.p({
          type: "right",
          color: "#999999",
          size: 20
        }),
        s: common_vendor.o(gorule)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3a6ac8e1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/tabbar/mine.js.map
