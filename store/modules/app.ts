import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {

    const role = ref(0)
    const isLogin = ref(false)
    const userId = ref('')
    const token = ref('')

    // 设置登录信息
    const setLoginInfo = (info: any, tokenStr: string) => {
        isLogin.value = true
        userId.value = info._id || info.uid || ''
        role.value = info.role || 0  // 0-普通用户, 1-管理员
        token.value = tokenStr
        
        // 保存到本地存储
        uni.setStorageSync('uni_id_token', tokenStr)
        uni.setStorageSync('userId', userId.value)
        uni.setStorageSync('role', role.value)
    }

    // 清除登录信息
    const clearLoginInfo = () => {
        isLogin.value = false
        userId.value = ''
        role.value = 0
        token.value = ''
        
        // 清除本地存储
        uni.removeStorageSync('uni_id_token')
        uni.removeStorageSync('userId')
        uni.removeStorageSync('role')
    }

    // 从本地存储恢复登录状态
    const restoreLoginState = () => {
        const savedToken = uni.getStorageSync('uni_id_token')
        const savedUserId = uni.getStorageSync('userId')
        const savedRole = uni.getStorageSync('role')
        
        if (savedToken && savedUserId) {
            isLogin.value = true
            token.value = savedToken
            userId.value = savedUserId
            role.value = savedRole || 0
        }
    }

    return {
        role,
        isLogin,
        userId,
        token,
        setLoginInfo,
        clearLoginInfo,
        restoreLoginState
    }
})