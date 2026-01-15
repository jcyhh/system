<template>
	<view class="pl30 pr30 pt30">
		
		<view class="card mb20" v-for="item in noticeList" :key="item._id">
			<view @click="goDetail(item._id)">
				<view class="flex jb ac">
					<view class="size32 bold line2 flex1">{{ item.title }}</view>
					<view class="flex ac" v-if="isAdmin">
						<view class="status-tag unpublish" v-if="!item.is_published">未发布</view>
						<view class="status-tag popup ml10" v-if="item.is_popup">弹窗</view>
					</view>
				</view>
				<view class="flex jb ac mt20">
					<view class="size24 gray">{{ formatTime(item.create_time) }}</view>
					<view class="flex ac" v-if="isAdmin" @click.stop>
						<uni-icons type="compose" :size="20" @click="editNotice(item)"></uni-icons>
						<uni-icons type="trash" :size="20" color="#dd524d" class="ml30" @click="deleteNotice(item)"></uni-icons>
					</view>
				</view>
			</view>
		</view>
		
		<view class="tc mt60 size28 gray" v-if="noticeList.length === 0 && !isLoading">
			<view class="flex jc">
				<image src="@/static/imgs/nodata.png" class="img200"></image>
			</view>
			暂无公告
		</view>
		
		<!-- 加载状态 -->
		<view class="tc size28 gray mt30 mb30" v-if="isLoading">
			加载中...
		</view>
		<view class="tc size28 gray mt30 mb30" v-else-if="!hasMore && noticeList.length > 0">
			没有更多了
		</view>
		
	</view>
	
	<view class="gap130" v-if="isAdmin"></view>
	<view class="safeBottom"></view>
	<view class="btn flex jc ac" v-if="isAdmin" @click="addNotice">添加公告</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad, onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useAppStore } from '@/store';

const appStore = useAppStore()

const noticeList = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const isLoading = ref(false)

// 判断是否是管理员
const isAdmin = computed(() => {
	return appStore.isLogin && appStore.role === 1
})

// 加载公告列表
const loadNoticeList = async (isRefresh = false) => {
	if (isLoading.value) return
	if (!hasMore.value && !isRefresh) return
	
	try {
		isLoading.value = true
		
		// 如果是刷新，重置页码
		if (isRefresh) {
			page.value = 1
			hasMore.value = true
		}
		
		const noticeObj = uniCloud.importObject('notice')
		const res = await noticeObj.getList({
			page: page.value,
			pageSize: pageSize,
			showAll: isAdmin.value // 管理员显示所有公告
		})
		
		if (res.errCode === 0) {
			if (isRefresh) {
				noticeList.value = res.data.list
			} else {
				noticeList.value = [...noticeList.value, ...res.data.list]
			}
			
			// 判断是否还有更多数据
			if (res.data.list.length < pageSize) {
				hasMore.value = false
			}
			
			// 加载成功，页码+1
			if (res.data.list.length > 0) {
				page.value++
			}
		} else {
			uni.showToast({
				title: res.errMsg || '获取失败',
				icon: 'none'
			})
		}
	} catch (e: any) {
		console.error('获取失败：', e)
		uni.showToast({
			title: e.message || '获取失败',
			icon: 'none'
		})
	} finally {
		isLoading.value = false
	}
}

// 格式化时间
const formatTime = (timestamp: number) => {
	const date = new Date(timestamp)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	return `${year}-${month}-${day} ${hour}:${minute}`
}

// 跳转到详情页
const goDetail = (id: string) => {
	uni.navigateTo({
		url: `/pages/notice/detail?id=${id}`
	})
}

// 添加公告
const addNotice = () => {
	uni.navigateTo({
		url: '/pages/notice/edit'
	})
}

// 编辑公告
const editNotice = (item: any) => {
	uni.navigateTo({
		url: `/pages/notice/edit?id=${item._id}`
	})
}

// 删除公告
const deleteNotice = (item: any) => {
	uni.showModal({
		title: '提示',
		content: '确定要删除这条公告吗？',
		success: async (res) => {
			if (res.confirm) {
				try {
					const noticeObj = uniCloud.importObject('notice')
					const result = await noticeObj.delete({ id: item._id })
					
					if (result.errCode === 0) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						// 刷新列表
						await loadNoticeList(true)
					} else {
						uni.showToast({
							title: result.errMsg || '删除失败',
							icon: 'none'
						})
					}
				} catch (e: any) {
					console.error('删除失败：', e)
					uni.showToast({
						title: e.message || '删除失败',
						icon: 'none'
					})
				}
			}
		}
	})
}

// 页面加载
onLoad(() => {
	loadNoticeList(true)
})

// 页面显示时刷新列表（从编辑页返回时）
onShow(() => {
	// 不是首次加载时才刷新
	if (noticeList.value.length > 0) {
		loadNoticeList(true)
	}
})

// 下拉刷新
onPullDownRefresh(async () => {
	try {
		await loadNoticeList(true)
		uni.showToast({
			title: '刷新成功',
			icon: 'success'
		})
	} catch (e) {
		console.error('刷新失败：', e)
	} finally {
		uni.stopPullDownRefresh()
	}
})

// 触底加载更多
onReachBottom(() => {
	loadNoticeList()
})
</script>

<style lang="scss" scoped>
.line2 {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
}

.status-tag {
	padding: 4rpx 16rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
	white-space: nowrap;
	
	&.unpublish {
		background-color: #FFF3E0;
		color: #FF9800;
	}
	
	&.popup {
		background-color: #E3F2FD;
		color: #2196F3;
	}
}

.btn{
	width: 690rpx;
	height: 88rpx;
	border-radius: 44rpx;
	background-color: $main-color;
	color: #FFFFFF;
	position: fixed;
	bottom: calc(var(--safe-area-inset-bottom) + 30rpx);
	left: 30rpx;
}
</style>
