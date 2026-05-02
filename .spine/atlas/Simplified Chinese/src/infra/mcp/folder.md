<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/mcp","role":"Implements the Model Context Protocol (MCP) infrastructure for external AI agent interaction and data access.","responsibility":"Provides MCP server, resource templates, tool definitions, and context-aware access control to expose ArchSpine's internal project data and capabilities to external AI agents via stdio transport.","children":[{"filePath":"src/infra/mcp/context.ts","role":"Infrastructure facade class for gating Model Context Protocol (MCP) context flow based on priming state and operational mode.","fileKind":"source"},{"filePath":"src/infra/mcp/resources.ts","role":"Infrastructure facade providing MCP resource templates and handlers for accessing ArchSpine project metadata and files within the .spine directory, with context-aware access control via MCPContextGate.","fileKind":"source"},{"filePath":"src/infra/mcp/server.ts","role":"Infrastructure facade implementing the Model Context Protocol (MCP) server to expose ArchSpine's internal resources and tools to external AI agents via stdio transport.","fileKind":"source"},{"filePath":"src/infra/mcp/tools.ts","role":"MCP (Model Context Protocol) tool facade exposing ArchSpine system capabilities as queryable tools for external AI agents.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T10:10:53.271Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
**`src/infra/mcp` – 模型上下文协议基础设施**

此目录实现了 **模型上下文协议（MCP）** 的基础设施，允许外部 AI 代理访问 ArchSpine 的内部项目数据与能力。所有通信均通过 **stdio 传输** 进行，并由上下文感知的访问控制层加以限制。

**关键文件及其分组：**

- **`context.ts`** – 定义 `MCPContextGate` 外观类，根据系统的初始化状态与运行模式控制 MCP 上下文的流转，是所有传入请求的第一道关卡。
- **`resources.ts`** – 提供 MCP 资源模板与处理器，用于公开 `.spine` 目录内的项目元数据与文件，并通过 `MCPContextGate` 执行访问规则。
- **`server.ts`** – 实现 MCP 服务器，将资源与工具整合在一起，通过 stdio 向外部代理暴露接口。
- **`tools.ts`** – 工具外观，将 ArchSpine 系统的能力包装为可查询的 MCP 工具，使代理能够读写项目状态。

这些文件共同构成一个统一的层次：（1）基于系统上下文安全地控制访问；（2）以标准 MCP 格式公开资源与工具；（3）通过 stdio 实现轻量级代理集成。最关键的实现领域是 **上下文门控** 以及 **资源/工具定义**。