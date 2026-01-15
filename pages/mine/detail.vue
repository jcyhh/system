<template>
	<view class="pl30 pr30 pt30">
		
		<view class="flex jc pt60" v-if="!detailData">
			<image src="@/static/imgs/nodata.png" class="img200"></image>
		</view>
		<view class="tc size26 gray mt30" v-if="!detailData">暂无数据～</view>
		
		<template v-if="detailData">
			<view class="card">
				<view class="flex ac">
					<view class="line mr20"></view>
					<view class="size30 bold">用户信息</view>
				</view>
				<view class="mt40 flex ac size28">
					<view class="grey">姓名：</view>
					<view class="flex ac" @click="copy(detailData.driver_name)">
						<view>{{ detailData.driver_name }}</view>
						<image src="@/static/imgs/copy.png" class="img38 ml10"></image>
					</view>
				</view>
				<view class="mt30 flex ac size28">
					<view class="grey">电话：</view>
					<view class="flex ac" @click="copy(detailData.phone)">
						<view>{{ detailData.phone }}</view>
						<image src="@/static/imgs/copy.png" class="img38 ml10"></image>
					</view>
				</view>
				<view class="mt30 flex ac size28">
					<view class="grey">装卸车：</view>
					<view class="flex ac" v-if="detailData.operation_type === 0">
						<view>装车</view>
						<image src="/static/imgs/6.png" class="img48 ml10"></image>
					</view>
					<view class="flex ac" v-else>
						<view>卸车</view>
						<image src="/static/imgs/5.png" class="img48 ml10"></image>
					</view>
				</view>
			</view>
			
			<view class="card mt30" v-if="detailData.operation_type === 1 && detailData.loading_province" @click="copy(detailData.loading_province + detailData.loading_address)">
				<view class="flex jb ac">
					<view class="flex ac">
						<view class="line mr20"></view>
						<view class="size30 bold">装车地点</view>
					</view>
					<image src="/static/imgs/copy.png" class="img38"></image>
				</view>
				
				<view class="flex ac mt40">
					<uni-icons type="location-filled" :size="40"></uni-icons>
					<view class="ml20">
						<view class="size30">{{ detailData.loading_province }}</view>
						<view class="size26 mt10 grey">{{ detailData.loading_address }}</view>
					</view>
				</view>
			</view>
			
			<view class="card mt30">
				<view class="flex ac">
					<view class="line mr20"></view>
					<view class="size30 bold">车辆信息</view>
				</view>
				<view class="mt40 flex ac size28">
					<view class="grey">车牌号：</view>
					<view class="flex ac" @click="copy(detailData.plate_number)">
						<view>{{ detailData.plate_number }}</view>
						<image src="@/static/imgs/copy.png" class="img38 ml10"></image>
					</view>
				</view>
				<view class="mt30 flex ac size28">
					<view class="grey">车型：</view>
					<view class="flex ac">
						<view>{{ detailData.truck_type }}</view>
					</view>
				</view>
				<view class="mt30 flex ac size28">
					<view class="grey">到达时间：</view>
					<view class="flex ac">
						<view>{{ formatTime(detailData.create_time) }}</view>
					</view>
				</view>
				<view class="mt30 flex ac size28" v-if="detailData.complete_time">
					<view class="grey">完成时间：</view>
					<view class="flex ac">
						<view>{{ formatTime(detailData.complete_time) }}</view>
					</view>
				</view>
				<view class="mt30 flex ac size28">
					<view class="grey">状态：</view>
					<view class="flex ac">
						<view :class="{
							'main': detailData.status === 1,
							'grey': detailData.status === 0,
							'': detailData.status === 2
						}">
							{{ statusText }}
						</view>
					</view>
				</view>
				<view class="flex mt40">
					<view class="flex col jc ac flex1" @click="viewImg(detailData.photo)" v-if="detailData.photo">
						<image :src="detailData.photo" mode="aspectFill" class="cover"></image>
						<view class="size24 gray mt10">到达照片</view>
					</view>
					<view class="flex col jc ac flex1" @click="viewImg(detailData.complete_photo)" v-if="detailData.complete_photo">
						<image :src="detailData.complete_photo" mode="aspectFill" class="cover"></image>
						<view class="size24 gray mt10">完成照片</view>
					</view>
				</view>
			</view>
		</template>
		
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const detailData = ref<any>(null)

// 状态文本
const statusText = computed(() => {
	if (!detailData.value) return ''
	const statusMap = {
		0: '排队中',
		1: '处理中',
		2: '已完成'
	}
	return statusMap[detailData.value.status] || ''
})

// 加载详情数据
const loadDetail = async (id: string) => {
	try {
		uni.showLoading({ title: '加载中...' })
		const truckObj = uniCloud.importObject('truck')
		const res = await truckObj.getDetail({ id })
		
		uni.hideLoading()
		if (res.errCode === 0) {
			detailData.value = res.data
		} else {
			uni.showToast({
				title: res.errMsg || '获取失败',
				icon: 'none'
			})
		}
	} catch (e: any) {
		uni.hideLoading()
		console.error('获取详情失败：', e)
		uni.showToast({
			title: e.message || '获取失败',
			icon: 'none'
		})
	}
}

// 格式化时间
const formatTime = (timestamp: number) => {
	if (!timestamp) return ''
	const date = new Date(timestamp)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	const second = String(date.getSeconds()).padStart(2, '0')
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 查看图片
const viewImg = (url: string) => {
	if (!url) return
	uni.previewImage({
		urls: [url]
	})
}

// 复制文本
const copy = (text: string) => {
	uni.setClipboardData({
		data: text
	})
}

// 页面加载
onLoad((options: any) => {
	if (options.id) {
		loadDetail(options.id)
	} else {
		uni.showToast({
			title: '缺少ID参数',
			icon: 'none'
		})
	}
})
</script>

<style lang="scss" scoped>
.line{
	width: 8rpx;
	height: 30rpx;
	border-radius: 4rpx;
	background-color: $main-color;
}
.cover{
	width: 200rpx;
	height: 200rpx;
	border-radius: 20rpx;
}
</style>
