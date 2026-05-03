`mcp` 目录是 ArchSpine 的模型上下文协议（MCP）集成层，通过 stdio 传输将系统内部资源与工具暴露给外部 AI 代理。它充当一个网关，根据准备状态和操作模式控制上下文流，确保代理只获得其被授权访问的信息。

该目录包含四个基础设施外观子模块，每个模块职责明确：

- **context.ts** – 上下文门控与提供策略。定义 `MCPContextMode`（关闭、项目优先、搜索优先），维护项目和搜索准备状态的内部布尔标记，并通过 `SEARCH_PRIMING_TOOLS` 集在搜索导向工具被调用时更新搜索准备状态。
- **resources.ts** – 资源模板与处理程序。提供 URI 模板（`spine://project`、`spine://file`、`spine://index`），读取并格式化 `.spine` 目录下的文件（JSON、Markdown），并通过 `MCPContextGate`（`requireResourceAccess`、`noteResourceRead`）实施上下文门控的访问控制。
- **server.ts** – MCP 服务器生命周期。初始化 MCP SDK 服务器实例，使用 stdio 传输，注册资源和工具请求处理器，将资源检索委托给 `SpineResources`，将工具定义和执行委托给 `SpineTools`，从 Manifest 和 Config 加载项目上下文，并通过 `toArchSpineError` 统一错误报告。
- **tools.ts** – 工具定义与执行。将核心 ArchSpine 组件（Scanner、RuleEngine、Manifest、Config）封装为 MCP 工具，包括 `queryInvariants`、`queryResponsibilities`、`previewScan`、`getDriftHistory`、`getFileContext`、`getViewData`、`getViolationsSummary`、`listResourceTemplates`。还提供基线/同步状态查询，并通过 `MCPContextGate` 集成审计/追踪。

最重要的实现领域是**上下文感知访问控制**（决定上下文何时以及如何流向代理）和**资源/工具暴露**（通过结构化协议使项目元数据、文件内容、扫描、规则和漂移历史可用）。具体子模块如 `MCPContextGate`、`SpineResources` 和 `SpineTools` 是实施者应重点关注的主要构建块。