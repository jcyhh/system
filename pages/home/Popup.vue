<template>
	<uni-popup ref="popupRef" type="center" :mask-click="false">
		<view class="pop">
			<view class="flex jb ac">
				<uni-icons type="closeempty" color="#FFFFFF" :size="25"></uni-icons>
				<view class="size30 bold">{{ noticeData?.title || '公告' }}</view>
				<uni-icons type="closeempty" :size="25" @click="close()"></uni-icons>
			</view>
			
			<view class="mt30 content size28" v-html="noticeData?.content"></view>
			
			<view class="mt50 btn flex jc ac" @click="submit">
				我已知晓
			</view>
		</view>
	</uni-popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const popupRef = ref()
const noticeData = ref<any>(null)

const open = (data: any) => {
	noticeData.value = data
	popupRef.value?.open()
}

const close = () => {
	popupRef.value?.close()
}

const submit = async () => {
	if (!noticeData.value?._id) {
		close()
		return
	}

	try {
		// 标记为已读
		const noticeObj = uniCloud.importObject('notice')
		const res = await noticeObj.markPopupAsRead({
			noticeId: noticeData.value._id
		})

		if (res.errCode === 0) {
			close()
		} else {
			uni.showToast({
				title: res.errMsg || '操作失败',
				icon: 'none'
			})
		}
	} catch (e: any) {
		console.error('标记已读失败：', e)
		uni.showToast({
			title: e.message || '操作失败',
			icon: 'none'
		})
	}
}

defineExpose({
	open
})
</script>

<style lang="scss" scoped>
.pop{
	width: 600rpx;
	border-radius: 30rpx;
	padding: 30rpx;
	background-color: #FFFFFF;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}
.content {
	flex: 1;
	overflow-y: auto;
	max-height: 600rpx;
	line-height: 1.8;
	word-wrap: break-word;
	white-space: pre-wrap;
}
.btn{
	height: 88rpx;
	border-radius: 44rpx;
	background-color: $main-color;
	color: #FFFFFF;
	margin-top: 30rpx;
	flex-shrink: 0;
}
.btn.disabled{
	background-color: #CCCCCC;
}
</style>