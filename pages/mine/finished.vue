<template>
	<view class="tabs flex ac wrap" v-if="tags.length>0">
		<view class="tag flex ac mr10 mb10" v-for="(item,index) in tags" :key="index">{{ item }}</view>
	</view>
	
	<view class="search flex jc ac" @click="filterRef?.open()">
		<uni-icons type="search" color="#FFFFFF" :size="35"></uni-icons>
	</view>
	<view class="export flex jc ac" @click="exportExcel">
		<uni-icons type="redo-filled" color="#FFFFFF" :size="35"></uni-icons>
	</view>
	
	<view class="pl30 pr30 mt30">
		
		<view class="card mb20" v-for="(item,index) in finishedList" :key="item._id" @click="goDetail(item)">
			<view class="flex jb ac">
				<image src="/static/imgs/avatar.png" class="img100"></image>
				<view class="flex1 ml20">
					<view class="flex jb ac size30">
						<view>{{ item.driver_name }}</view>
						<view class="bold">{{ item.plate_number }}</view>
					</view>
					<view class="size26 mt10">{{ item.phone }}</view>
				</view>
			</view>
			<view class="line mt30 mb30"></view>
			<view class="flex jb ac mt30">
				<view class="size28 bold">到达时间</view>
				<view class="size26 gray">{{ formatTime(item.create_time) }}</view>
			</view>
			<view class="flex jb ac mt20">
				<view class="size28 bold">完成时间</view>
				<view class="size26 gray">{{ formatTime(item.complete_time) }}</view>
			</view>
		</view>
		
		<view class="tc mt60 size28 gray" v-if="finishedList.length === 0 && !isLoading">
			<view class="flex jc">
				<image src="@/static/imgs/nodata.png" class="img200"></image>
			</view>
			暂无已完成的单子
		</view>
		
		<!-- 加载状态 -->
		<view class="tc size28 gray mt30 mb30" v-if="isLoading">
			加载中...
		</view>
		<view class="tc size28 gray mt30 mb30" v-else-if="!hasMore && finishedList.length > 0">
			没有更多了
		</view>
		
	</view>
	
	<view class="gap50"></view>
	
	<Filter ref="filterRef" @submit="onFilter"></Filter>
	
	<Excel ref="excelRef"></Excel>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import Filter from './Filter.vue'
import Excel from './Excel.vue'

const filterRef = ref()
const excelRef = ref()
const finishedList = ref<any[]>([])
const tags = ref<string[]>([])
const params = ref<any>({})
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const isLoading = ref(false)

// 加载已完成的单子
const loadFinishedList = async (isRefresh = false) => {
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
		const res = await truckObj.getFinishedList({
			page: page.value,
			pageSize: pageSize,
			...params.value
		})
		
		if (res.errCode === 0) {
			if (isRefresh) {
				finishedList.value = res.data.list
			} else {
				finishedList.value = [...finishedList.value, ...res.data.list]
			}
			
			// 判断是否还有更多数据
			if (res.data.list.length < pageSize) {
				hasMore.value = false
			}
			
			// 加载成功，页码+1
			if (res.data.list.length > 0) {
				page.value++
			}
		} else {
			uni.showToast({
				title: res.errMsg || '获取失败',
				icon: 'none'
			})
		}
	} catch (e: any) {
		console.error('获取失败：', e)
		uni.showToast({
			title: e.message || '获取失败',
			icon: 'none'
		})
	} finally {
		isLoading.value = false
	}
}

// 筛选回调
const onFilter = (data: any) => {
	tags.value = data.tags
	
	// 转换筛选参数
	const filterParams: any = {}
	
	// 车型
	if (data.params.carType !== undefined) {
		const typesList = ['依维柯', '3.8米', '4.2米', '7.6米', '9.6米', '13.5米', '17.5米及以上']
		filterParams.truck_type = typesList[data.params.carType]
	}
	
	// 装卸车类型
	if (data.params.type !== undefined) {
		filterParams.operation_type = data.params.type  // 0装车/1卸车
	}
	
	// 时间范围（使用iOS兼容的日期格式）
	if (data.params.startTime && data.params.endTime) {
		filterParams.start_time = new Date(data.params.startTime.replace(/-/g, '/') + ' 00:00:00').getTime()
		filterParams.end_time = new Date(data.params.endTime.replace(/-/g, '/') + ' 23:59:59').getTime()
	}
	
	// 车牌号
	if (data.params.cardNo) {
		filterParams.plate_number = data.params.cardNo
	}
	
	// 手机号
	if (data.params.phoneNo) {
		filterParams.phone = data.params.phoneNo
	}
	
	// 姓名
	if (data.params.name) {
		filterParams.driver_name = data.params.name
	}
	
	params.value = filterParams
	loadFinishedList(true)
}

// 格式化时间
const formatTime = (timestamp: number) => {
	if (!timestamp) return ''
	const date = new Date(timestamp)
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	return `${month}-${day} ${hour}:${minute}`
}

// 跳转到详情页
const goDetail = (item: any) => {
	uni.navigateTo({
		url: `/pages/mine/detail?id=${item._id}`
	})
}

// 导出Excel（暂未实现）
const exportExcel = () => {
	excelRef.value?.open()
}

// 页面加载
onLoad(() => {
	loadFinishedList(true)
})

// 下拉刷新
onPullDownRefresh(async () => {
	try {
		await loadFinishedList(true)
		uni.showToast({
			title: '刷新成功',
			icon: 'success'
		})
	} catch (e) {
		console.error('刷新失败：', e)
	} finally {
		uni.stopPullDownRefresh()
	}
})

// 触底加载更多
onReachBottom(() => {
	loadFinishedList()
})
</script>

<style lang="scss" scoped>
.tabs{
	width: 100vw;
	padding: 30rpx 30rpx 10rpx 30rpx;
	background-color: #FFFFFF;
	position: sticky;
	top: var(--window-top);
	left: 0;
	z-index: 10;
	box-shadow: 0 10rpx 10rpx #eeeeee;
	.tag{
		border: 1rpx solid $main-color;
		height: 68rpx;
		border-radius: 10rpx;
		color: $main-color;
		padding: 0 20rpx;
	}
}
.line{
	width: 100%;
	height: 1rpx;
	background-color: #eeeeee;
}
.search{
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: $main-color;
	box-shadow: 0 0 20rpx #999999;
	position: fixed;
	bottom: 100rpx;
	right: 30rpx;
}
.export{
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: $main-color;
	box-shadow: 0 0 20rpx #999999;
	position: fixed;
	bottom: 250rpx;
	right: 30rpx;
}
</style>
