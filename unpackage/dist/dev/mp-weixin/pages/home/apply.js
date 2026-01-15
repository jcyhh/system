"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../store/index.js");
const store_modules_app = require("../../store/modules/app.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  (_easycom_uni_icons2 + _easycom_uni_data_picker2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_data_picker)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "apply",
  setup(__props) {
    const appStore = store_modules_app.useAppStore();
    const typeCur = common_vendor.ref(0);
    const types = [
      "依维柯",
      "3.8米",
      "4.2米",
      "7.6米",
      "9.6米",
      "13.5米",
      "17.5米及以上"
    ];
    const typesChange = (e) => {
      typeCur.value = e.detail.value;
      formData.value.truck_type = types[e.detail.value];
    };
    const cityRef = common_vendor.ref();
    const citys = common_vendor.ref([]);
    const cityName = common_vendor.computed(() => {
      if (citys.value.length > 0) {
        let str = [];
        citys.value.forEach((item) => {
          str.push(item.text);
        });
        return str.join("/");
      } else {
        return "";
      }
    });
    const onchange = (e) => {
      citys.value = e.detail.value;
      formData.value.loading_province = cityName.value;
    };
    const formData = common_vendor.ref({
      driver_name: "",
      phone: "",
      plate_number: "",
      truck_type: types[0],
      operation_type: 0,
      // 0-装车，1-卸车
      loading_province: "",
      loading_address: "",
      photo: ""
    });
    const currentTaskId = common_vendor.ref("");
    const isEditMode = common_vendor.computed(() => !!currentTaskId.value);
    const loadCurrentTask = async () => {
      if (!appStore.isLogin) {
        return;
      }
      try {
        const truckObj = common_vendor.tr.importObject("truck");
        const res = await truckObj.getCurrentTask();
        if (res.errCode === 0 && res.data) {
          const task = res.data;
          currentTaskId.value = task._id;
          formData.value = {
            driver_name: task.driver_name || "",
            phone: task.phone || "",
            plate_number: task.plate_number || "",
            truck_type: task.truck_type || types[0],
            operation_type: task.operation_type || 0,
            loading_province: task.loading_province || "",
            loading_address: task.loading_address || "",
            photo: task.photo || ""
          };
          const typeIndex = types.indexOf(task.truck_type);
          if (typeIndex !== -1) {
            typeCur.value = typeIndex;
          }
          if (task.loading_province) {
            const provinceArr = task.loading_province.split("/");
            citys.value = provinceArr.map((text) => ({ text }));
          }
        } else {
          currentTaskId.value = "";
          resetForm();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/apply.vue:179", "查询失败：", e);
      }
    };
    const resetForm = () => {
      formData.value = {
        driver_name: "",
        phone: "",
        plate_number: "",
        truck_type: types[0],
        operation_type: 0,
        loading_province: "",
        loading_address: "",
        photo: ""
      };
      typeCur.value = 0;
      citys.value = [];
    };
    common_vendor.onLoad(() => {
      loadCurrentTask();
    });
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          try {
            const uploadRes = await common_vendor.tr.uploadFile({
              filePath: tempFilePath,
              cloudPath: `trucks/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
            });
            formData.value.photo = uploadRes.fileID;
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
          } catch (e) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "上传失败",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at pages/home/apply.vue:237", "上传失败：", e);
          }
        }
      });
    };
    const deleteImage = () => {
      formData.value.photo = "";
    };
    const validate = () => {
      if (!formData.value.driver_name) {
        common_vendor.index.showToast({
          title: "请输入姓名",
          icon: "none"
        });
        return false;
      }
      if (!formData.value.phone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return false;
      }
      if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
        common_vendor.index.showToast({
          title: "手机号格式不正确",
          icon: "none"
        });
        return false;
      }
      if (!formData.value.plate_number) {
        common_vendor.index.showToast({
          title: "请输入车牌号",
          icon: "none"
        });
        return false;
      }
      if (!formData.value.truck_type) {
        common_vendor.index.showToast({
          title: "请选择车型",
          icon: "none"
        });
        return false;
      }
      if (formData.value.operation_type === 1) {
        if (!formData.value.loading_province) {
          common_vendor.index.showToast({
            title: "请选择装货省市区",
            icon: "none"
          });
          return false;
        }
        if (!formData.value.loading_address) {
          common_vendor.index.showToast({
            title: "请输入装货详细地址",
            icon: "none"
          });
          return false;
        }
      }
      if (!formData.value.photo) {
        common_vendor.index.showToast({
          title: "请上传照片",
          icon: "none"
        });
        return false;
      }
      return true;
    };
    const requestSubscribe = () => {
      return new Promise((resolve) => {
        const tmplIds = [
          "6dmIz67zTI9aE3PJCTrqK48vFvZOctRJDTnzFx0Wj2M",
          // 排队到号通知（提交申请时）
          "dKt-GXFHtyyoN_6Ag-ulck-eafezp1bQ6Sz95QCu6nM",
          // 排队进度通知（前面≤3人时）
          "7WbkjjD-w6tc28gX2Gn8-dWCQreta-M-Y5LltkXm3sk"
          // 排队成功提醒（变为处理中时）
        ];
        common_vendor.index.requestSubscribeMessage({
          tmplIds,
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/home/apply.vue:333", "订阅消息授权结果：", res);
            const acceptedTmpls = [];
            tmplIds.forEach((id) => {
              if (res[id] === "accept") {
                acceptedTmpls.push(id);
              }
            });
            resolve(acceptedTmpls);
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/home/apply.vue:344", "订阅消息授权失败：", err);
            resolve([]);
          }
        });
      });
    };
    const submit = async () => {
      if (!appStore.isLogin) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.switchTab({
                url: "/pages/tabbar/mine"
              });
            }
          }
        });
        return;
      }
      if (!validate()) {
        return;
      }
      let subscribedTmpls = [];
      if (!isEditMode.value) {
        subscribedTmpls = await requestSubscribe();
      }
      common_vendor.index.showLoading({
        title: isEditMode.value ? "修改中..." : "提交中..."
      });
      try {
        const truckObj = common_vendor.tr.importObject("truck");
        let res;
        if (isEditMode.value) {
          res = await truckObj.updateTask({
            id: currentTaskId.value,
            ...formData.value
          });
        } else {
          res = await truckObj.register({
            ...formData.value,
            subscribedTmpls
            // 传递用户授权的模板ID
          });
        }
        common_vendor.index.hideLoading();
        if (res.errCode === 0) {
          common_vendor.index.showModal({
            title: isEditMode.value ? "修改成功" : "登记成功",
            content: isEditMode.value ? "信息已更新" : "您已登记成功，请耐心等待",
            showCancel: false,
            success: () => {
              common_vendor.index.switchTab({
                url: "/pages/tabbar/home"
              });
            }
          });
        } else {
          if (res.errCode === 400 && res.errMsg.includes("已有")) {
            common_vendor.index.showModal({
              title: "提示",
              content: res.errMsg + "，是否前往查看？",
              confirmText: "去查看",
              success: (modalRes) => {
                if (modalRes.confirm) {
                  common_vendor.index.switchTab({
                    url: "/pages/tabbar/home"
                  });
                }
              }
            });
          } else {
            common_vendor.index.showToast({
              title: res.errMsg || (isEditMode.value ? "修改失败" : "登记失败"),
              icon: "none",
              duration: 2e3
            });
          }
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: e.message || "提交失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/home/apply.vue:449", "提交失败：", e);
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: formData.value.driver_name,
        b: common_vendor.o(($event) => formData.value.driver_name = $event.detail.value),
        c: formData.value.phone,
        d: common_vendor.o(($event) => formData.value.phone = $event.detail.value),
        e: formData.value.plate_number,
        f: common_vendor.o(($event) => formData.value.plate_number = $event.detail.value),
        g: common_vendor.t(types[typeCur.value]),
        h: common_vendor.p({
          type: "down",
          size: 20,
          color: "#999999"
        }),
        i: common_vendor.o(typesChange),
        j: typeCur.value,
        k: types,
        l: formData.value.operation_type == 0
      }, formData.value.operation_type == 0 ? {
        m: common_vendor.p({
          type: "checkbox-filled",
          size: 30,
          color: "#29156a"
        })
      } : {
        n: common_vendor.p({
          type: "circle",
          size: 30,
          color: "#999999"
        })
      }, {
        o: common_vendor.n(formData.value.operation_type == 0 ? "main" : ""),
        p: common_vendor.o(($event) => formData.value.operation_type = 0),
        q: formData.value.operation_type == 1
      }, formData.value.operation_type == 1 ? {
        r: common_vendor.p({
          type: "checkbox-filled",
          size: 30,
          color: "#29156a"
        })
      } : {
        s: common_vendor.p({
          type: "circle",
          size: 30,
          color: "#999999"
        })
      }, {
        t: common_vendor.n(formData.value.operation_type == 1 ? "main" : ""),
        v: common_vendor.o(($event) => formData.value.operation_type = 1),
        w: formData.value.operation_type == 1
      }, formData.value.operation_type == 1 ? common_vendor.e({
        x: cityName.value
      }, cityName.value ? {
        y: common_vendor.t(cityName.value)
      } : {}, {
        z: common_vendor.p({
          type: "down",
          size: 20,
          color: "#999999"
        }),
        A: common_vendor.o(($event) => {
          var _a;
          return (_a = cityRef.value) == null ? void 0 : _a.show();
        }),
        B: formData.value.loading_address,
        C: common_vendor.o(($event) => formData.value.loading_address = $event.detail.value)
      }) : {}, {
        D: !formData.value.photo
      }, !formData.value.photo ? {
        E: common_vendor.p({
          type: "plusempty",
          size: 50,
          color: "#999999"
        }),
        F: common_vendor.o(chooseImage)
      } : {
        G: formData.value.photo,
        H: common_vendor.p({
          type: "closeempty",
          size: 20,
          color: "#FFFFFF"
        }),
        I: common_vendor.o(deleteImage)
      }, {
        J: common_vendor.t(isEditMode.value ? "保存修改" : "提交排队"),
        K: common_vendor.o(submit),
        L: common_vendor.sr(cityRef, "5fa7e9e6-8", {
          "k": "cityRef"
        }),
        M: common_vendor.o(onchange),
        N: common_vendor.p({
          placeholder: "请选择地址",
          ["popup-title"]: "请选择城市",
          collection: "opendb-city-china",
          field: "code as value, name as text",
          orderby: "value asc",
          ["step-searh"]: true,
          ["self-field"]: "code",
          ["parent-field"]: "parent_code"
        })
      });
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/apply.js.map
