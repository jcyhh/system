"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "edit",
  setup(__props) {
    const isEdit = common_vendor.ref(false);
    const noticeId = common_vendor.ref("");
    const formData = common_vendor.ref({
      title: "",
      content: "",
      is_published: true,
      is_popup: false
    });
    const onPublishChange = (e) => {
      formData.value.is_published = e.detail.value;
    };
    const onPopupChange = (e) => {
      formData.value.is_popup = e.detail.value;
    };
    const loadNoticeDetail = async (id) => {
      try {
        const noticeObj = common_vendor.tr.importObject("notice");
        const res = await noticeObj.getDetail({ id });
        if (res.errCode === 0) {
          formData.value = {
            title: res.data.title,
            content: res.data.content,
            is_published: res.data.is_published,
            is_popup: res.data.is_popup || false
          };
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "获取失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/notice/edit.vue:74", "获取公告详情失败：", e);
        common_vendor.index.showToast({
          title: e.message || "获取失败",
          icon: "none"
        });
      }
    };
    const submitForm = async () => {
      if (!formData.value.title.trim()) {
        common_vendor.index.showToast({
          title: "请输入公告标题",
          icon: "none"
        });
        return;
      }
      if (!formData.value.content.trim()) {
        common_vendor.index.showToast({
          title: "请输入公告内容",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: isEdit.value ? "保存中..." : "创建中..."
        });
        const noticeObj = common_vendor.tr.importObject("notice");
        let result;
        if (isEdit.value) {
          result = await noticeObj.update({
            id: noticeId.value,
            title: formData.value.title.trim(),
            content: formData.value.content.trim(),
            is_published: formData.value.is_published,
            is_popup: formData.value.is_popup
          });
        } else {
          result = await noticeObj.create({
            title: formData.value.title.trim(),
            content: formData.value.content.trim(),
            is_published: formData.value.is_published,
            is_popup: formData.value.is_popup
          });
        }
        common_vendor.index.hideLoading();
        if (result.errCode === 0) {
          common_vendor.index.showToast({
            title: isEdit.value ? "保存成功" : "创建成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            common_vendor.index.navigateBack({
              delta: 1
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: result.errMsg || "操作失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/notice/edit.vue:151", "操作失败：", e);
        common_vendor.index.showToast({
          title: e.message || "操作失败",
          icon: "none"
        });
      }
    };
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.id) {
        isEdit.value = true;
        noticeId.value = options.id;
        loadNoticeDetail(options.id);
        common_vendor.index.setNavigationBarTitle({
          title: "编辑公告"
        });
      } else {
        common_vendor.index.setNavigationBarTitle({
          title: "添加公告"
        });
      }
    });
    return (_ctx, _cache) => {
      return {
        a: formData.value.title,
        b: common_vendor.o(($event) => formData.value.title = $event.detail.value),
        c: -1,
        d: formData.value.content,
        e: common_vendor.o(($event) => formData.value.content = $event.detail.value),
        f: formData.value.is_published,
        g: common_vendor.o(onPublishChange),
        h: formData.value.is_popup,
        i: common_vendor.o(onPopupChange),
        j: common_vendor.t(isEdit.value ? "保存修改" : "创建公告"),
        k: common_vendor.o(submitForm)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-01bb81d1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notice/edit.js.map
