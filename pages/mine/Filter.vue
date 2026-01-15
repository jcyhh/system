<template>
	<uni-popup ref="popupRef" type="center">
		<view class="pop">
			<view class="flex jb ac mb40">
				<uni-icons type="closeempty" color="#FFFFFF" :size="25"></uni-icons>
				<view class="size30 bold">筛选</view>
				<uni-icons type="closeempty" :size="25" @click="popupRef?.close()"></uni-icons>
			</view>
			<picker @change="typesChange" :value="typeCur" :range="types">
				<view class="box flex jb ac">
					<view class="size28">车型</view>
					<view class="flex ac">
						<view class="size28 mr10">{{types[typeCur]}}</view>
						<uni-icons type="down" :size="20" color="#999999"></uni-icons>
					</view>
				</view>
			</picker>
			<picker class="mt20" @change="kindsChange" :value="cur" :range="kinds">
				<view class="box flex jb ac">
					<view class="size28">装卸车</view>
					<view class="flex ac">
						<view class="size28 mr10">{{kinds[cur]}}</view>
						<uni-icons type="down" :size="20" color="#999999"></uni-icons>
					</view>
				</view>
			</picker>
			<view class="flex jb ac mt20">
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
			<view class="box mt20 flex ac">
				<uni-icons type="search" :size="20" color="#666666"></uni-icons>
				<input type="text" v-model="carNo" placeholder="请输入车牌号" class="flex1 size28 ml20" />
			</view>
			<view class="box mt20 flex ac">
				<uni-icons type="search" :size="20" color="#666666"></uni-icons>
				<input type="text" v-model="phoneNo" placeholder="请输入手机号" class="flex1 size28 ml20" />
			</view>
			<view class="box mt20 flex ac">
				<uni-icons type="search" :size="20" color="#666666"></uni-icons>
				<input type="text" v-model="name" placeholder="请输入姓名" class="flex1 size28 ml20" />
			</view>
			<view class="flex mt30">
				<view class="cancel flex1 flex jc ac" @click="reset">重置</view>
				<view class="submit flex1 flex jc ac ml30" @click="submit">确认</view>
			</view>
		</view>
	</uni-popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emits = defineEmits(['submit'])

const popupRef = ref()

const typeCur = ref(0)
const types = [
	'全部',
	'依维柯',
	'3.8米',
	'4.2米',
	'7.6米',
	'9.6米',
	'13.5米',
	'17.5米及以上'
]
const typesChange = (e:any) => typeCur.value = e.detail.value

const cur = ref(0)
const kinds = [
	'全部',
	'装车',
	'卸车'
]
const kindsChange = (e:any) => cur.value = e.detail.value

const startTime = ref()
const startChange = (e:any) => startTime.value = e.detail.value

const endTime = ref()
const endChange = (e:any) => endTime.value = e.detail.value

const carNo = ref()
const phoneNo = ref()
const name = ref()

const open = () => popupRef.value?.open()

const reset = () => {
	typeCur.value = 0
	cur.value = 0
	startTime.value = ''
	endTime.value = ''
	carNo.value = ''
	phoneNo.value = ''
	name.value = ''
	emits('submit', {
		tags: [],
		params: {}
	})
	popupRef.value?.close()
}

const submit = () => {
	let arr = []
	let obj = {}
	if(typeCur.value > 0){
		arr.push(types[typeCur.value])
		obj['carType'] = typeCur.value - 1
	}
	if(cur.value > 0){
		arr.push(kinds[cur.value])
		obj['type'] = cur.value - 1
	}
	if(startTime.value && endTime.value){
		arr.push(`${startTime.value} ~ ${endTime.value}`)
		obj['startTime'] = startTime.value
		obj['endTime'] = endTime.value
	}
	if(carNo.value){
		arr.push(carNo.value)
		obj['cardNo'] = carNo.value
	}
	if(phoneNo.value){
		arr.push(phoneNo.value)
		obj['phoneNo'] = phoneNo.value
	}
	if(name.value){
		arr.push(name.value)
		obj['name'] = name.value
	}
	emits('submit', {
		tags: arr,
		params: obj
	})
	popupRef.value?.close()
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
		.upload{
			width: 400rpx;
			height: 400rpx;
			border-radius: 20px;
			background-color: #eeeeee;
		}
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