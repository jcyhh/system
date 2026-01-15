<script>
	import { useAppStore } from '@/store'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			
			// 恢复登录状态
			const appStore = useAppStore()
			appStore.restoreLoginState()
			
			// 验证token是否有效
			this.checkToken()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			async checkToken() {
				const appStore = useAppStore()
				
				if (!appStore.token) {
					return
				}
				
				try {
					const userObj = uniCloud.importObject('user')
					const res = await userObj.getUserInfo()
					
					if (res.errCode === 0) {
						// token有效，更新用户信息和角色
						appStore.setLoginInfo(res.data, appStore.token)
						console.log('登录状态有效，角色：', res.data.role === 1 ? '管理员' : '普通用户')
					} else {
						// token无效，清除登录信息
						appStore.clearLoginInfo()
						console.log('登录已过期')
					}
				} catch (e) {
					console.error('验证登录状态失败', e)
					appStore.clearLoginInfo()
				}
			}
		}
	}
</script>

<style lang="scss">
@import '@/styles/index.scss';
page{
	background-color: #F7F7F7;
}
</style>
