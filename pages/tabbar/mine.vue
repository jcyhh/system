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
	
</template>

<script lang="ts" setup>
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
			
			const roleName = res.data.userInfo.role === 1 ? '管理员' : '普通用户'
			uni.showToast({
				title: `登录成功 (${roleName})`,
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
</style>