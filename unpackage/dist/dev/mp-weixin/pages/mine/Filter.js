"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "Filter",
  emits: ["submit"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emits = __emit;
    const popupRef = common_vendor.ref();
    const typeCur = common_vendor.ref(0);
    const types = [
      "全部",
      "依维柯",
      "3.8米",
      "4.2米",
      "7.6米",
      "9.6米",
      "13.5米",
      "17.5米及以上"
    ];
    const typesChange = (e) => typeCur.value = e.detail.value;
    const cur = common_vendor.ref(0);
    const kinds = [
      "全部",
      "装车",
      "卸车"
    ];
    const kindsChange = (e) => cur.value = e.detail.value;
    const startTime = common_vendor.ref();
    const startChange = (e) => startTime.value = e.detail.value;
    const endTime = common_vendor.ref();
    const endChange = (e) => endTime.value = e.detail.value;
    const carNo = common_vendor.ref();
    const phoneNo = common_vendor.ref();
    const name = common_vendor.ref();
    const open = () => {
      var _a;
      return (_a = popupRef.value) == null ? void 0 : _a.open();
    };
    const reset = () => {
      var _a;
      typeCur.value = 0;
      cur.value = 0;
      startTime.value = "";
      endTime.value = "";
      carNo.value = "";
      phoneNo.value = "";
      name.value = "";
      emits("submit", {
        tags: [],
        params: {}
      });
      (_a = popupRef.value) == null ? void 0 : _a.close();
    };
    const submit = () => {
      var _a;
      let arr = [];
      let obj = {};
      if (typeCur.value > 0) {
        arr.push(types[typeCur.value]);
        obj["carType"] = typeCur.value - 1;
      }
      if (cur.value > 0) {
        arr.push(kinds[cur.value]);
        obj["type"] = cur.value - 1;
      }
      if (startTime.value && endTime.value) {
        arr.push(`${startTime.value} ~ ${endTime.value}`);
        obj["startTime"] = startTime.value;
        obj["endTime"] = endTime.value;
      }
      if (carNo.value) {
        arr.push(carNo.value);
        obj["cardNo"] = carNo.value;
      }
      if (phoneNo.value) {
        arr.push(phoneNo.value);
        obj["phoneNo"] = phoneNo.value;
      }
      if (name.value) {
        arr.push(name.value);
        obj["name"] = name.value;
      }
      emits("submit", {
        tags: arr,
        params: obj
      });
      (_a = popupRef.value) == null ? void 0 : _a.close();
    };
    __expose({
      open
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "closeempty",
          color: "#FFFFFF",
          size: 25
        }),
        b: common_vendor.o(($event) => {
          var _a;
          return (_a = popupRef.value) == null ? void 0 : _a.close();
        }),
        c: common_vendor.p({
          type: "closeempty",
          size: 25
        }),
        d: common_vendor.t(types[typeCur.value]),
        e: common_vendor.p({
          type: "down",
          size: 20,
          color: "#999999"
        }),
        f: common_vendor.o(typesChange),
        g: typeCur.value,
        h: types,
        i: common_vendor.t(kinds[cur.value]),
        j: common_vendor.p({
          type: "down",
          size: 20,
          color: "#999999"
        }),
        k: common_vendor.o(kindsChange),
        l: cur.value,
        m: kinds,
        n: startTime.value
      }, startTime.value ? {
        o: common_vendor.t(startTime.value)
      } : {}, {
        p: startTime.value,
        q: common_vendor.o(startChange),
        r: endTime.value
      }, endTime.value ? {
        s: common_vendor.t(endTime.value)
      } : {}, {
        t: endTime.value,
        v: common_vendor.o(endChange),
        w: common_vendor.p({
          type: "search",
          size: 20,
          color: "#666666"
        }),
        x: carNo.value,
        y: common_vendor.o(($event) => carNo.value = $event.detail.value),
        z: common_vendor.p({
          type: "search",
          size: 20,
          color: "#666666"
        }),
        A: phoneNo.value,
        B: common_vendor.o(($event) => phoneNo.value = $event.detail.value),
        C: common_vendor.p({
          type: "search",
          size: 20,
          color: "#666666"
        }),
        D: name.value,
        E: common_vendor.o(($event) => name.value = $event.detail.value),
        F: common_vendor.o(reset),
        G: common_vendor.o(submit),
        H: common_vendor.sr(popupRef, "a642fc99-0", {
          "k": "popupRef"
        }),
        I: common_vendor.p({
          type: "center"
        })
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a642fc99"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/Filter.js.map
