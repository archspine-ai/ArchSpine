<!-- spine-content-hash:61a7bb613854e50823c625e15233e616641f1f291d5b27153361faf693117687 -->
# ArchSpine – SpineResources

## 角色
基础设施外观层，提供 MCP 资源模板和处理程序，用于访问 ArchSpine 项目 `.spine` 目录中的元数据和文件，并通过 `MCPContextGate` 实现上下文感知的访问控制。

## 主要职责
- 暴露 MCP 资源的 URI 模板：`spine://project`、`spine://file`、`spine://index`。
- 根据文件扩展名读取并格式化 Spine 目录中的文件（JSON、Markdown），以供 MCP 资源消费。
- 通过 `MCPContextGate` 集成（`requireResourceAccess`、`noteResourceRead`）对资源读取实施上下文门控访问控制。
- 处理 `.spine` 目录资源的文件存在性检查和路径解析。
- 规范化资源 URI 并将其解析为 `.spine` 目录内的文件系统路径。

## 重要不变性与负面范围
- 所有资源路径必须解析在 `.spine` 目录内，以防止目录遍历。
- 当提供 `MCPContextGate` 时，对资源的访问必须通过它进行门控。
- 资源 URI 必须遵循 `spine://` 方案。
- **不**处理超出 `MCPContextGate` 接口的身份验证或授权。
- **不**管理或编排更高级别的业务逻辑或任务执行。
- **不**提供对 `.spine` 资源的写入或变更能力。

## 最重要的导出/外部可见行为
- `SpineResources` 类
- `SpineResources.getResourceTemplates` – 返回 MCP 资源的 URI 模板。
- `SpineResources.readResource` – 在访问控制检查后，读取并返回由 `spine://` URI 标识的资源内容。