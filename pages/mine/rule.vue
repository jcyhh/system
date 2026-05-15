<template>
	<view class="rule-page">
		<view class="rule-title">📋 排队系统使用说明</view>
		
		<view class="rule-section">
			<view class="section-title">1️⃣ 如何排队</view>
			<view class="section-content">
			• 点击首页"我要排队"按钮<br/>
			• 填写姓名、手机号、车牌号（标准格式，如：苏A12345）<br/>
			• 选择车型（依维柯/3.8米/4.2米/7.6米/9.6米/13.5米/17.5米及以上）<br/>
				• 选择装车或卸车<br/>
				• 如果是卸车，需填写装货省市区和详细地址<br/>
				• 上传水印相机照片<br/>
				• 勾选同意用户协议和隐私政策<br/>
				• 点击"提交排队"完成
			</view>
		</view>
		
		<view class="rule-section">
			<view class="section-title">2️⃣ 排队状态</view>
			<view class="section-content">
				<view class="status-item">
					<text class="status-badge processing">处理中</text>
					<text>您的车辆正在装卸货，请按指引操作</text>
				</view>
				<view class="status-item">
					<text class="status-badge waiting">排队中</text>
					<text>请耐心等待，首页可查看当前排号</text>
				</view>
			</view>
		</view>
		
		<view class="rule-section">
			<view class="section-title">3️⃣ 修改信息</view>
			<view class="section-content">
				• 排队后如需修改信息，点击首页"修改信息"<br/>
				• 修改后重新提交即可<br/>
				• 修改不影响您的排队顺序
			</view>
		</view>
		
		<view class="rule-section">
			<view class="section-title">4️⃣ 完成流程</view>
			<view class="section-content">
				• 当您的车辆完成装卸货后<br/>
				• 点击首页"完成"按钮<br/>
				• 上传现场照片作为凭证<br/>
				• 提交后自动进入下一位的排队流程
			</view>
		</view>
		
		<view class="rule-section">
			<view class="section-title">5️⃣ 消息通知</view>
			<view class="section-content">
				• 排队成功后会收到微信服务通知<br/>
				• 快轮到您时会提前提醒<br/>
				• 轮到您时会立即通知<br/>
				• 请保持微信消息通知开启
			</view>
		</view>
		
		<view class="rule-tips">
			<view class="tips-title">💡 温馨提示</view>
			<view class="tips-content">
				• 请提前15-30分钟到达现场排队<br/>
				• 每次只能提交一个排队申请<br/>
				• 请保持联系电话畅通<br/>
				• 如有问题请联系现场工作人员
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'Rule'
}
</script>

<style scoped>
.rule-page {
	padding: 30rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.rule-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
	margin-bottom: 40rpx;
}

.rule-section {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.section-content {
	font-size: 28rpx;
	color: #666;
	line-height: 48rpx;
}

.status-item {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;
}

.status-badge {
	display: inline-block;
	padding: 4rpx 16rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	margin-right: 15rpx;
	flex-shrink: 0;
}

.status-badge.processing {
	background-color: #e8f4ff;
	color: #1890ff;
}

.status-badge.waiting {
	background-color: #fff7e6;
	color: #fa8c16;
}

.rule-tips {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16rpx;
	padding: 30rpx;
	margin-top: 20rpx;
}

.tips-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 15rpx;
}

.tips-content {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.95);
	line-height: 48rpx;
}
</style>