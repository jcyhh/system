"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + Filter + Excel)();
}
const Filter = () => "./Filter.js";
const Excel = () => "./Excel.js";
const pageSize = 20;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "finished",
  setup(__props) {
    const filterRef = common_vendor.ref();
    const excelRef = common_vendor.ref();
    const finishedList = common_vendor.ref([]);
    const tags = common_vendor.ref([]);
    const params = common_vendor.ref({});
    const page = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const loadFinishedList = async (isRefresh = false) => {
      if (isLoading.value)
        return;
      if (!hasMore.value && !isRefresh)
        return;
      try {
        isLoading.value = true;
        if (isRefresh) {
          page.value = 1;
          hasMore.value = true;
        }
        const truckObj = common_vendor.tr.importObject("truck");
        const res = await truckObj.getFinishedList({
          page: page.value,
          pageSize,
          ...params.value
        });
        if (res.errCode === 0) {
          if (isRefresh) {
            finishedList.value = res.data.list;
          } else {
            finishedList.value = [...finishedList.value, ...res.data.list];
          }
          if (res.data.list.length < pageSize) {
            hasMore.value = false;
          }
          if (res.data.list.length > 0) {
            page.value++;
          }
        } else {
          common_vendor.index.showToast({
            title: res.errMsg || "获取失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/finished.vue:121", "获取失败：", e);
        common_vendor.index.showToast({
          title: e.message || "获取失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const onFilter = (data) => {
      tags.value = data.tags;
      const filterParams = {};
      if (data.params.carType !== void 0) {
        const typesList = ["依维柯", "3.8米", "4.2米", "7.6米", "9.6米", "13.5米", "17.5米及以上"];
        filterParams.truck_type = typesList[data.params.carType];
      }
      if (data.params.type !== void 0) {
        filterParams.operation_type = data.params.type;
      }
      if (data.params.startTime && data.params.endTime) {
        filterParams.start_time = (/* @__PURE__ */ new Date(data.params.startTime.replace(/-/g, "/") + " 00:00:00")).getTime();
        filterParams.end_time = (/* @__PURE__ */ new Date(data.params.endTime.replace(/-/g, "/") + " 23:59:59")).getTime();
      }
      if (data.params.cardNo) {
        filterParams.plate_number = data.params.cardNo;
      }
      if (data.params.phoneNo) {
        filterParams.phone = data.params.phoneNo;
      }
      if (data.params.name) {
        filterParams.driver_name = data.params.name;
      }
      params.value = filterParams;
      loadFinishedList(true);
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hour}:${minute}`;
    };
    const goDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/mine/detail?id=${item._id}`
      });
    };
    const exportExcel = () => {
      var _a;
      (_a = excelRef.value) == null ? void 0 : _a.open();
    };
    common_vendor.onLoad(() => {
      loadFinishedList(true);
    });
    common_vendor.onPullDownRefresh(async () => {
      try {
        await loadFinishedList(true);
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/finished.vue:211", "刷新失败：", e);
      } finally {
        common_vendor.index.stopPullDownRefresh();
      }
    });
    common_vendor.onReachBottom(() => {
      loadFinishedList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: tags.value.length > 0
      }, tags.value.length > 0 ? {
        b: common_vendor.f(tags.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        })
      } : {}, {
        c: common_vendor.p({
          type: "search",
          color: "#FFFFFF",
          size: 35
        }),
        d: common_vendor.o(($event) => {
          var _a;
          return (_a = filterRef.value) == null ? void 0 : _a.open();
        }),
        e: common_vendor.p({
          type: "redo-filled",
          color: "#FFFFFF",
          size: 35
        }),
        f: common_vendor.o(exportExcel),
        g: common_vendor.f(finishedList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.driver_name),
            b: common_vendor.t(item.plate_number),
            c: common_vendor.t(item.phone),
            d: common_vendor.t(formatTime(item.create_time)),
            e: common_vendor.t(formatTime(item.complete_time)),
            f: item._id,
            g: common_vendor.o(($event) => goDetail(item), item._id)
          };
        }),
        h: common_assets._imports_0$2,
        i: finishedList.value.length === 0 && !isLoading.value
      }, finishedList.value.length === 0 && !isLoading.value ? {
        j: common_assets._imports_0
      } : {}, {
        k: isLoading.value
      }, isLoading.value ? {} : !hasMore.value && finishedList.value.length > 0 ? {} : {}, {
        l: !hasMore.value && finishedList.value.length > 0,
        m: common_vendor.sr(filterRef, "d9e2002d-2", {
          "k": "filterRef"
        }),
        n: common_vendor.o(onFilter),
        o: common_vendor.sr(excelRef, "d9e2002d-3", {
          "k": "excelRef"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d9e2002d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/finished.js.map
