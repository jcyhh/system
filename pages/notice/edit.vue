<template>
	<view class="pl30 pr30 pt30">
		<view class="size28 mb10">公告标题</view>
		<input class="input mb30" v-model="formData.title" placeholder="请输入公告标题" />
		
		<view class="size28 mb10">公告内容</view>
		<textarea 
			class="textarea mb30" 
			v-model="formData.content" 
			placeholder="请输入公告内容，支持HTML格式" 
			:auto-height="true"
			:maxlength="-1"
		/>
		
		<view class="setting-item flex jb ac mb20">
			<view class="size28">是否发布</view>
			<switch :checked="formData.is_published" @change="onPublishChange" />
		</view>
		
		<view class="setting-item flex jb ac mb30">
			<view class="size28">是否弹窗展示</view>
			<switch :checked="formData.is_popup" @change="onPopupChange" />
		</view>
		
		<view class="btn flex jc ac" @click="submitForm">
			{{ isEdit ? '保存修改' : '创建公告' }}
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const isEdit = ref(false)
const noticeId = ref('')

const formData = ref({
	title: '',
	content: '',
	is_published: true,
	is_popup: false
})

// 开关切换
const onPublishChange = (e: any) => {
	formData.value.is_published = e.detail.value
}

const onPopupChange = (e: any) => {
	formData.value.is_popup = e.detail.value
}

// 加载公告详情（编辑时）
const loadNoticeDetail = async (id: string) => {
	try {
		const noticeObj = uniCloud.importObject('notice')
		const res = await noticeObj.getDetail({ id })
		
		if (res.errCode === 0) {
			formData.value = {
				title: res.data.title,
				content: res.data.content,
				is_published: res.data.is_published,
				is_popup: res.data.is_popup || false
			}
		} else {
			uni.showToast({
				title: res.errMsg || '获取失败',
				icon: 'none'
			})
		}
	} catch (e: any) {
		console.error('获取公告详情失败：', e)
		uni.showToast({
			title: e.message || '获取失败',
			icon: 'none'
		})
	}
}

// 提交表单
const submitForm = async () => {
	// 验证
	if (!formData.value.title.trim()) {
		uni.showToast({
			title: '请输入公告标题',
			icon: 'none'
		})
		return
	}
	
	if (!formData.value.content.trim()) {
		uni.showToast({
			title: '请输入公告内容',
			icon: 'none'
		})
		return
	}
	
	try {
		uni.showLoading({
			title: isEdit.value ? '保存中...' : '创建中...'
		})
		
		const noticeObj = uniCloud.importObject('notice')
		let result
		
		if (isEdit.value) {
			// 编辑
			result = await noticeObj.update({
				id: noticeId.value,
				title: formData.value.title.trim(),
				content: formData.value.content.trim(),
				is_published: formData.value.is_published,
				is_popup: formData.value.is_popup
			})
		} else {
			// 新增
			result = await noticeObj.create({
				title: formData.value.title.trim(),
				content: formData.value.content.trim(),
				is_published: formData.value.is_published,
				is_popup: formData.value.is_popup
			})
		}
		
		uni.hideLoading()
		
		if (result.errCode === 0) {
			uni.showToast({
				title: isEdit.value ? '保存成功' : '创建成功',
				icon: 'success',
				duration: 1500
			})
			
			// 延迟返回，让用户看到提示
			setTimeout(() => {
				uni.navigateBack({
					delta: 1
				})
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

onLoad((options) => {
	if (options?.id) {
		// 编辑模式
		isEdit.value = true
		noticeId.value = options.id
		loadNoticeDetail(options.id)
		
		uni.setNavigationBarTitle({
			title: '编辑公告'
		})
	} else {
		// 新增模式
		uni.setNavigationBarTitle({
			title: '添加公告'
		})
	}
})
</script>

<style lang="scss" scoped>
.input {
	width: 100%;
	height: 80rpx;
	border: 1px solid #E5E5E5;
	border-radius: 10rpx;
	padding: 0 20rpx;
	box-sizing: border-box;
	font-size: 28rpx;
	background-color: #FFFFFF;
}

.textarea {
	width: 100%;
	min-height: 400rpx;
	border: 1px solid #E5E5E5;
	border-radius: 10rpx;
	padding: 20rpx;
	box-sizing: border-box;
	font-size: 28rpx;
	line-height: 1.6;
	background-color: #FFFFFF;
}

.setting-item {
	padding: 20rpx 0;
	border-bottom: 1px solid #F5F5F5;
}

.btn {
	width: 100%;
	height: 88rpx;
	border-radius: 44rpx;
	background-color: $main-color;
	color: #FFFFFF;
	font-size: 32rpx;
	margin-top: 60rpx;
}
</style>