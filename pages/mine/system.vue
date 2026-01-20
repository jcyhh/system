<template>
	<view class="page">
		<view class="container">
			<view class="card mb30">
				<view class="card-header">
					<view class="title size32 bold">平台排队开关</view>
					<view class="desc size24 gray mt10">关闭后用户将无法提交排队申请</view>
				</view>
				<view class="card-body">
					<view class="switch-item">
						<view class="switch-info">
							<view class="switch-label size30">排队功能</view>
							<view class="switch-status size26" :class="queueSwitch ? 'status-on' : 'status-off'">
								{{ queueSwitch ? '已开启' : '已关闭' }}
							</view>
						</view>
						<switch :checked="queueSwitch" @change="onSwitchChange" :disabled="loading" color="#29156a" />
					</view>
				</view>
			</view>
			
			<view class="tips">
				<view class="tip-item size26 gray">
					<text>• 关闭排队功能后，用户无法提交新的排队申请</text>
				</view>
				<view class="tip-item size26 gray">
					<text>• 已经在排队中的任务不受影响</text>
				</view>
				<view class="tip-item size26 gray">
					<text>• 建议在系统维护或特殊情况时使用</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useAppStore } from '@/store'

const appStore = useAppStore()

const queueSwitch = ref(true)
const switchId = ref('')
const loading = ref(false)

// 加载排队开关状态
const loadQueueSwitch = async () => {
	try {
		const db = uniCloud.database()
		const res = await db.collection('system_info')
			.where({
				key: 'queue_switch'
			})
			.limit(1)
			.get()
		
		if (res.result && res.result.data && res.result.data.length > 0) {
			const data = res.result.data[0]
			switchId.value = data._id
			queueSwitch.value = data.content === 'true'
		} else {
			// 如果没有找到配置，提示添加
			uni.showModal({
				title: '提示',
				content: '未找到排队开关配置，请先在数据库中添加 queue_switch 配置',
				showCancel: false
			})
		}
	} catch (e) {
		console.error('加载排队开关失败：', e)
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	}
}

// 开关变更
const onSwitchChange = (e: any) => {
	const newValue = e.detail.value
	
	uni.showModal({
		title: '确认操作',
		content: `确定要${newValue ? '开启' : '关闭'}排队功能吗？`,
		success: async (res) => {
			if (res.confirm) {
				await updateQueueSwitch(newValue)
			}
		}
	})
}

// 更新排队开关
const updateQueueSwitch = async (value: boolean) => {
	if (!switchId.value) {
		uni.showToast({
			title: '配置ID不存在',
			icon: 'none'
		})
		return
	}
	
	loading.value = true
	uni.showLoading({
		title: '保存中...'
	})
	
	try {
		const db = uniCloud.database()
		await db.collection('system_info')
			.doc(switchId.value)
			.update({
				content: value ? 'true' : 'false',
				update_time: Date.now()
			})
		
		queueSwitch.value = value
		uni.hideLoading()
		uni.showToast({
			title: value ? '已开启排队' : '已关闭排队',
			icon: 'success'
		})
	} catch (e) {
		console.error('更新排队开关失败：', e)
		uni.hideLoading()
		uni.showToast({
			title: '保存失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}

// 检查管理员权限
const checkAdmin = () => {
	if (appStore.role !== 1) {
		uni.showModal({
			title: '权限不足',
			content: '仅管理员可以访问此页面',
			showCancel: false,
			success: () => {
				uni.navigateBack()
			}
		})
		return false
	}
	return true
}

onLoad(() => {
	if (checkAdmin()) {
		loadQueueSwitch()
	}
})

onShow(() => {
	if (checkAdmin()) {
		loadQueueSwitch()
	}
})
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background-color: #F5F5F5;
}

.container {
	padding: 30rpx;
}

.card {
	background-color: #FFFFFF;
	border-radius: 20rpx;
	overflow: hidden;
}

.card-header {
	padding: 30rpx;
	border-bottom: 1rpx solid #EEEEEE;
}

.title {
	color: #333333;
}

.desc {
	margin-top: 10rpx;
}

.card-body {
	padding: 30rpx;
}

.switch-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.switch-info {
	flex: 1;
}

.switch-label {
	color: #333333;
	font-weight: 500;
}

.switch-status {
	margin-top: 10rpx;
	font-weight: 500;
}

.status-on {
	color: #29156a;
}

.status-off {
	color: #999999;
}

.tips {
	padding: 30rpx 0;
}

.tip-item {
	margin-bottom: 20rpx;
	line-height: 1.6;
}
</style>
