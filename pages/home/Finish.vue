<template>
	<uni-popup ref="popupRef" type="center" :mask-click="false">
		<view class="pop">
			<view class="flex jb ac">
				<uni-icons type="closeempty" color="#FFFFFF" :size="25"></uni-icons>
				<view class="size30 bold">装卸完成</view>
				<uni-icons type="closeempty" :size="25" @click="close()"></uni-icons>
			</view>
			
			<view class="mt60">
				<view class="tc size26 gray mb20">请上传装卸完成照片</view>
				
				<view class="flex jc">
					<view class="upload flex jc ac" @click="chooseImage" v-if="!photoUrl">
					<uni-icons type="plusempty" :size="50" color="#999999"></uni-icons>
					</view>
					<view class="upload rel" v-else>
						<image :src="photoUrl" mode="aspectFill" class="upload-img"></image>
						<view class="del-btn" @click.stop="deleteImage">
							<uni-icons type="closeempty" :size="20" color="#FFFFFF"></uni-icons>
						</view>
					</view>
				</view>
			</view>
			
			<view class="mt50 btn flex jc ac" @click="submit" :class="{ disabled: !photoUrl }">
				确认完成
			</view>
		</view>
	</uni-popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const popupRef = ref()
const photoUrl = ref('')
const taskId = ref('')

const open = (id?: string) => {
	taskId.value = id || ''
	photoUrl.value = ''
	popupRef.value?.open()
}

const close = () => {
	popupRef.value?.close()
	photoUrl.value = ''
	taskId.value = ''
}

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
					cloudPath: `trucks/complete_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
				})
				
				photoUrl.value = uploadRes.fileID
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
	photoUrl.value = ''
}

// 提交完成
const submit = async () => {
	if (!photoUrl.value) {
		uni.showToast({
			title: '请先上传照片',
			icon: 'none'
		})
		return
	}
	
	if (!taskId.value) {
		uni.showToast({
			title: '任务ID不存在',
			icon: 'none'
		})
		return
	}
	
	uni.showLoading({
		title: '提交中...'
	})
	
	try {
		const truckObj = uniCloud.importObject('truck')
		const res = await truckObj.complete({
			id: taskId.value,
			complete_photo: photoUrl.value
		})
		
		uni.hideLoading()
		
		if (res.errCode === 0) {
			uni.showToast({
				title: '操作成功',
				icon: 'success'
			})
			
			// 关闭弹窗
			close()
			
			// 通知首页刷新
			uni.$emit('refreshHome')
		} else {
	uni.showToast({
				title: res.errMsg || '操作失败',
				icon: 'none'
			})
		}
	} catch (e: any) {
		uni.hideLoading()
		uni.showToast({
			title: e.message || '提交失败',
			icon: 'none'
		})
		console.error('提交失败：', e)
	}
}

defineExpose({
	open,
	close
})
</script>

<style lang="scss" scoped>
.pop{
	width: 600rpx;
	border-radius: 30rpx;
	padding: 30rpx;
	background-color: #FFFFFF;
}
	.upload{
		width: 400rpx;
		height: 400rpx;
		border-radius: 20px;
	background-color: #F7F7F7;
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
	margin-top: 30rpx;
	}
.btn.disabled{
	background-color: #CCCCCC;
}
</style>
