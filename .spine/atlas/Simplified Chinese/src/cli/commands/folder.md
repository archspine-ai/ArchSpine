<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli/commands","role":"CLI command adapters that provide the user-facing interface for all ArchSpine operations.","responsibility":"Collectively, these components implement the command-line interface layer of ArchSpine, parsing user arguments, orchestrating workflows by delegating to core services (RuntimeService, Config, Manifest, Scanner, etc.), handling errors consistently, and formatting output for terminal display across all subcommands including build, check, config, fix, god, history, hook, info, init, languages, llm, mcp, publish, remove, repo, scan, status, sync, try, usage, and view.","children":[{"filePath":"src/cli/commands/build.ts","role":"CLI command adapter for the 'build' operation, orchestrating the build workflow and delegating to core services.","fileKind":"source"},{"filePath":"src/cli/commands/check.ts","role":"CLI command adapter for the 'check' operation, providing the entry point that delegates to the RuntimeService's CheckService and signals failures via structured errors.","fileKind":"source"},{"filePath":"src/cli/commands/config.ts","role":"CLI command adapter for configuration management within the ArchSpine system.","fileKind":"source"},{"filePath":"src/cli/commands/fix.ts","role":"CLI command adapter for the 'fix' operation, providing a thin interface to delegate execution to the runtime service's fix subsystem facade.","fileKind":"source"},{"filePath":"src/cli/commands/god.ts","role":"CLI command handler for the God Mode feature, providing user warnings and confirmation before delegating to the God engine.","fileKind":"source"},{"filePath":"src/cli/commands/history.ts","role":"CLI command adapter for the `spine history` subcommand, responsible for parsing arguments, delegating to the Manifest infrastructure for drift history and file documentation retrieval, and formatting the output for terminal display.","fileKind":"source"},{"filePath":"src/cli/commands/hook.ts","role":"CLI command adapter for managing git hook integration and synchronization within the ArchSpine system.","fileKind":"source"},{"filePath":"src/cli/commands/info.ts","role":"CLI command handler for the 'info' command, acting as a thin adapter that orchestrates the execution of the info report engine.","fileKind":"source"},{"filePath":"src/cli/commands/init.ts","role":"CLI command orchestrator for initializing the ArchSpine environment, configuration, and repository structure.","fileKind":"source"},{"filePath":"src/cli/commands/languages.ts","role":"CLI command adapter for interactive documentation language configuration management in the ArchSpine system.","fileKind":"source"},{"filePath":"src/cli/commands/llm.ts","role":"CLI command adapter for interactive LLM provider, model, and runtime configuration.","fileKind":"source"},{"filePath":"src/cli/commands/mcp.ts","role":"CLI command adapter for starting the ArchSpine Model Context Protocol (MCP) server.","fileKind":"source"},{"filePath":"src/cli/commands/publish.ts","role":"CLI command handler orchestrating the publish workflow for the ArchSpine mirror system, coordinating preflight checks, sync, document backfill, and atlas state management.","fileKind":"source"},{"filePath":"src/cli/commands/remove.ts","role":"CLI command adapter for the 'remove' operation, orchestrating the cleanup of ArchSpine-managed artifacts from a repository.","fileKind":"source"},{"filePath":"src/cli/commands/repo.ts","role":"CLI command router for repository-level operations in the ArchSpine system.","fileKind":"source"},{"filePath":"src/cli/commands/scan.ts","role":"CLI command handler for the 'scan' operation, orchestrating source code scanning and dry-run reporting.","fileKind":"source"},{"filePath":"src/cli/commands/status.ts","role":"CLI command adapter for displaying the synchronization status of the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/cli/commands/sync.ts","role":"CLI command adapter orchestrating the synchronization workflow for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/cli/commands/try.ts","role":"CLI command adapter for the 'try' preview command, handling filesystem validation, configuration parsing, and user feedback.","fileKind":"source"},{"filePath":"src/cli/commands/usage.ts","role":"CLI command entry point for executing usage reports.","fileKind":"source"},{"filePath":"src/cli/commands/view.ts","role":"CLI command adapter for the 'view' subcommand, handling view selection, validation, and orchestration of protected output writes within the ArchSpine system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:01:46.538Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/cli/commands` — CLI 命令适配器

此目录包含 ArchSpine 面向用户的命令行接口层。每个文件都是一个轻量适配器，负责解析参数、委托给核心服务（RuntimeService、Config、Manifest、Scanner 等）、一致地处理错误，并格式化终端输出。

## 主要子模块

- **`build.ts`** — 编排构建工作流，委托给核心服务。
- **`check.ts`** — 检查操作的入口点，使用 CheckService 和结构化错误信号。
- **`config.ts`** — 管理配置设置。
- **`fix.ts`** — 运行时服务修复子系统的薄接口。
- **`god.ts`** — 处理上帝模式，包含用户警告和确认后再委托。
- **`history.ts`** — 解析参数，从 Manifest 检索漂移历史和文件文档，并格式化输出。
- **`hook.ts`** — 管理 Git 钩子集成和同步。
- **`info.ts`** — 编排信息报告引擎。
- **`init.ts`** — 初始化 ArchSpine 环境、配置和仓库结构。
- **`languages.ts`** — 交互式配置文档语言。
- **`llm.ts`** — 交互式配置 LLM 提供商、模型和运行时。
- **`mcp.ts`** — 启动模型上下文协议（MCP）服务器。
- **`publish.ts`** — 编排发布工作流，包括预检、同步、文档回填和 Atlas 状态管理。
- **`remove.ts`** — 从仓库清理 ArchSpine 管理的工件。
- **`repo.ts`** — 仓库级操作的路由器。
- **`scan.ts`** — 处理源代码扫描和试运行报告。
- **`status.ts`** — 显示镜像系统的同步状态。
- **`sync.ts`** — 编排同步工作流。
- **`try.ts`** — 预览命令，包含文件系统验证和配置解析。
- **`usage.ts`** — 执行使用报告的入口点。
- **`view.ts`** — 处理视图选择、验证和保护性输出写入。

## 关键实现领域

- **参数解析与委托** — 每个适配器解析 CLI 参数并委托给相应的核心服务。
- **错误处理** — 所有命令一致地处理错误并使用结构化错误信号。
- **输出格式化** — 为所有子命令提供终端友好的输出格式。
- **工作流编排** — `build`、`publish` 和 `sync` 等命令编排涉及多个核心服务的多步骤工作流。