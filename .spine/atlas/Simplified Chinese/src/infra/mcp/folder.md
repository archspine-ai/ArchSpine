<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/mcp","role":"Implements the Model Context Protocol (MCP) infrastructure layer for exposing ArchSpine resources and tools to external AI agents.","responsibility":"Provides context-aware access control, resource templates, server initialization, and tool definitions to enable AI agents to query architectural metadata, perform preview scans, and access project files through a standardized protocol.","children":[{"filePath":"src/infra/mcp/context.ts","role":"Infrastructure facade class for gating Model Context Protocol (MCP) context flow based on priming state and operational mode.","fileKind":"source"},{"filePath":"src/infra/mcp/resources.ts","role":"Infrastructure facade providing MCP resource templates and handlers for accessing ArchSpine project metadata and files within the .spine directory, with context-aware access control via MCPContextGate.","fileKind":"source"},{"filePath":"src/infra/mcp/server.ts","role":"Infrastructure facade implementing the Model Context Protocol (MCP) server to expose ArchSpine's internal resources and tools to external AI agents via stdio transport.","fileKind":"source"},{"filePath":"src/infra/mcp/tools.ts","role":"MCP (Model Context Protocol) tool facade exposing ArchSpine system capabilities as queryable tools for external AI agents.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T07:41:43.477Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# src/infra/mcp – 模型上下文协议基础架构

本目录实现了 ArchSpine 镜像系统的模型上下文协议（MCP）基础层，旨在通过标准化的、支持上下文感知的协议（stdio 传输），将 ArchSpine 内部的架构元数据、文件资源以及系统工具暴露给外部 AI 智能体。

## 主要子模块及分组

四个源文件各自代表 MCP 集成中的一个外观类：

- **`context.ts`** – `MCPContextGate`：根据初始化状态和运行模式控制上下文流程，决定智能体会话是否可继续。
- **`resources.ts`** – 提供资源模板和处理器，用于访问 `.spine` 目录内的文件及项目元数据，并通过上下文门控进行访问控制。
- **`server.ts`** – 启动 MCP 服务器本身，将资源和工具通过 stdio 进行编排。
- **`tools.ts`** – 定义可查询的工具（例如架构查询、预览扫描），智能体可以调用这些工具。

这些文件均以“基础架构外观类”的形式组织，将 MCP 的底层细节封装起来，向系统其他部分提供清晰的接口。

## 关键实现领域

- **访问控制**：`context.ts` 根据初始化状态和运行模式实施门控，防止未授权访问敏感资源。
- **资源暴露**：`resources.ts` 定义了如 `spine://metadata/{project}` 这样的资源模板，以及从 `.spine` 目录读取数据的处理器。
- **工具定义**：`tools.ts` 通过结构化模式暴露“查询架构”、“预览扫描”等能力。
- **服务器生命周期**：`server.ts` 负责初始化、信号处理以及传输层（stdio）。

这些子模块是 ArchSpine 内部状态与外部 AI 智能体之间的关键桥梁，能够以安全、只读的方式暴露项目元数据。