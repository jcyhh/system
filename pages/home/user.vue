<template>
	<view class="page">
		<view class="content" v-if="systemInfo">
			<view class="title size36 bold mb30">{{ systemInfo.title }}</view>
			<rich-text :nodes="systemInfo.content" class="rich-content"></rich-text>
		</view>
		<view class="empty" v-else>
			<text class="gray">内容加载中...</text>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const systemInfo = ref<any>(null)

// 加载用户协议
const loadSystemInfo = async () => {
	try {
		const db = uniCloud.database()
		const res = await db.collection('system_info')
			.where({
				key: 'user_agreement',
				is_published: true
			})
			.limit(1)
			.get()
		
		if (res.result && res.result.data && res.result.data.length > 0) {
			systemInfo.value = res.result.data[0]
		} else {
			uni.showToast({
				title: '暂无内容',
				icon: 'none'
			})
		}
	} catch (e) {
		console.error('加载失败：', e)
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	}
}

onLoad(() => {
	loadSystemInfo()
})
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background-color: #F5F5F5;
}
.content {
	padding: 30rpx;
	background-color: #FFFFFF;
	min-height: 100vh;
}
.title {
	text-align: center;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #EEEEEE;
}
.rich-content {
	line-height: 1.8;
	font-size: 28rpx;
	color: #333333;
}
.empty {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}
</style>
