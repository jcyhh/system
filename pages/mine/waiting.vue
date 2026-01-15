<template>
	
	<view class="pl30 pr30 mt30">
		
		<view class="card mb20" v-for="(item,index) in waitingList" :key="item._id" @click="goDetail(item)">
			<view class="flex jb ac">
				<view class="no flex jc ac size28 mr20">#{{ index + 1 }}</view>
				<view class="flex1">
					<view class="flex jb ac size30">
						<view>{{ item.driver_name }}</view>
						<view class="bold">{{ item.plate_number }}</view>
					</view>
					<view class="size26 mt10 grey">{{ item.phone }}</view>
				</view>
			</view>
			<view class="line mt30 mb30"></view>
			<view class="flex jb ac">
				<view class="flex ac">
					<view class="size28 bold mr20">{{ item.truck_type }}</view>
					<image :src="item.operation_type == 1 ? '/static/imgs/5.png' : '/static/imgs/6.png'" class="img40 mr10"></image>
					<view class="size26 grey">{{ item.operation_type == 1 ? '卸车' : '装车' }}</view>
				</view>
				<view class="size26 gray">{{ formatTime(item.create_time) }}</view>
			</view>
		</view>
		
		<view class="tc mt60 size28 gray" v-if="waitingList.length === 0 && !isLoading">
			<view class="flex jc">
				<image src="@/static/imgs/nodata.png" class="img200"></image>
			</view>
			暂无排队中的单子
		</view>
		
		<!-- 加载状态 -->
		<view class="tc size28 gray mt30 mb30" v-if="isLoading">
			加载中...
		</view>
		<view class="tc size28 gray mt30 mb30" v-else-if="!hasMore && waitingList.length > 0">
			没有更多了
		</view>
		
	</view>
	
	<view class="gap50"></view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';

const waitingList = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const isLoading = ref(false)

// 加载排队中的单子
const loadWaitingList = async (isRefresh = false) => {
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
		const res = await truckObj.getList({
			status: 0,  // 排队中
			page: page.value,
			pageSize: pageSize
		})
		
		if (res.errCode === 0) {
			if (isRefresh) {
				waitingList.value = res.data.list
			} else {
				waitingList.value = [...waitingList.value, ...res.data.list]
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

// 格式化时间
const formatTime = (timestamp: number) => {
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

// 页面加载
onLoad(() => {
	loadWaitingList(true)
})

// 下拉刷新
onPullDownRefresh(async () => {
	try {
		await loadWaitingList(true)
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
	loadWaitingList()
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
.no {
	width: 60rpx;
	height: 60rpx;
	border: 1rpx solid $main-color;
	color: $main-color;
	border-radius: 10rpx;
	flex-shrink: 0;
}
</style>
