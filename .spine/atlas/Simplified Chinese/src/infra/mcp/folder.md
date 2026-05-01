<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/mcp","role":"MCP infrastructure layer that bridges ArchSpine's internal capabilities with external AI agents through the Model Context Protocol.","responsibility":"Provides the complete MCP server implementation including context-gated resource access, tool definitions for codebase analysis, and stdio transport for agent communication, enabling external AI systems to query architectural metadata, scan files against rules, and access project context.","children":[{"filePath":"src/infra/mcp/context.ts","role":"Infrastructure facade class for gating Model Context Protocol (MCP) context flow based on priming state and operational mode.","fileKind":"source"},{"filePath":"src/infra/mcp/resources.ts","role":"Infrastructure facade providing MCP resource templates and handlers for accessing ArchSpine project metadata and files within the .spine directory, with context-aware access control via MCPContextGate.","fileKind":"source"},{"filePath":"src/infra/mcp/server.ts","role":"Infrastructure facade implementing the Model Context Protocol (MCP) server to expose ArchSpine's internal resources and tools to external AI agents via stdio transport.","fileKind":"source"},{"filePath":"src/infra/mcp/tools.ts","role":"MCP (Model Context Protocol) tool facade exposing ArchSpine system capabilities as queryable tools for external AI agents.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T07:20:42.969Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/mcp` — MCP 基础设施层

该目录实现了**模型上下文协议（MCP）**服务器，将 ArchSpine 的内部能力桥接到外部 AI 智能体。它提供了一个完整的基于 stdio 的传输层，AI 系统可以通过该层查询架构元数据、扫描文件以检查规则合规性，以及访问项目上下文。

## 关键文件

- **`server.ts`** — MCP 服务器的主实现。它设置 stdio 传输并注册所有资源和工具，作为智能体通信的入口点。

- **`context.ts`** — 定义了 `MCPContextGate`，一个基于初始状态和操作模式对上下文流进行门控的基础设施外观。这确保了只有经过授权或正确初始化的请求才能到达底层系统。

- **`resources.ts`** — 提供 MCP 资源模板和处理程序，用于访问 ArchSpine 项目元数据和 `.spine` 目录中的文件。所有资源访问都通过 `MCPContextGate` 进行上下文感知控制。

- **`tools.ts`** — 将 ArchSpine 系统能力暴露为外部 AI 智能体可查询的工具。这包括用于代码库分析、规则扫描和架构元数据检索的工具。

## 实现重点

最重要的实现领域包括：

1. **上下文门控** — `context.ts` 中的 `MCPContextGate` 是安全与状态边界。它必须正确验证初始状态和操作模式，然后才允许任何资源或工具访问。

2. **资源暴露** — `resources.ts` 定义了项目元数据和文件如何作为 MCP 资源暴露。这是智能体读取 ArchSpine 架构数据的主要方式。

3. **工具定义** — `tools.ts` 定义了智能体可以调用的可查询工具。这些工具必须类型完善且文档齐全，以实现有效的智能体交互。

4. **服务器生命周期** — `server.ts` 管理 MCP 服务器的生命周期，包括传输设置、资源/工具注册以及优雅关闭。