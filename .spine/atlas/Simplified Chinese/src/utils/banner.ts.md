<!-- spine-content-hash:c1684d50b413689028c9b14b5c9480fb16a9f5f59e8e355cc414f18c4ad3ce6b -->
# ArchSpine – 横幅工具

## 角色
CLI 展示工具，用于渲染品牌横幅和版本信息。

## 主要职责
- 从 `package.json` 读取并缓存项目版本号。
- 使用 chalk 主题渲染包含版本和副标题的完整多行 ASCII 艺术横幅。
- 使用 chalk 主题渲染带有风格化 'ArchSpine' 品牌的紧凑迷你横幅。

## 重要不变性
- 版本字符串在首次读取后缓存，避免重复文件 I/O。
- 所有控制台输出均使用 chalk 以保持品牌颜色一致。

## 负面范围（不在范围内）
- 向控制台输出非横幅消息。
- 解析或验证 CLI 参数。
- 管理应用程序生命周期或配置。

## 最重要的导出行为
- `printFullBanner()` – 渲染完整多行横幅。
- `printMiniBanner()` – 渲染紧凑迷你横幅。