<template>
	<view class="pl30 pr30 pt30">
		
		<view class="size30 mb20">姓名</view>
		<view class="card flex">
			<input type="text" v-model="formData.driver_name" placeholder="请输入姓名" class="flex1 size28" />
		</view>
		
		<view class="size30 mb20 mt30">手机号</view>
		<view class="card flex">
			<input type="number" v-model="formData.phone" placeholder="请输入手机号" class="flex1 size28" maxlength="11" />
		</view>
		
		<view class="size30 mb20 mt30">车牌号</view>
		<view class="card flex">
			<input type="text" v-model="formData.plate_number" placeholder="请输入车牌号" class="flex1 size28" />
		</view>
		
	<view class="size30 mb20 mt30">车型</view>
	<picker @change="typesChange" :value="typeCur" :range="types">
		<view class="card flex jb ac">
			<view class="size28">{{types[typeCur]}}</view>
			<uni-icons type="down" :size="20" color="#999999"></uni-icons>
		</view>
	</picker>
		
		<view class="size30 mb20 mt30">装卸车</view>
		<view class="flex ac">
			<view class="flex ac" @click="formData.operation_type=0">
				<uni-icons type="checkbox-filled" :size="30" color="#29156a" v-if="formData.operation_type==0"></uni-icons>
				<uni-icons type="circle" :size="30" color="#999999" v-else></uni-icons>
				<view class="ml10 size28" :class="formData.operation_type==0?'main':''">装车</view>
			</view>
			<view class="flex ac ml100" @click="formData.operation_type=1">
				<uni-icons type="checkbox-filled" :size="30" color="#29156a" v-if="formData.operation_type==1"></uni-icons>
				<uni-icons type="circle" :size="30" color="#999999" v-else></uni-icons>
				<view class="ml10 size28" :class="formData.operation_type==1?'main':''">卸车</view>
			</view>
		</view>
		
		<view class="mt30" v-if="formData.operation_type==1">
			<view class="size30 mb20">装货省份</view>
			<view class="card flex jb ac" @click="cityRef?.show()">
				<view class="size28" v-if="cityName">{{ cityName }}</view>
				<view class="gray size28" v-else>请选择省市区</view>
				<uni-icons type="down" :size="20" color="#999999"></uni-icons>
			</view>
			
			<view class="size30 mb20 mt30">装货详细地址</view>
			<view class="card flex">
				<input type="text" v-model="formData.loading_address" placeholder="请补充乡镇、街道等详细地址" class="flex1 size28" />
			</view>
		</view>
		
		<view class="size30 mb20 mt30">水印相机照片</view>
		<view class="upload flex jc ac" @click="chooseImage" v-if="!formData.photo">
			<uni-icons type="plusempty" :size="50" color="#999999"></uni-icons>
		</view>
		<view class="upload rel" v-else>
			<image :src="formData.photo" mode="aspectFill" class="upload-img"></image>
			<view class="del-btn" @click.stop="deleteImage">
				<uni-icons type="closeempty" :size="20" color="#FFFFFF"></uni-icons>
			</view>
		</view>
		
		<view class="flex jc mt100">
			<view class="flex ac size26" @click="checked = !checked">
				<uni-icons type="checkbox-filled" v-if="checked"></uni-icons>
				<uni-icons type="circle" v-else></uni-icons>
				<text>我已阅读并同意</text>
				<text class="main" @click.stop="goUser">《用户协议》</text>
				<text>和</text>
				<text class="main" @click.stop="goPrivate">《隐私政策》</text>
			</view>
		</view>
		
		<view class="mt30 btn flex jc ac" @click="submit">{{ isEditMode ? '保存修改' : '提交排队' }}</view>
		
		<view class="safeBottom"></view>
	</view>
	
	<view class="citypicker">
		<uni-data-picker ref="cityRef" placeholder="请选择地址" popup-title="请选择城市" collection="opendb-city-china" field="code as value, name as text" orderby="value asc" :step-searh="true" self-field="code" parent-field="parent_code"
	 @change="onchange">
	    </uni-data-picker>
	</view>
	
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useAppStore } from '@/store';

const appStore = useAppStore()

const checked = ref(false)

const typeCur = ref(0)
const types = [
	'依维柯',
	'3.8米',
	'4.2米',
	'7.6米',
	'9.6米',
	'13.5米',
	'17.5米及以上'
]
const typesChange = (e:any) => {
	typeCur.value = e.detail.value
	formData.value.truck_type = types[e.detail.value]
}

const goPrivate = () => {
	uni.navigateTo({
		url:"/pages/home/private"
	})
}
const goUser = () => {
	uni.navigateTo({
		url:"/pages/home/user"
	})
}

const cityRef = ref()
const citys = ref<any[]>([])
const cityName = computed(()=>{
	if(citys.value.length>0){
		let str:string[] = []
		citys.value.forEach((item)=>{
			str.push(item.text)
		})
		return str.join('/')
	}else{
		return ''
	}
})
const onchange = (e:any) => {
	citys.value = e.detail.value
	formData.value.loading_province = cityName.value
}

// 表单数据
const formData = ref({
	driver_name: '',
	phone: '',
	plate_number: '',
	truck_type: types[0],
	operation_type: 0,  // 0-装车，1-卸车
	loading_province: '',
	loading_address: '',
	photo: ''
})

// 当前任务ID（编辑模式）
const currentTaskId = ref('')
const isEditMode = computed(() => !!currentTaskId.value)

// 查询并回显数据
const loadCurrentTask = async () => {
	// 未登录不查询
	if (!appStore.isLogin) {
		return
	}
	
	try {
		const truckObj = uniCloud.importObject('truck')
		const res = await truckObj.getCurrentTask()
		
		if (res.errCode === 0 && res.data) {
			// 有排队中的申请，回显数据
			const task = res.data
			currentTaskId.value = task._id
			
			formData.value = {
				driver_name: task.driver_name || '',
				phone: task.phone || '',
				plate_number: task.plate_number || '',
				truck_type: task.truck_type || types[0],
				operation_type: task.operation_type || 0,
				loading_province: task.loading_province || '',
				loading_address: task.loading_address || '',
				photo: task.photo || ''
			}
			
			// 设置车型选择器
			const typeIndex = types.indexOf(task.truck_type)
			if (typeIndex !== -1) {
				typeCur.value = typeIndex
			}
			
			// 如果有装货省市区，解析并设置
			if (task.loading_province) {
				const provinceArr = task.loading_province.split('/')
				citys.value = provinceArr.map(text => ({ text }))
			}
		} else {
			// 没有排队中的申请，清空表单
			currentTaskId.value = ''
			resetForm()
		}
	} catch (e) {
		console.error('查询失败：', e)
	}
}

// 重置表单
const resetForm = () => {
	formData.value = {
		driver_name: '',
		phone: '',
		plate_number: '',
		truck_type: types[0],
		operation_type: 0,
		loading_province: '',
		loading_address: '',
		photo: ''
	}
	typeCur.value = 0
	citys.value = []
}

// 页面加载时查询（只执行一次）
onLoad(() => {
	loadCurrentTask()
})

// 选择图片
const chooseImage = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			const tempFilePath = res.tempFilePaths[0]
			
			uni.showLoading({
				title: '上传中...'
			})
			
			try {
				// 上传到云存储
				const uploadRes = await uniCloud.uploadFile({
					filePath: tempFilePath,
					cloudPath: `trucks/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
				})
				
				formData.value.photo = uploadRes.fileID
				uni.hideLoading()
				
				uni.showToast({
					title: '上传成功',
					icon: 'success'
				})
			} catch (e) {
				uni.hideLoading()
				uni.showToast({
					title: '上传失败',
					icon: 'none'
				})
				console.error('上传失败：', e)
			}
		}
	})
}

// 删除图片
const deleteImage = () => {
	formData.value.photo = ''
}

// 表单验证
const validate = () => {
	if (!checked.value) {
		uni.showToast({
			title: '请先阅读并同意用户协议和隐私政策',
			icon: 'none'
		})
		return false
	}
	
	if (!formData.value.driver_name) {
		uni.showToast({
			title: '请输入姓名',
			icon: 'none'
		})
		return false
	}
	
	if (!formData.value.phone) {
		uni.showToast({
			title: '请输入手机号',
			icon: 'none'
		})
		return false
	}
	
	if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
		uni.showToast({
			title: '手机号格式不正确',
			icon: 'none'
		})
		return false
	}
	
	if (!formData.value.plate_number) {
		uni.showToast({
			title: '请输入车牌号',
			icon: 'none'
		})
		return false
	}
	
	if (!formData.value.truck_type) {
		uni.showToast({
			title: '请选择车型',
			icon: 'none'
		})
		return false
	}
	
	// 如果是卸车，必须填写装货地址
	if (formData.value.operation_type === 1) {
		if (!formData.value.loading_province) {
			uni.showToast({
				title: '请选择装货省市区',
				icon: 'none'
			})
			return false
		}
		
		if (!formData.value.loading_address) {
			uni.showToast({
				title: '请输入装货详细地址',
				icon: 'none'
			})
			return false
		}
	}
	
	if (!formData.value.photo) {
		uni.showToast({
			title: '请上传照片',
			icon: 'none'
		})
		return false
	}
	
	return true
}

// 申请订阅消息权限
const requestSubscribe = () => {
	return new Promise((resolve) => {
		const tmplIds = [
			'6dmIz67zTI9aE3PJCTrqK48vFvZOctRJDTnzFx0Wj2M',  // 排队到号通知（提交申请时）
			'dKt-GXFHtyyoN_6Ag-ulck-eafezp1bQ6Sz95QCu6nM',  // 排队进度通知（前面≤3人时）
			'7WbkjjD-w6tc28gX2Gn8-dWCQreta-M-Y5LltkXm3sk'   // 排队成功提醒（变为处理中时）
		]
		
		// #ifdef MP-WEIXIN
		uni.requestSubscribeMessage({
			tmplIds: tmplIds,
			success: (res) => {
				console.log('订阅消息授权结果：', res)
				// 记录用户授权的模板
				const acceptedTmpls = []
				tmplIds.forEach(id => {
					if (res[id] === 'accept') {
						acceptedTmpls.push(id)
					}
				})
				resolve(acceptedTmpls)
			},
			fail: (err) => {
				console.log('订阅消息授权失败：', err)
				resolve([]) // 即使失败也继续提交，只是不发送通知
			}
		})
		// #endif
		
		// #ifndef MP-WEIXIN
		resolve([]) // 非微信小程序环境，直接返回空数组
		// #endif
	})
}

// 检查排队开关
const checkQueueSwitch = async () => {
	try {
		const db = uniCloud.database()
		const res = await db.collection('system_info')
			.where({
				key: 'queue_switch',
				is_published: true
			})
			.limit(1)
			.get()
		
		if (res.result && res.result.data && res.result.data.length > 0) {
			const switchData = res.result.data[0]
			return switchData.content === 'true'
		}
		// 如果没有配置，默认允许排队
		return true
	} catch (e) {
		console.error('检查排队开关失败：', e)
		// 出错时默认允许排队
		return true
	}
}

// 提交表单
const submit = async () => {
	// 检查登录状态
	if (!appStore.isLogin) {
		uni.showModal({
			title: '提示',
			content: '请先登录',
			success: (res) => {
				if (res.confirm) {
					uni.switchTab({
						url: '/pages/tabbar/mine'
					})
				}
			}
		})
		return
	}
	
	// 检查排队开关（编辑模式不检查）
	if (!isEditMode.value) {
		const switchOn = await checkQueueSwitch()
		if (!switchOn) {
			uni.showModal({
				title: '提示',
				content: '当前平台暂停排队服务，请稍后再试',
				showCancel: false
			})
			return
		}
	}
	
	// 验证表单
	if (!validate()) {
		return
	}
	
	// 申请订阅消息权限（仅在新增时）
	let subscribedTmpls = []
	if (!isEditMode.value) {
		subscribedTmpls = await requestSubscribe()
	}
	
	uni.showLoading({
		title: isEditMode.value ? '修改中...' : '提交中...'
	})
	
	try {
		const truckObj = uniCloud.importObject('truck')
		let res
		
		if (isEditMode.value) {
			// 编辑模式，调用更新接口
			res = await truckObj.updateTask({
				id: currentTaskId.value,
				...formData.value
			})
		} else {
			// 新增模式，调用注册接口
			res = await truckObj.register({
				...formData.value,
				subscribedTmpls: subscribedTmpls // 传递用户授权的模板ID
			})
		}
		
		uni.hideLoading()
		
		if (res.errCode === 0) {
			uni.showModal({
				title: isEditMode.value ? '修改成功' : '登记成功',
				content: isEditMode.value ? '信息已更新' : '您已登记成功，请耐心等待',
				showCancel: false,
				success: () => {
					uni.switchTab({
						url:"/pages/tabbar/home"
					})
				}
			})
		} else {
			// 如果是因为已有排队中/处理中的单子
			if (res.errCode === 400 && res.errMsg.includes('已有')) {
				uni.showModal({
					title: '提示',
					content: res.errMsg + '，是否前往查看？',
					confirmText: '去查看',
					success: (modalRes) => {
						if (modalRes.confirm) {
							uni.switchTab({
								url: '/pages/tabbar/home'
							})
						}
					}
				})
			} else {
				uni.showToast({
					title: res.errMsg || (isEditMode.value ? '修改失败' : '登记失败'),
					icon: 'none',
					duration: 2000
				})
			}
		}
	} catch (e:any) {
		uni.hideLoading()
		uni.showToast({
			title: e.message || '提交失败',
			icon: 'none'
		})
		console.error('提交失败：', e)
	}
}
</script>

<style lang="scss">
.upload{
	width: 400rpx;
	height: 400rpx;
	border-radius: 20px;
	background-color: #FFFFFF;
	overflow: hidden;
}
.upload-img{
	width: 100%;
	height: 100%;
}
.del-btn{
	position: absolute;
	right: 20rpx;
	top: 20rpx;
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
}
.btn{
	height: 88rpx;
	border-radius: 44rpx;
	background-color: $main-color;
	color: #FFFFFF;
}
.citypicker{
	position: absolute;
	left: -99999rpx;
}
</style>