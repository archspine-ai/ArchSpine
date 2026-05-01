<!-- spine-content-hash:f86c2113efb51160b81db89480cbbe261279b84d42b722e8760e17f1b9fa8116 -->
# ArchSpine – `check` 命令适配器

## 角色
本模块是 `check` 操作的薄 CLI 适配器。它提供入口点，将所有规则检查与验证委托给 `RuntimeService` 的 `CheckService`，并通过结构化错误信号通知失败。

## 主要职责
- 通过导出的 `executeCheckCommand` 函数暴露 `check` 命令的 CLI 入口点。
- 将核心规则检查与验证委托给 `RuntimeService` 的 `CheckService`，保持关注点分离。
- 如果检查摘要显示存在违规或失败文件，则抛出结构化的 `ArchSpineError`，确保 CLI 以适当的错误码退出。

## 不包含的范围
- 实现规则检查或验证逻辑（委托给 `CheckService`）。
- 处理检查的持久化或文件 I/O。
- 解析 CLI 参数或配置（假定由上游处理）。

## 不变约束
- 必须保持为薄适配器；所有业务逻辑必须委托给 `RuntimeService` 或其服务。
- 不得包含管道、引擎或基础设施逻辑。

## 公开接口
- `ExecuteCheckCommandOptions` 接口
- `executeCheckCommand` 函数

## 架构意图
本模块作为薄 CLI 入口适配器，确保命令路由与核心运行时服务之间的分离。它是重构工作的一部分，旨在建立子系统外观并解决层反转问题，从而强化其作为薄适配器的角色。