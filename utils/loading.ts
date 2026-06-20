type LoadingOptions = {
	title?: string
	mask?: boolean
}

let timer: ReturnType<typeof setTimeout> | null = null
let loadingCount = 0
let isShowing = false

const DEFAULT_DELAY = 500

export const showDelayedLoading = (options: LoadingOptions = {}, delay = DEFAULT_DELAY) => {
	loadingCount++
	
	if (isShowing || timer) return
	
	timer = setTimeout(() => {
		timer = null
		if (loadingCount <= 0) return
		
		isShowing = true
		uni.showLoading({
			title: options.title || '加载中...',
			mask: options.mask ?? true
		})
	}, delay)
}

export const hideDelayedLoading = () => {
	if (loadingCount > 0) {
		loadingCount--
	}
	
	if (loadingCount > 0) return
	
	if (timer) {
		clearTimeout(timer)
		timer = null
	}
	
	if (isShowing) {
		isShowing = false
		uni.hideLoading()
	}
}
