"use strict";
const common_vendor = require("../common/vendor.js");
let timer = null;
let loadingCount = 0;
let isShowing = false;
const DEFAULT_DELAY = 500;
const showDelayedLoading = (options = {}, delay = DEFAULT_DELAY) => {
  loadingCount++;
  if (isShowing || timer)
    return;
  timer = setTimeout(() => {
    timer = null;
    if (loadingCount <= 0)
      return;
    isShowing = true;
    common_vendor.index.showLoading({
      title: options.title || "加载中...",
      mask: options.mask ?? true
    });
  }, delay);
};
const hideDelayedLoading = () => {
  if (loadingCount > 0) {
    loadingCount--;
  }
  if (loadingCount > 0)
    return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (isShowing) {
    isShowing = false;
    common_vendor.index.hideLoading();
  }
};
exports.hideDelayedLoading = hideDelayedLoading;
exports.showDelayedLoading = showDelayedLoading;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/loading.js.map
