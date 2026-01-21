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
const _sfc_defineComponent = common_vendor.defineComponent({
  __name: "mine",
  setup(__props) {
    common_vendor.onShareAppMessage(() => {
      return {
        title: "点击登记排队",
        path: "/pages/tabbar/home"
      };
    });
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
          const roleName = res.data.userInfo.role === 1 ? "(管理员)" : "";
          common_vendor.index.showToast({
            title: `登录成功${roleName}`,
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
        common_vendor.index.__f__("error", "at pages/tabbar/mine.vue:171", "登录失败", e);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      }
    };
    const goSystem = () => {
      common_vendor.index.navigateTo({
        url: "/pages/mine/system"
      });
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
    const showDialog = common_vendor.ref(false);
    const targetUserId = common_vendor.ref("");
    const showAddAdminDialog = () => {
      showDialog.value = true;
      targetUserId.value = "";
    };
    const closeDialog = () => {
      showDialog.value = false;
      targetUserId.value = "";
    };
    const confirmAddAdmin = async () => {
      const userId2 = targetUserId.value.trim();
      if (!userId2) {
        common_vendor.index.showToast({
          title: "请输入用户ID",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "设置中..."
      });
      try {
        const userObj = common_vendor.tr.importObject("user");
        const res = await userObj.setUserRole({
          userId: userId2,
          role: 1
          // 1=管理员
        });
        common_vendor.index.hideLoading();
        if (res.errCode === 0) {
          common_vendor.index.showToast({
            title: "已添加为管理员",
            icon: "success"
          });
          closeDialog();
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "设置失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/tabbar/mine.vue:268", "设置管理员失败", e);
        common_vendor.index.showToast({
          title: e.message || "设置失败，请重试",
          icon: "none"
        });
      }
    };
    const confirmRemoveAdmin = async () => {
      const targetId = targetUserId.value.trim();
      if (!targetId) {
        common_vendor.index.showToast({
          title: "请输入用户ID",
          icon: "none"
        });
        return;
      }
      const isSelf = targetId === userId.value;
      const confirmContent = isSelf ? "确定要移除自己的管理员权限吗？移除后将无法管理其他用户。" : "确定要移除该用户的管理员权限吗？";
      common_vendor.index.showModal({
        title: "确认移除",
        content: confirmContent,
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "移除中..."
            });
            try {
              const userObj = common_vendor.tr.importObject("user");
              const result = await userObj.setUserRole({
                userId: targetId,
                role: 0
                // 0=普通用户
              });
              common_vendor.index.hideLoading();
              if (result.errCode === 0) {
                closeDialog();
                if (isSelf) {
                  common_vendor.index.__f__("log", "at pages/tabbar/mine.vue:318", "移除了自己的管理员权限，更新本地状态");
                  appStore.setRole(0);
                  common_vendor.index.showToast({
                    title: "已移除管理员权限，页面已更新",
                    icon: "success",
                    duration: 2e3
                  });
                  setTimeout(async () => {
                    try {
                      const userObj2 = common_vendor.tr.importObject("user");
                      const userInfo = await userObj2.getUserInfo();
                      if (userInfo.errCode === 0) {
                        appStore.setRole(userInfo.data.role);
                      }
                    } catch (e) {
                      common_vendor.index.__f__("error", "at pages/tabbar/mine.vue:337", "刷新用户信息失败", e);
                    }
                  }, 500);
                } else {
                  common_vendor.index.showToast({
                    title: "已移除管理员权限",
                    icon: "success"
                  });
                }
              } else {
                common_vendor.index.showToast({
                  title: result.errMsg || "移除失败",
                  icon: "none"
                });
              }
            } catch (e) {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/tabbar/mine.vue:354", "移除管理员失败", e);
              common_vendor.index.showToast({
                title: e.message || "移除失败，请重试",
                icon: "none"
              });
            }
          }
        }
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
        o: common_vendor.unref(role) === 1
      }, common_vendor.unref(role) === 1 ? {
        p: common_vendor.p({
          type: "personadd",
          color: "#29156a",
          size: 22
        }),
        q: common_vendor.p({
          type: "right",
          color: "#999999",
          size: 20
        }),
        r: common_vendor.o(showAddAdminDialog)
      } : {}, {
        s: common_vendor.unref(role) === 1
      }, common_vendor.unref(role) === 1 ? {
        t: common_vendor.p({
          type: "settings",
          color: "#29156a",
          size: 22
        }),
        v: common_vendor.p({
          type: "right",
          color: "#999999",
          size: 20
        }),
        w: common_vendor.o(goSystem)
      } : {}, {
        x: common_assets._imports_5,
        y: common_vendor.p({
          type: "right",
          color: "#999999",
          size: 20
        }),
        z: common_assets._imports_6,
        A: common_vendor.p({
          type: "right",
          color: "#999999",
          size: 20
        }),
        B: common_vendor.o(gorule),
        C: showDialog.value
      }, showDialog.value ? {
        D: common_vendor.p({
          type: "closeempty",
          size: 24,
          color: "#999999"
        }),
        E: common_vendor.o(closeDialog),
        F: targetUserId.value,
        G: common_vendor.o(($event) => targetUserId.value = $event.detail.value),
        H: common_vendor.o(confirmRemoveAdmin),
        I: common_vendor.o(confirmAddAdmin),
        J: common_vendor.o(() => {
        }),
        K: common_vendor.o(closeDialog)
      } : {});
    };
  }
});
_sfc_defineComponent.__runtimeHooks = 2;
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_defineComponent, [["__scopeId", "data-v-3a6ac8e1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/tabbar/mine.js.map
