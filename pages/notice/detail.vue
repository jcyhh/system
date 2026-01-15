<template>
	<view class="pl30 pr30 pt30">
		
		<view v-if="noticeDetail">
			<view class="size36 bold">{{ noticeDetail.title }}</view>
			<view class="size24 gray mt20">{{ formatTime(noticeDetail.create_time) }}</view>
			
			<view class="line mt30 mb30"></view>
			
			<view class="content size30" v-html="noticeDetail.content"></view>
		</view>
		
		<view class="tc mt100" v-else-if="!isLoading">
			<view class="flex jc">
				<image src="@/static/imgs/nodata.png" class="img200"></image>
			</view>
			<view class="size28 gray mt20">公告不存在</view>
		</view>
		
		<view class="tc mt100 size28 gray" v-if="isLoading">
			加载中...
		</view>
		
	</view>
	
	<view class="gap50"></view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const noticeDetail = ref<any>(null)
const isLoading = ref(false)

// 加载公告详情
const loadNoticeDetail = async (id: string) => {
	try {
		isLoading.value = true
		
		const noticeObj = uniCloud.importObject('notice')
		const res = await noticeObj.getDetail({ id })
		
		if (res.errCode === 0) {
			noticeDetail.value = res.data
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
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	return `${year}-${month}-${day} ${hour}:${minute}`
}

// 页面加载
onLoad((options: any) => {
	if (options.id) {
		loadNoticeDetail(options.id)
	}
})
</script>

<style lang="scss" scoped>
.line {
	width: 100%;
	height: 1rpx;
	background-color: #eeeeee;
}

.content {
	line-height: 1.8;
	word-wrap: break-word;
	white-space: pre-wrap; /* 保留纯文本的换行 */
}
</style>
