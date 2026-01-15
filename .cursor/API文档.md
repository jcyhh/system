# 仓库卸货管理系统 - API文档

## 概述

本系统基于 uniCloud 开发，用于管理仓库卸货排队流程。

## 云对象列表

### 1. truck（卸货管理）
### 2. user（用户管理）

---

## 一、truck 云对象

### 1.1 司机到达登记

**方法名：** `register`

**请求方法：** POST

**功能说明：** 司机到达仓库时进行登记，自动分配排队号

**请求参数：**

```javascript
{
  driver_name: String,    // 司机姓名（必填）
  phone: String,          // 联系电话（必填，格式：1[3-9]开头的11位手机号）
  plate_number: String,   // 车牌号（必填）
  truck_length: String,   // 车长（必填，如："9.6米"）
  loading_place: String,  // 装货地点（必填）
  arrival_photo: String   // 到达照片URL（选填）
}
```

**返回示例：**

```javascript
// 成功
{
  errCode: 0,
  errMsg: '登记成功',
  data: {
    id: 'record-id-xxx',
    queue_number: 5,        // 排队号
    status: 'waiting'       // 或 'processing'（第一个则为处理中）
  }
}

// 失败
{
  errCode: 400,
  errMsg: '您还有未完成的卸货任务，请勿重复登记'
}
```

**前端调用示例：**

```javascript
const truck = uniCloud.importObject('truck')

async function register() {
  try {
    const res = await truck.register({
      driver_name: '张三',
      phone: '13800138000',
      plate_number: '京A12345',
      truck_length: '9.6米',
      loading_place: '北京市朝阳区',
      arrival_photo: 'cloud://xxx.jpg'
    })
    
    if (res.errCode === 0) {
      console.log('登记成功，排队号：', res.data.queue_number)
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

### 1.2 完成卸货

**方法名：** `complete`

**请求方法：** POST

**功能说明：** 卸货完成后登记，自动将下一个排队中的改为处理中

**请求参数：**

```javascript
{
  id: String,            // 记录ID（必填）
  unload_photo: String   // 卸货完成照片URL（选填）
}
```

**返回示例：**

```javascript
// 成功
{
  errCode: 0,
  errMsg: '卸货完成',
  data: {
    id: 'record-id-xxx'
  }
}

// 失败
{
  errCode: 400,
  errMsg: '当前状态不允许完成操作'
}
```

**前端调用示例：**

```javascript
const truck = uniCloud.importObject('truck')

async function complete(recordId) {
  try {
    const res = await truck.complete(recordId, 'cloud://xxx-unload.jpg')
    
    if (res.errCode === 0) {
      uni.showToast({ title: '卸货完成' })
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

### 1.3 获取排队列表

**方法名：** `getList`

**请求方法：** GET

**功能说明：** 获取排队列表，支持状态筛选和分页

**请求参数：**

```javascript
{
  status: String,      // 状态筛选（选填）：'all'-全部, 'waiting'-排队中, 'processing'-处理中, 'completed'-已完成
  page: Number,        // 页码，默认1
  pageSize: Number     // 每页数量，默认20
}
```

**返回示例：**

```javascript
{
  errCode: 0,
  errMsg: '获取成功',
  data: {
    list: [
      {
        _id: 'xxx',
        driver_name: '张三',
        phone: '13800138000',
        plate_number: '京A12345',
        truck_length: '9.6米',
        loading_place: '北京市朝阳区',
        arrival_time: 1704326400000,
        arrival_photo: 'cloud://xxx.jpg',
        unload_time: null,
        unload_photo: '',
        status: 'processing',
        queue_number: 1,
        create_time: 1704326400000,
        update_time: 1704326400000
      }
    ],
    total: 50,
    page: 1,
    pageSize: 20
  }
}
```

**前端调用示例：**

```javascript
const truck = uniCloud.importObject('truck')

async function getList() {
  try {
    const res = await truck.getList('waiting', 1, 20)
    
    if (res.errCode === 0) {
      console.log('列表数据：', res.data.list)
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

### 1.4 获取单条记录详情

**方法名：** `getDetail`

**请求方法：** GET

**功能说明：** 根据记录ID获取详情

**请求参数：**

```javascript
{
  id: String  // 记录ID（必填）
}
```

**返回示例：**

```javascript
{
  errCode: 0,
  errMsg: '获取成功',
  data: {
    _id: 'xxx',
    driver_name: '张三',
    phone: '13800138000',
    plate_number: '京A12345',
    truck_length: '9.6米',
    loading_place: '北京市朝阳区',
    arrival_time: 1704326400000,
    arrival_photo: 'cloud://xxx.jpg',
    unload_time: 1704330000000,
    unload_photo: 'cloud://xxx-unload.jpg',
    status: 'completed',
    queue_number: 1,
    create_time: 1704326400000,
    update_time: 1704330000000
  }
}
```

**前端调用示例：**

```javascript
const truck = uniCloud.importObject('truck')

async function getDetail(id) {
  try {
    const res = await truck.getDetail(id)
    
    if (res.errCode === 0) {
      console.log('详情：', res.data)
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

### 1.5 查询当前任务

**方法名：** `getCurrentTask`

**请求方法：** GET

**功能说明：** 查询当前登录用户进行中的任务（需要登录）

**请求参数：** 无（自动根据登录用户查询）

**返回示例：**

```javascript
// 找到任务
{
  errCode: 0,
  errMsg: '获取成功',
  data: {
    _id: 'xxx',
    user_id: 'user-id-xxx',
    driver_name: '张三',
    phone: '13800138000',
    plate_number: '京A12345',
    status: 'processing',
    queue_number: 1,
    // ... 其他字段
  }
}

// 未找到任务
{
  errCode: 404,
  errMsg: '未找到进行中的任务',
  data: null
}
```

**前端调用示例：**

```javascript
const truck = uniCloud.importObject('truck')

async function getCurrentTask() {
  try {
    // 无需传参，根据登录用户自动查询
    const res = await truck.getCurrentTask()
    
    if (res.errCode === 0) {
      console.log('当前任务：', res.data)
    } else if (res.errCode === 404) {
      console.log('暂无进行中的任务')
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

### 1.6 查询我的历史记录

**方法名：** `getMyRecords`

**请求方法：** GET

**功能说明：** 查询当前登录用户的所有历史记录（需要登录）

**请求参数：**

```javascript
{
  page: Number,        // 页码，默认1
  pageSize: Number     // 每页数量，默认20
}
```

**返回示例：**

```javascript
{
  errCode: 0,
  errMsg: '获取成功',
  data: {
    list: [
      {
        _id: 'xxx',
        user_id: 'user-id-xxx',
        driver_name: '张三',
        phone: '13800138000',
        plate_number: '京A12345',
        truck_length: '9.6米',
        loading_place: '北京市朝阳区',
        arrival_time: 1704326400000,
        arrival_photo: 'cloud://xxx.jpg',
        unload_time: 1704330000000,
        unload_photo: 'cloud://xxx-unload.jpg',
        status: 'completed',
        queue_number: 1,
        create_time: 1704326400000,
        update_time: 1704330000000
      }
    ],
    total: 10,
    page: 1,
    pageSize: 20
  }
}
```

**前端调用示例：**

```javascript
const truck = uniCloud.importObject('truck')

async function getMyRecords() {
  try {
    const res = await truck.getMyRecords(1, 20)
    
    if (res.errCode === 0) {
      console.log('我的记录：', res.data.list)
      console.log('总数：', res.data.total)
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

### 1.7 获取排队统计

**方法名：** `getQueueStats`

**请求方法：** GET

**功能说明：** 获取当前排队统计信息

**请求参数：** 无

**返回示例：**

```javascript
{
  errCode: 0,
  errMsg: '获取成功',
  data: {
    processing: 1,        // 处理中的数量
    waiting: 8,           // 排队中的数量
    completed_today: 25   // 今日已完成数量
  }
}
```

**前端调用示例：**

```javascript
const truck = uniCloud.importObject('truck')

async function getQueueStats() {
  try {
    const res = await truck.getQueueStats()
    
    if (res.errCode === 0) {
      console.log('统计信息：', res.data)
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

## 二、user 云对象

### 2.1 微信小程序登录

**方法名：** `loginByWeixin`

**请求方法：** POST

**功能说明：** 微信小程序登录

**请求参数：**

```javascript
{
  code: String  // 微信登录code（必填）
}
```

**返回示例：**

```javascript
{
  errCode: 0,
  errMsg: '登录成功',
  data: {
    token: 'xxx-token-xxx',
    tokenExpired: 1704412800000,
    userInfo: {
      uid: 'user-id-xxx',
      nickname: '微信用户',
      avatar: 'https://xxx.jpg'
    }
  }
}
```

**前端调用示例：**

```javascript
const userObj = uniCloud.importObject('user')

async function login() {
  try {
    // 先获取微信登录code
    const loginRes = await uni.login({ provider: 'weixin' })
    
    // 调用云对象登录
    const res = await userObj.loginByWeixin({
      code: loginRes.code
    })
    
    if (res.errCode === 0) {
      // 保存token
      uni.setStorageSync('uni_id_token', res.data.token)
      console.log('登录成功')
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

### 2.2 获取用户信息

**方法名：** `getUserInfo`

**请求方法：** GET

**功能说明：** 获取当前登录用户信息

**请求参数：** 无（需要token）

**返回示例：**

```javascript
{
  errCode: 0,
  errMsg: '获取成功',
  data: {
    _id: 'user-id-xxx',
    nickname: '张三',
    avatar: 'https://xxx.jpg',
    // ... 其他用户信息
  }
}
```

**前端调用示例：**

```javascript
const userObj = uniCloud.importObject('user')

async function getUserInfo() {
  try {
    const res = await userObj.getUserInfo()
    
    if (res.errCode === 0) {
      console.log('用户信息：', res.data)
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

### 2.3 更新用户信息

**方法名：** `updateUserInfo`

**请求方法：** POST

**功能说明：** 更新当前登录用户信息

**请求参数：**

```javascript
{
  nickname: String,  // 昵称（选填）
  avatar: String     // 头像URL（选填）
}
```

**返回示例：**

```javascript
{
  errCode: 0,
  errMsg: '更新成功'
}
```

**前端调用示例：**

```javascript
const userObj = uniCloud.importObject('user')

async function updateUserInfo() {
  try {
    const res = await userObj.updateUserInfo({
      nickname: '新昵称',
      avatar: 'cloud://new-avatar.jpg'
    })
    
    if (res.errCode === 0) {
      uni.showToast({ title: '更新成功' })
    }
  } catch (e) {
    console.error(e)
  }
}
```

---

## 三、权限说明

### 需要登录的接口

以下接口需要用户先登录才能调用：

| 云对象 | 方法 | 说明 |
|--------|------|------|
| truck | register | 到达登记 |
| truck | complete | 完成卸货 |
| truck | getCurrentTask | 查询当前任务 |
| truck | getMyRecords | 查询历史记录 |
| user | getUserInfo | 获取用户信息 |
| user | updateUserInfo | 更新用户信息 |

### 无需登录的接口

以下接口无需登录即可调用：

| 云对象 | 方法 | 说明 |
|--------|------|------|
| truck | getList | 获取排队列表（公开） |
| truck | getDetail | 获取记录详情（公开） |
| truck | getQueueStats | 获取排队统计（公开） |
| user | loginByWeixin | 微信登录 |

### token 使用说明

**获取 token：**
```javascript
// 登录后获取
const userObj = uniCloud.importObject('user')
const res = await userObj.loginByWeixin({ code: 'xxx' })
const token = res.data.token

// 保存到本地
uni.setStorageSync('uni_id_token', token)
```

**使用 token：**
```javascript
// uniCloud 会自动携带本地存储的 token
const truck = uniCloud.importObject('truck')
await truck.register({ ... })  // 自动携带 token
```

**token 过期处理：**
```javascript
try {
  const res = await truck.register({ ... })
} catch (e) {
  if (e.message.includes('请先登录')) {
    // token过期，引导用户重新登录
    uni.removeStorageSync('uni_id_token')
    uni.navigateTo({ url: '/pages/login/login' })
  }
}
```

---

## 四、状态说明

### 卸货状态（status）

| 状态值 | 说明 | 描述 |
|--------|------|------|
| waiting | 排队中 | 等待卸货 |
| processing | 处理中 | 正在卸货 |
| completed | 已完成 | 卸货完成 |

### 业务流程

1. **司机到达** → 扫码登记 → 状态为 `waiting`（如果是第一个则为 `processing`）
2. **排队等待** → 前面的车辆卸货完成后 → 状态自动变为 `processing`
3. **卸货完成** → 司机扫码登记完成 → 状态变为 `completed` → 下一个自动变为 `processing`

---

## 五、错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 参数错误或业务逻辑错误 |
| 401 | 未登录或token过期 |
| 404 | 记录不存在 |
| 500 | 服务器内部错误 |

---

## 六、云存储使用

### 上传图片（水印照片）

**说明：** 用户在外部水印相机App拍照后，从相册选择上传

```javascript
// 选择图片（从相册）
const chooseRes = await uni.chooseImage({
  count: 1,
  sourceType: ['album', 'camera'], // 优先相册，也支持现场拍照
  sizeType: ['compressed'] // 自动压缩
})

// 上传到云存储
const uploadRes = await uniCloud.uploadFile({
  filePath: chooseRes.tempFilePaths[0],
  cloudPath: `trucks/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`,
  cloudPathAsRealPath: false
})

// 获取云存储文件ID
const fileID = uploadRes.fileID

// 将fileID传给云对象
```

---

## 七、注意事项

1. **登录状态**：大部分接口需要登录后才能调用，请先调用 `user.loginByWeixin()` 登录
2. **微信小程序配置**：需要在 `uni-id/config.json` 中配置微信小程序的 `appid` 和 `appsecret`
2. **数据库初始化**：首次部署后需要在 uniCloud web控制台初始化数据库（上传 db_init.json）
3. **权限控制**：trucks 表已配置权限，只有未完成的记录才能更新
4. **图片存储**：建议使用云存储存储水印照片，并将返回的 fileID 存入数据库
5. **状态自动流转**：完成卸货时会自动将下一个排队中的记录改为处理中，无需手动操作

---

## 八、开发建议

0. 先实现登录功能，再实现其他功能

1. 扫码可以使用 `uni.scanCode()` API
2. 水印照片由用户在外部水印相机App拍摄后，从相册选择上传
3. 建议在前端缓存司机信息（手机号、车牌号），方便再次登记
4. 可以添加实时刷新功能，显示最新的排队情况
5. 建议添加消息推送，当状态变为"处理中"时通知司机

