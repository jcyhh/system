"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../store/index.js");
const store_modules_app = require("../../store/modules/app.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "system",
  setup(__props) {
    const appStore = store_modules_app.useAppStore();
    const queueSwitch = common_vendor.ref(true);
    const switchId = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    const loadQueueSwitch = async () => {
      try {
        const db = common_vendor.tr.database();
        const res = await db.collection("system_info").where({
          key: "queue_switch"
        }).limit(1).get();
        if (res.result && res.result.data && res.result.data.length > 0) {
          const data = res.result.data[0];
          switchId.value = data._id;
          queueSwitch.value = data.content === "true";
        } else {
          common_vendor.index.showModal({
            title: "提示",
            content: "未找到排队开关配置，请先在数据库中添加 queue_switch 配置",
            showCancel: false
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/system.vue:72", "加载排队开关失败：", e);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    };
    const onSwitchChange = (e) => {
      const newValue = e.detail.value;
      common_vendor.index.showModal({
        title: "确认操作",
        content: `确定要${newValue ? "开启" : "关闭"}排队功能吗？`,
        success: async (res) => {
          if (res.confirm) {
            await updateQueueSwitch(newValue);
          }
        }
      });
    };
    const updateQueueSwitch = async (value) => {
      if (!switchId.value) {
        common_vendor.index.showToast({
          title: "配置ID不存在",
          icon: "none"
        });
        return;
      }
      loading.value = true;
      common_vendor.index.showLoading({
        title: "保存中..."
      });
      try {
        const db = common_vendor.tr.database();
        await db.collection("system_info").doc(switchId.value).update({
          content: value ? "true" : "false",
          update_time: Date.now()
        });
        queueSwitch.value = value;
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: value ? "已开启排队" : "已关闭排队",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/system.vue:126", "更新排队开关失败：", e);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const checkAdmin = () => {
      if (appStore.role !== 1) {
        common_vendor.index.showModal({
          title: "权限不足",
          content: "仅管理员可以访问此页面",
          showCancel: false,
          success: () => {
            common_vendor.index.navigateBack();
          }
        });
        return false;
      }
      return true;
    };
    common_vendor.onLoad(() => {
      if (checkAdmin()) {
        loadQueueSwitch();
      }
    });
    common_vendor.onShow(() => {
      if (checkAdmin()) {
        loadQueueSwitch();
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(queueSwitch.value ? "已开启" : "已关闭"),
        b: common_vendor.n(queueSwitch.value ? "status-on" : "status-off"),
        c: queueSwitch.value,
        d: common_vendor.o(onSwitchChange),
        e: loading.value
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6fc5556f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/system.js.map
