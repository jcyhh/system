"use strict";
const common_vendor = require("../../common/vendor.js");
const useAppStore = common_vendor.defineStore("app", () => {
  const role = common_vendor.ref(0);
  const isLogin = common_vendor.ref(false);
  const userId = common_vendor.ref("");
  const token = common_vendor.ref("");
  const setLoginInfo = (info, tokenStr) => {
    isLogin.value = true;
    userId.value = info._id || info.uid || "";
    role.value = info.role || 0;
    token.value = tokenStr;
    common_vendor.index.setStorageSync("uni_id_token", tokenStr);
    common_vendor.index.setStorageSync("userId", userId.value);
    common_vendor.index.setStorageSync("role", role.value);
  };
  const clearLoginInfo = () => {
    isLogin.value = false;
    userId.value = "";
    role.value = 0;
    token.value = "";
    common_vendor.index.removeStorageSync("uni_id_token");
    common_vendor.index.removeStorageSync("userId");
    common_vendor.index.removeStorageSync("role");
  };
  const restoreLoginState = () => {
    const savedToken = common_vendor.index.getStorageSync("uni_id_token");
    const savedUserId = common_vendor.index.getStorageSync("userId");
    const savedRole = common_vendor.index.getStorageSync("role");
    if (savedToken && savedUserId) {
      isLogin.value = true;
      token.value = savedToken;
      userId.value = savedUserId;
      role.value = savedRole || 0;
    }
  };
  const setRole = (newRole) => {
    role.value = newRole;
    common_vendor.index.setStorageSync("role", newRole);
  };
  return {
    role,
    isLogin,
    userId,
    token,
    setLoginInfo,
    clearLoginInfo,
    restoreLoginState,
    setRole
  };
});
exports.useAppStore = useAppStore;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/store/modules/app.js.map
