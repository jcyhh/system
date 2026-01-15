<template>
	<view class="pl30 pr30 pt30">
		
		<view class="flex jc pt60" v-if="!dealingData">
			<image src="@/static/imgs/nodata.png" class="img200"></image>
		</view>
		<view class="tc size26 gray mt30" v-if="!dealingData">当前没有在处理中的记录～</view>
		
		<template v-if="dealingData">
			<view class="card">
				<view class="flex ac">
					<view class="line mr20"></view>
					<view class="size30 bold">用户信息</view>
				</view>
				<view class="mt40 flex ac size28">
					<view class="grey">姓名：</view>
					<view class="flex ac" @click="copy(dealingData.driver_name)">
						<view>{{ dealingData.driver_name }}</view>
						<image src="@/static/imgs/copy.png" class="img38 ml10"></image>
					</view>
				</view>
				<view class="mt30 flex ac size28">
					<view class="grey">电话：</view>
					<view class="flex ac" @click="copy(dealingData.phone)">
						<view>{{ dealingData.phone }}</view>
						<image src="@/static/imgs/copy.png" class="img38 ml10"></image>
					</view>
				</view>
				<view class="mt30 flex ac size28">
					<view class="grey">装卸车：</view>
					<view class="flex ac" v-if="dealingData.operation_type === 0">
						<view>装车</view>
						<image src="/static/imgs/6.png" class="img48 ml10"></image>
					</view>
					<view class="flex ac" v-else>
						<view>卸车</view>
						<image src="/static/imgs/5.png" class="img48 ml10"></image>
					</view>
				</view>
			</view>
			
			<view class="card mt30" v-if="dealingData.operation_type === 1 && dealingData.loading_province" @click="copy(dealingData.loading_province + dealingData.loading_address)">
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
						<view class="size30">{{ dealingData.loading_province }}</view>
						<view class="size26 mt10 grey">{{ dealingData.loading_address }}</view>
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
					<view class="flex ac" @click="copy(dealingData.plate_number)">
						<view>{{ dealingData.plate_number }}</view>
						<image src="@/static/imgs/copy.png" class="img38 ml10"></image>
					</view>
				</view>
				<view class="mt30 flex ac size28">
					<view class="grey">车型：</view>
					<view class="flex ac">
						<view>{{ dealingData.truck_type }}</view>
					</view>
				</view>
				<view class="mt30 flex ac size28">
					<view class="grey">到达时间：</view>
					<view class="flex ac">
						<view>{{ formatTime(dealingData.create_time) }}</view>
					</view>
				</view>
				<view class="mt30 flex ac size28" v-if="dealingData.complete_time">
					<view class="grey">完成时间：</view>
					<view class="flex ac">
						<view>{{ formatTime(dealingData.complete_time) }}</view>
					</view>
				</view>
				<view class="flex mt40">
					<view class="flex col jc ac flex1" @click="viewImg(dealingData.photo)">
						<image :src="dealingData.photo" mode="aspectFill" class="cover"></image>
						<view class="size24 gray mt10">到达照片</view>
					</view>
					<view class="flex col jc ac flex1" @click="viewImg(dealingData.complete_photo)" v-if="dealingData.complete_photo">
						<image :src="dealingData.complete_photo" mode="aspectFill" class="cover"></image>
						<view class="size24 gray mt10">完成照片</view>
					</view>
				</view>
			</view>
			
			<view class="mt100 btn flex jc ac" @click="submit">确认完成</view>
			
			<view class="safeBottom"></view>
		</template>
		
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { useAppStore } from '@/store/modules/app';

const appStore = useAppStore();
const dealingData = ref<any>(null)

// 加载处理中的单子
const loadDealingData = async () => {
	try {
		const truckObj = uniCloud.importObject('truck')
		const res = await truckObj.getList({
			status: 1,  // 处理中
			page: 1,
			pageSize: 1
		})
		
		if (res.errCode === 0) {
			if (res.data.list.length > 0) {
				dealingData.value = res.data.list[0]
			} else {
				dealingData.value = null
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

// 确认完成
const submit = async () => {
	if (!dealingData.value) return
	
	// 打印调试信息
	console.log('当前用户角色:', appStore.role)
	console.log('是否管理员:', appStore.role === 1)
	
	// 管理员：直接确认完成，不需要上传图片
	if (appStore.role === 1) {
		uni.showModal({
			title: '确认完成',
			content: '确定要完成该订单吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						uni.showLoading({ title: '处理中...' })
						
						const truckObj = uniCloud.importObject('truck')
						const result = await truckObj.adminComplete({
							id: dealingData.value._id
						})
						
						uni.hideLoading()
						
						if (result.errCode === 0) {
							uni.showToast({
								title: '操作成功',
								icon: 'success'
							})
							
							// 延迟返回上一页
							setTimeout(() => {
								uni.navigateBack()
							}, 1500)
						} else {
							uni.showToast({
								title: result.errMsg || '操作失败',
								icon: 'none'
							})
						}
					} catch (e: any) {
						uni.hideLoading()
						console.error('操作失败：', e)
						uni.showToast({
							title: e.message || '操作失败',
							icon: 'none'
						})
					}
				}
			}
		})
	} 
	// 普通用户：跳转到完成页面上传图片
	else {
		uni.navigateTo({
			url: `/pages/home/Finish?id=${dealingData.value._id}`
		})
	}
}

// 页面加载
onLoad(() => {
	loadDealingData()
})

// 下拉刷新
onPullDownRefresh(async () => {
	try {
		await loadDealingData()
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
.btn{
	height: 88rpx;
	border-radius: 44rpx;
	background-color: $main-color;
	color: #FFFFFF;
}
</style>
