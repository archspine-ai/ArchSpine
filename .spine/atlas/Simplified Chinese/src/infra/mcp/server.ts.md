<!-- spine-content-hash:28970da510c8271a0cb668fd86aa7b0706ba355e06b2bb53f0ff82a0a26def64 -->
# ArchSpineMCPServer

**角色：** 基础设施外观层，实现模型上下文协议（MCP）服务器，通过标准输入输出（stdio）传输将 ArchSpine 的内部资源和工具暴露给外部 AI 代理。

## 主要职责

- 初始化并管理基于 stdio 传输的 MCP SDK 服务器实例。
- 注册 MCP 资源列表、读取、工具列表和工具执行的请求处理器。
- 将资源检索委托给 `SpineResources` 模块。
- 将工具定义和执行委托给 `SpineTools` 模块。
- 集成 `Manifest` 和 `Config` 以加载项目上下文和 MCP 上下文模式。
- 使用 `toArchSpineError` 包装错误，实现一致的错误报告。

## 不涉及范围

- 资源或工具逻辑的直接实现（委托给 `SpineResources` 和 `SpineTools`）。
- 除 stdio 之外的传输层（例如 HTTP、WebSocket）。
- MCP 请求的身份验证或授权。

## 不变约束

- 必须维护资源与工具交互的 MCP 协议请求/响应模式。
- 必须将资源和工具操作委托给专用模块（`SpineResources`、`SpineTools`）。
- 必须使用 stdio 传输与外部代理通信。

## 公开接口

- **类：** `ArchSpineMCPServer`
- **构造函数：** `constructor(config: Config, manifest: Manifest)`
- **方法：** `start()`

## 架构意图

提供一个稳定的 MCP 服务器外观层，将 ArchSpine 的内部能力桥接到外部 AI 代理，遵循子系统外观模式以解决层反转问题。