<template>
	<view class="pl30 pr30 pt30">
		
		<view class="card flex ac mb30" @click="goNotice" v-if="noticeList.length > 0">
			<uni-icons type="notification" :size="20"></uni-icons>
			<swiper class="notice ml20" :interval="3000" :autoplay="true" :vertical="true" :circular="true" :duration="1000">
				<swiper-item v-for="item in noticeList" :key="item._id">
					<view class="noticeItem line size27">{{ item.title }}</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="flex ast">
			<view class="card flex1 flex ac mr20" @click="goApply">
				<image src="/static/imgs/2.png" class="img88"></image>
				<view class="ml20 size28">{{ currentTask ? '修改信息' : '我要排队' }}</view>
			</view>
			<view class="card flex1 flex ac" @click="openFinish">
				<image src="/static/imgs/4.png" class="img88"></image>
				<view class="ml20 size28">装卸完成</view>
			</view>
		</view>

		<view class="flex jb ac card mt30">
			<view class="flex ac">
				<image src="/static/imgs/3.png" class="img88"></image>
				<view class="ml20 size28">当前排队总数</view>
			</view>
			<view class="size42 bold main">{{ queueStats.total }}</view>
		</view>

		<view class="size30 bold mt30">排队列表</view>

		<view class="card mt30 rel" v-for="(item,index) in queueList" :key="item._id">
			<view class="tag size24" v-if="item.status==1">处理中</view>
			<view class="flex jb ac pt10">
				<view class="flex ac">
					<view class="no flex jc ac size28 mr20">#{{ index + 1 }}</view>
					<view class="size30 bold">{{ item.plate_number }}</view>
				</view>
				<view class="size28 grey">{{ formatTime(item.create_time) }}</view>
			</view>
			<view class="flex ae mt30">
				<view class="tc flex1">
					<view class="size30 bold">{{ item.truck_type }}</view>
					<view class="size26 grey mt10">车型</view>
				</view>
				<view class="tc flex1" v-if="item.operation_type == 1">
					<image src="/static/imgs/5.png" class="img40"></image>
					<view class="size26 grey mt10">卸车</view>
				</view>
				<view class="tc flex1" v-else>
					<image src="/static/imgs/6.png" class="img40"></image>
					<view class="size26 grey mt10">装车</view>
				</view>
			</view>
		</view>
		
		<view class="tc mt30 size28 gray" v-if="queueList.length === 0">
			<view class="flex jc">
				<image src="@/static/imgs/nodata.png" class="img200"></image>
			</view>
			暂无排队记录
		</view>
	</view>

	<view class="gap200"></view>

	<view class="myCard" v-if="appStore.isLogin && currentTask">
		<view class="flex jb ac">
			<view class="flex ac size28">
				<view class="bold mr20">#{{ myQueueNumber }}</view>
				<view>{{ currentTask.plate_number }}</view>
			</view>
			<view class="size28" v-if="currentTask.status === 0">{{ estimatedWaitTime }}</view>
			<view class="size28" style="color: #19be6b;" v-else>处理中</view>
		</view>
		<view class="flex jb ac mt10 opc6 size24">
			<view>我的排号</view>
			<view v-if="currentTask.status === 0">预计等待</view>
			<view v-else>状态</view>
		</view>
	</view>
	
	<uni-popup ref="popupRef" type="center">
		<view class="pop">
			<view class="flex jb ac">
				<uni-icons type="closeempty" color="#FFFFFF" :size="25"></uni-icons>
				<view class="size30 bold">提示</view>
				<uni-icons type="closeempty" :size="25" @click="popupRef?.close()"></uni-icons>
			</view>
			<view class="flex jc mt60">
				<image src="@/static/imgs/nodata.png" class="img200"></image>
			</view>
			<view class="tc size26 gray mt30">您还未进行装卸或申请排队～</view>
		</view>
	</uni-popup>
	
	<Finish ref="finishRef"></Finish>
	
	<Popup ref="noticeRef"></Popup>

</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onShow, onPullDownRefresh, onReachBottom, onShareAppMessage } from '@dcloudio/uni-app';
import { useAppStore } from '@/store';
import Finish from '../home/Finish.vue'
import Popup from '../home/Popup.vue'

const appStore = useAppStore()
const popupRef = ref()
const finishRef = ref()
const noticeRef = ref()

// 当前排队中的申请
const currentTask = ref<any>(null)

// 排队列表
const queueList = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const isLoading = ref(false)

// 公告列表（首页轮播用）
const noticeList = ref<any[]>([])

const goNotice = () => {
	uni.navigateTo({
		url:"/pages/notice/list"
	})
}

// 统计数据
const queueStats = ref({
	total: 0,
	processing: 0,
	waiting: 0
})

// 加载公告列表（首页轮播用）
const loadNoticeList = async () => {
	try {
		const noticeObj = uniCloud.importObject('notice')
		const res = await noticeObj.getList({ limit: 5 })

		if (res.errCode === 0) {
			noticeList.value = res.data.list
		}
	} catch (e: any) {
		console.error('加载公告列表失败：', e)
	}
}

// 加载弹窗公告
const loadPopupNotice = async () => {
	// 只有登录用户才加载弹窗公告
	if (!appStore.isLogin) return

	try {
		const noticeObj = uniCloud.importObject('notice')
		const res = await noticeObj.getPopupNotice()

		if (res.errCode === 0 && res.data) {
			// 有未读的弹窗公告，展示弹窗
			setTimeout(() => {
				noticeRef.value?.open(res.data)
			}, 500) // 延迟500ms展示，避免页面加载时立即弹出
		}
	} catch (e: any) {
		console.error('加载弹窗公告失败：', e)
	}
}

// 我的排号（在队列中的位置）
const myQueueNumber = computed(() => {
	if (!currentTask.value) return 0
	const index = queueList.value.findIndex(item => item._id === currentTask.value._id)
	return index !== -1 ? index + 1 : 0
})

// 根据车型获取预计使用时间（分钟）
const getTruckTime = (truckType: string) => {
	if (truckType === '依维柯') {
		return 10
	} else if (['3.8米', '4.2米', '7.6米', '9.6米'].includes(truckType)) {
		return 30
	} else {
		// 13.5米、17.5米及以上
		return 60
	}
}

// 预计等待时间（根据前方排队车型估算）
const estimatedWaitTime = computed(() => {
	if (!currentTask.value || currentTask.value.status === 1) return ''
	
	// 找到自己在队列中的位置
	const myIndex = queueList.value.findIndex(item => item._id === currentTask.value._id)
	if (myIndex <= 0) return '即将开始'
	
	// 累加前方所有车辆的预计时间
	let totalMinutes = 0
	for (let i = 0; i < myIndex; i++) {
		const truck = queueList.value[i]
		totalMinutes += getTruckTime(truck.truck_type)
	}
	
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	
	if (hours > 0) {
		return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
	} else {
		return `${minutes}分钟`
	}
})

// 查询当前用户是否有排队中的申请
const checkCurrentTask = async () => {
	// 未登录不查询
	if (!appStore.isLogin) {
		currentTask.value = null
		return
	}
	
	try {
		const truckObj = uniCloud.importObject('truck')
		const res = await truckObj.getCurrentTask()
		
		if (res.errCode === 0 && res.data) {
			// 有排队中或处理中的申请
			currentTask.value = res.data
		} else {
			currentTask.value = null
		}
	} catch (e) {
		console.error('查询失败：', e)
		currentTask.value = null
	}
}

// 查询排队列表
const loadQueueList = async (isRefresh = false) => {
	if (isLoading.value) return
	if (!hasMore.value && !isRefresh) return
	
	try {
		isLoading.value = true
		
		// 如果是刷新，重置页码
		if (isRefresh) {
			page.value = 1
			hasMore.value = true
		}
		
		const truckObj = uniCloud.importObject('truck')
		const res = await truckObj.getQueueList({
			page: page.value,
			pageSize: pageSize
		})
		
		if (res.errCode === 0) {
			if (isRefresh) {
				queueList.value = res.data.list
			} else {
				queueList.value = [...queueList.value, ...res.data.list]
			}
			
			queueStats.value.total = res.data.total
			
			// 统计处理中和排队中的数量
			queueStats.value.processing = queueList.value.filter(item => item.status === 1).length
			queueStats.value.waiting = queueList.value.filter(item => item.status === 0).length
			
			// 判断是否还有更多数据
			if (res.data.list.length < pageSize) {
				hasMore.value = false
			}
			
			// 加载成功，页码+1
			if (res.data.list.length > 0) {
				page.value++
			}
		}
	} catch (e) {
		console.error('获取列表失败：', e)
	} finally {
		isLoading.value = false
	}
}

// 格式化时间
const formatTime = (timestamp: number) => {
	const date = new Date(timestamp)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	const second = String(date.getSeconds()).padStart(2, '0')
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 页面显示时查询（首次加载、从其他页面返回、切换标签页时都会触发）
onShow(async () => {
	// 加载公告列表
	await loadNoticeList()
	// 先加载列表，再查询当前任务，这样计算排号才准确
	await loadQueueList(true)
	await checkCurrentTask()
	// 加载弹窗公告（放在最后，避免阻塞主流程）
	await loadPopupNotice()
})

// 监听刷新事件（完成装卸后触发）
uni.$on('refreshHome', async () => {
	await loadQueueList(true)
	await checkCurrentTask()
})

// 下拉刷新
onPullDownRefresh(async () => {
	try {
		await loadQueueList(true)
		await checkCurrentTask()
		
		uni.showToast({
			title: '刷新成功',
			icon: 'success'
		})
	} catch (e) {
		console.error('刷新失败：', e)
	} finally {
		// 停止下拉刷新动画
		uni.stopPullDownRefresh()
	}
})

// 触底加载更多
onReachBottom(() => {
	loadQueueList()
})

const goApply = () => {
	// 如果有排队中的申请，跳转到修改页面（带上当前申请数据）
	if (currentTask.value) {
		uni.navigateTo({
			url: `/pages/home/apply?id=${currentTask.value._id}`
		})
	} else {
		uni.navigateTo({
			url: "/pages/home/apply"
		})
	}
}

const openFinish = () => {
	// 检查是否登录
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
	
	// 检查是否有处理中的单子
	if (currentTask.value && currentTask.value.status === 1) {
		// 有处理中的单子，打开完成弹窗，传入任务ID
		finishRef.value?.open(currentTask.value._id)
	} else {
		// 没有处理中的单子，提示用户
		popupRef.value?.open()
	}
}

const goFinish = () => {
	popupRef.value?.close()
	setTimeout(()=>{
		finishRef.value?.open()
	},300)
}

onShareAppMessage(()=>{
	return {
		title: '点击登记排队',
		path: '/pages/tabbar/home'
	}
})
</script>

<style lang="scss" scoped>
	.notice{
		flex: 1;
		height: 40rpx;
		line-height: 40rpx;
		.noticeItem{
			width: 100%;
			height: 40rpx;
			line-height: 40rpx;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
	.tag {
		padding: 5rpx 20rpx;
		border-radius: 4rpx 20rpx 0 20rpx;
		position: absolute;
		top: 0;
		right: 0;
		background-color: $uni-color-success;
		color: #FFFFFF;
	}

	.no {
		width: 50rpx;
		height: 50rpx;
		border: 1rpx solid $main-color;
		color: $main-color;
		border-radius: 10rpx;
	}

	.myCard {
		background-color: $main-color;
		padding: 30rpx;
		width: 690rpx;
		position: fixed;
		bottom: calc(var(--window-bottom) + 30rpx);
		left: 30rpx;
		border-radius: 20rpx;
		z-index: 10;
		color: #FFFFFF;
	}
	
	.pop{
		width: 600rpx;
		border-radius: 30rpx;
		padding: 30rpx;
		background-color: #FFFFFF;
	}
	
	.opc6{
		opacity: 0.6;
	}
</style>