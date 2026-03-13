# 张三学习时间记录器 - 微信小程序

## 项目简介
记录张三每天的学习时间段（开始时间 → 结束时间），自动累计每日学习总时长。使用微信云开发存储数据，支持多设备共享。

## 使用前准备

### 1. 获取 AppID
- 前往 [微信公众平台](https://mp.weixin.qq.com) 注册小程序账号
- 在「开发管理 → 开发设置」中获取 AppID

### 2. 配置项目
1. 打开 `project.config.json`，将 `YOUR_APPID_HERE` 替换为你的 AppID
2. 打开 `miniprogram/app.js`，将 `YOUR_ENV_ID` 替换为你的云开发环境 ID

### 3. 导入微信开发者工具
1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 选择「导入项目」，目录选择 `study-tracker/`
3. 填入你的 AppID

### 4. 开通云开发
1. 在微信开发者工具中，点击工具栏「云开发」按钮
2. 开通云开发，创建环境（名称任意，如 `study-env`）
3. 将环境 ID 填入 `miniprogram/app.js` 中

### 5. 创建数据库集合
1. 进入云开发控制台 → 数据库
2. 创建集合：`study_sessions`
3. 设置数据权限为「所有用户可读，仅创建者可写」

### 6. 部署云函数（可选）
如果直接在小程序端操作数据库已足够使用，可跳过云函数部署。

## 功能
- 📝 **记录页**：选择开始/结束时间，自动计算时长，支持一天多段记录
- 📅 **历史页**：按日期查看所有学习记录，支持删除
- 👤 **统计页**：本周/本月/总计学习时长，连续打卡天数

## 项目结构
```
study-tracker/
├── project.config.json     # 项目配置
├── miniprogram/
│   ├── app.js / .json / .wxss  # 全局配置
│   ├── images/             # TabBar 图标
│   ├── utils/util.js       # 工具函数
│   └── pages/
│       ├── index/          # 记录页
│       ├── history/        # 历史页
│       └── profile/        # 统计页
└── cloudfunctions/         # 云函数（可选）
```
