<template>
	<view class="bg"></view>
	
	<view class="rel pl30 pr30">
		
		<view class="gap150"></view>
		
		<view class="flex ac mb60" @click="handleLogin">
			<image src="/static/imgs/avatar.png" mode="aspectFill" class="avatar"></image>
			<view class="ml20">
				<view class="size35 bold white">{{ isLogin ? (role === 1 ? '管理员' : '用户') : '点击登录' }}</view>
				<view v-if="isLogin" class="size24 white mt5 flex ac" style="opacity: 0.8;" @click.stop="copy">
					ID：{{ userId.slice(0, 8) }}...
					<image src="/static/imgs/copy.png" class="img30 ml10"></image>
				</view>
			</view>
		</view>
		
		<view class="card mb30" v-if="role==1">
			<view class="size28 bold">登记查询</view>
			<view class="mt30 flex">
				<view class="tc flex1" @click="goLog(0)">
					<image src="/static/imgs/7.png" class="img48"></image>
					<view class="size26 mt10 grey">处理中</view>
				</view>
				<view class="tc flex1" @click="goLog(1)">
					<image src="/static/imgs/8.png" class="img48"></image>
					<view class="size26 mt10 grey">排队中</view>
				</view>
				<view class="tc flex1" @click="goLog(2)">
					<image src="/static/imgs/9.png" class="img48"></image>
					<view class="size26 mt10 grey">已完成</view>
				</view>
			</view>
		</view>
		
		<view class="card">
			<view class="size28 bold mb20">常用功能</view>
			
			<!-- 管理员管理（仅管理员可见） -->
			<view v-if="role === 1" class="flex jb ac pt30 pb20" @click="showAddAdminDialog">
				<view class="flex ac">
					<uni-icons type="personadd" color="#29156a" :size="22"></uni-icons>
					<view class="size28 ml10">管理员管理</view>
				</view>
				<uni-icons type="right" color="#999999" :size="20"></uni-icons>
			</view>
			
			<button open-type="contact" class="btn">
				<view class="flex jb ac pt30 pb30">
					<view class="flex ac">
						<image src="/static/imgs/11.png" class="img38"></image>
						<view class="size28 ml20">联系客服</view>
					</view>
					<uni-icons type="right" color="#999999" :size="20"></uni-icons>
				</view>
			</button>
			
			<view class="flex jb ac pt30 pb20" @click="gorule">
				<view class="flex ac">
					<image src="/static/imgs/12.png" class="img38"></image>
					<view class="size28 ml20">操作指引</view>
				</view>
				<uni-icons type="right" color="#999999" :size="20"></uni-icons>
			</view>
		</view>
	</view>
	
	<!-- 管理员管理弹窗 -->
	<view v-if="showDialog" class="dialog-mask" @click="closeDialog">
		<view class="dialog-content" @click.stop>
			<view class="dialog-header">
				<view class="dialog-title">管理员管理</view>
				<view class="dialog-close" @click="closeDialog">
					<uni-icons type="closeempty" :size="24" color="#999999"></uni-icons>
				</view>
			</view>
			<view class="dialog-body">
				<view class="size26 grey mb20">请输入要操作的用户ID</view>
				<input 
					v-model="targetUserId" 
					class="dialog-input" 
					placeholder="请输入用户ID"
					placeholder-style="color: #CCCCCC;"
				/>
			</view>
			<view class="dialog-footer">
				<view class="dialog-btn remove" @click="confirmRemoveAdmin">移除管理员</view>
				<view class="dialog-btn confirm" @click="confirmAddAdmin">添加管理员</view>
			</view>
		</view>
	</view>
	
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAppStore } from '@/store';
import { storeToRefs } from 'pinia'

const appStore = useAppStore()
const { role, isLogin, userId } = storeToRefs(appStore)

// 处理登录
const handleLogin = async () => {
	if (isLogin.value) {
		// 已登录，不做任何操作
		return
	}
	
	// 未登录，执行微信登录
	try {
		// 获取微信登录code
		const loginRes = await uni.login({
			provider: 'weixin'
		})
		
		if (!loginRes.code) {
			uni.showToast({
				title: '获取登录信息失败',
				icon: 'none'
			})
			return
		}
		
		uni.showLoading({
			title: '登录中...'
		})
		
		// 调用云对象登录
		const userObj = uniCloud.importObject('user')
		const res = await userObj.loginByWeixin({
			code: loginRes.code
		})
		
		uni.hideLoading()
		
		if (res.errCode === 0) {
			// 保存登录信息和角色
			appStore.setLoginInfo(res.data.userInfo, res.data.token)
			
			const roleName = res.data.userInfo.role === 1 ? '(管理员)' : ''
			uni.showToast({
				title: `登录成功${roleName}`,
				icon: 'success'
			})
		} else {
			uni.showToast({
				title: res.errMsg || '登录失败',
				icon: 'none'
			})
		}
	} catch (e: any) {
		uni.hideLoading()
		console.error('登录失败', e)
		uni.showToast({
			title: '登录失败，请重试',
			icon: 'none'
		})
	}
}

const goLog = (type:number) => {
	if(type==0){
		uni.navigateTo({
			url: "/pages/mine/dealing"
		})
	}else if(type==1){
		uni.navigateTo({
			url: "/pages/mine/waiting"
		})
	}else{
		uni.navigateTo({
			url:"/pages/mine/finished"
		})
	}
}

const gorule = () => {
	uni.navigateTo({
		url:"/pages/mine/rule"
	})
}

const copy = () => {
	uni.setClipboardData({
		data:userId.value
	})
}

// 添加管理员相关
const showDialog = ref(false)
const targetUserId = ref('')

// 显示添加管理员弹窗
const showAddAdminDialog = () => {
	showDialog.value = true
	targetUserId.value = ''
}

// 关闭弹窗
const closeDialog = () => {
	showDialog.value = false
	targetUserId.value = ''
}

// 确认添加管理员
const confirmAddAdmin = async () => {
	const userId = targetUserId.value.trim()
	
	if (!userId) {
		uni.showToast({
			title: '请输入用户ID',
			icon: 'none'
		})
		return
	}
	
	uni.showLoading({
		title: '设置中...'
	})
	
	try {
		const userObj = uniCloud.importObject('user')
		const res = await userObj.setUserRole({
			userId: userId,
			role: 1  // 1=管理员
		})
		
		uni.hideLoading()
		
		if (res.errCode === 0) {
			uni.showToast({
				title: '已添加为管理员',
				icon: 'success'
			})
			closeDialog()
		} else {
			uni.showToast({
				title: res.errMsg || '设置失败',
				icon: 'none'
			})
		}
	} catch (e: any) {
		uni.hideLoading()
		console.error('设置管理员失败', e)
		uni.showToast({
			title: e.message || '设置失败，请重试',
			icon: 'none'
		})
	}
}

// 确认移除管理员
const confirmRemoveAdmin = async () => {
	const targetId = targetUserId.value.trim()
	
	if (!targetId) {
		uni.showToast({
			title: '请输入用户ID',
			icon: 'none'
		})
		return
	}
	
	// 检查是否移除自己
	const isSelf = targetId === userId.value
	const confirmContent = isSelf 
		? '确定要移除自己的管理员权限吗？移除后将无法管理其他用户。' 
		: '确定要移除该用户的管理员权限吗？'
	
	// 二次确认
	uni.showModal({
		title: '确认移除',
		content: confirmContent,
		success: async (res) => {
			if (res.confirm) {
				uni.showLoading({
					title: '移除中...'
				})
				
				try {
					const userObj = uniCloud.importObject('user')
					const result = await userObj.setUserRole({
						userId: targetId,
						role: 0  // 0=普通用户
					})
					
					uni.hideLoading()
					
					if (result.errCode === 0) {
						closeDialog()
						
						// 如果移除的是自己，立即更新本地权限
						if (isSelf) {
							console.log('移除了自己的管理员权限，更新本地状态')
							// 更新 store 中的角色
							appStore.setRole(0)
							
							uni.showToast({
								title: '已移除管理员权限，页面已更新',
								icon: 'success',
								duration: 2000
							})
							
							// 可选：重新获取用户信息确保同步
							setTimeout(async () => {
								try {
									const userObj = uniCloud.importObject('user')
									const userInfo = await userObj.getUserInfo()
									if (userInfo.errCode === 0) {
										appStore.setRole(userInfo.data.role)
									}
								} catch (e) {
									console.error('刷新用户信息失败', e)
								}
							}, 500)
						} else {
							uni.showToast({
								title: '已移除管理员权限',
								icon: 'success'
							})
						}
					} else {
						uni.showToast({
							title: result.errMsg || '移除失败',
							icon: 'none'
						})
					}
				} catch (e: any) {
					uni.hideLoading()
					console.error('移除管理员失败', e)
					uni.showToast({
						title: e.message || '移除失败，请重试',
						icon: 'none'
					})
				}
			}
		}
	})
}
</script>

<style lang="scss" scoped>
.bg{
	width: 100vw;
	height: 750rpx;
	background: linear-gradient(#29156a, #F7F7F7);
	position: fixed;
	top: 0;
	left: 0;
}
.avatar{
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	border: 2rpx solid #FFFFFF;
}
.btn{
	padding: 0;
	margin: 0;
	border: none;
	background-color: transparent;
}
.btn::after{
	display: none;
}

/* 弹窗样式 */
.dialog-mask {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.dialog-content {
	width: 600rpx;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	overflow: hidden;
}

.dialog-header {
	position: relative;
	padding: 40rpx 30rpx 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dialog-title {
	font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	color: #333333;
}

.dialog-close {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	padding: 10rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dialog-body {
	padding: 0 30rpx 40rpx;
}

.dialog-input {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx;
	border: 2rpx solid #EEEEEE;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333333;
	box-sizing: border-box;
}

.dialog-footer {
	display: flex;
	border-top: 2rpx solid #EEEEEE;
}

.dialog-btn {
	flex: 1;
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	color: #333333;
}

.dialog-btn.remove {
	border-right: 2rpx solid #EEEEEE;
	color: #FF3B30;
	font-weight: 500;
}

.dialog-btn.confirm {
	color: #29156a;
	font-weight: bold;
}
</style>