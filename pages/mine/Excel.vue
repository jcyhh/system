<template>
	<uni-popup ref="popupRef" type="center">
		<view class="pop">
			<view class="flex jb ac mb40">
				<uni-icons type="closeempty" color="#FFFFFF" :size="25"></uni-icons>
				<view class="size30 bold">导出数据</view>
				<uni-icons type="closeempty" :size="25" @click="popupRef?.close()"></uni-icons>
			</view>
			<view class="flex jb ac">
				<view class="flex1">
					<picker mode="date" :value="startTime" @change="startChange">
						<view class="box flex jc ac size28">
							<view v-if="startTime">{{ startTime }}</view>
							<view class="grey" v-else>开始日期</view>
						</view>
					</picker>
				</view>
				<view class="ml20 mr20 size28">~</view>
				<view class="flex1">
					<picker mode="date" :value="endTime" @change="endChange">
						<view class="box flex jc ac size28">
							<view v-if="endTime">{{ endTime }}</view>
							<view class="grey" v-else>结束日期</view>
						</view>
					</picker>
				</view>
			</view>
			<view class="size28 grey mt30">导出数据为开始日期的08:00 ～ 结束日期的08:00</view>
			
			<view class="flex mt30">
				<view class="cancel flex1 flex jc ac" @click="reset">取消</view>
				<view class="submit flex1 flex jc ac ml30" @click="submit">导出</view>
			</view>
		</view>
	</uni-popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emits = defineEmits(['submit'])

const popupRef = ref()

const startTime = ref()
const startChange = (e:any) => startTime.value = e.detail.value

const endTime = ref()
const endChange = (e:any) => endTime.value = e.detail.value

const open = () => popupRef.value?.open()

const reset = () => {
	popupRef.value?.close()
}

const submit = async () => {
	if (!startTime.value || !endTime.value) {
		uni.showToast({
			title: '请选择完整的时间区间',
			icon: 'none'
		})
		return
	}
	
	// 检查时间顺序
	if (new Date(startTime.value) > new Date(endTime.value)) {
		uni.showToast({
			title: '开始日期不能晚于结束日期',
			icon: 'none'
		})
		return
	}
	
	try {
		uni.showLoading({ title: '导出中...' })
		
		// 计算时间戳（开始日期08:00 到 结束日期08:00）
		// 使用iOS兼容的日期格式
		const start_time = new Date(startTime.value.replace(/-/g, '/') + ' 08:00:00').getTime()
		const end_time = new Date(endTime.value.replace(/-/g, '/') + ' 08:00:00').getTime()
		
		// 调用云函数导出Excel
		const truckObj = uniCloud.importObject('truck')
		const res = await truckObj.exportExcel({
			start_time,
			end_time
		})
		
		uni.hideLoading()
		
		if (res.errCode === 0) {
			// 下载临时文件
			const downloadRes = await uni.downloadFile({
				url: res.data.fileUrl
			})
			
			if (downloadRes.statusCode === 200) {
				// 分享文件到微信
				// #ifdef MP-WEIXIN
				uni.shareFileMessage({
					filePath: downloadRes.tempFilePath,
					fileName: res.data.fileName || `已完成单子_${startTime.value}_${endTime.value}.xlsx`,
					success: () => {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						})
						popupRef.value?.close()
					},
					fail: (err: any) => {
						console.error('分享失败：', err)
						uni.showToast({
							title: '分享失败',
							icon: 'none'
						})
					}
				})
				// #endif
				
				// #ifndef MP-WEIXIN
				uni.showToast({
					title: '非微信环境，无法分享',
					icon: 'none'
				})
				// #endif
			} else {
				uni.showToast({
					title: '文件下载失败',
					icon: 'none'
				})
			}
		} else {
			uni.showToast({
				title: res.errMsg || '导出失败',
				icon: 'none'
			})
		}
	} catch (e: any) {
		uni.hideLoading()
		console.error('导出失败：', e)
		uni.showToast({
			title: e.message || '导出失败',
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
		width: 680rpx;
		border-radius: 30rpx;
		padding: 30rpx;
		background-color: #FFFFFF;
		.cancel{
			height: 88rpx;
			border-radius: 20rpx;
			background-color: #eeeeee;
		}
		.submit{
			height: 88rpx;
			border-radius: 20rpx;
			background-color: $main-color;
			color: #FFFFFF;
		}
	}
</style>
