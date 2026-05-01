<!-- spine-content-hash:d6e7d5899e8f17df8dff5968861b2148dc4ede0b5c42d317136ea0d13d32c7d2 -->
# ArchSpine 视图命令适配器

## 角色
ArchSpine 系统中 `view` 子命令的 CLI 命令适配器，负责视图选择、验证以及受保护输出写入的编排。

## 主要职责
- 定义 `ExecuteViewCommandOptions` 接口，用于 CLI 视图命令参数。
- 通过规范化配置的已启用视图和解析实验性视图层，实现初始视图选择逻辑。
- 在需要时使用 prompts 库编排交互式视图选择提示。
- 根据已知视图定义验证所选视图 ID。
- 通过 `withProtectedOutputsWriteAccess` 和 `writeProtectedOutputBaseline` 协调受保护输出写入访问。
- 将视图配置详情（已配置、有效、未知视图）记录到控制台。

## 重要不变性
- CLI 入口点不得吸收管道或持久化逻辑；必须委托给 services、core、engines 或 infra。
- 视图选择必须尊重 services/view 中定义的已配置和实验性视图层。

## 排除范围（不属于职责）
- 视图推导或计算逻辑（属于 services/view 或 engines）。
- 视图状态的持久化或存储（属于 infra）。
- 视图渲染或转换的业务逻辑。

## 最重要的导出行为
- **公共接口：** `ExecuteViewCommandOptions`
- 此适配器是一个薄 CLI 层，将视图逻辑委托给 services，将受保护写入委托给 infra，确保关注点分离。