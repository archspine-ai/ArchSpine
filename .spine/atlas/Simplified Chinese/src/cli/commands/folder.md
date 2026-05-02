<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli/commands","role":"CLI command adapters for the ArchSpine system, each handling a specific subcommand's argument parsing, validation, and delegation to core services.","responsibility":"Collectively, these adapters define the complete command-line interface for ArchSpine, orchestrating workflows for initialization, configuration, scanning, synchronization, publishing, fixing, and other operations, while ensuring consistent error handling and user feedback.","children":[{"filePath":"src/cli/commands/build.ts","role":"CLI command adapter for the 'build' operation, orchestrating the build workflow and delegating to core services.","fileKind":"source"},{"filePath":"src/cli/commands/check.ts","role":"CLI command adapter for the 'check' operation, providing the entry point that delegates to the RuntimeService's CheckService and signals failures via structured errors.","fileKind":"source"},{"filePath":"src/cli/commands/config.ts","role":"CLI command adapter for configuration management within the ArchSpine system.","fileKind":"source"},{"filePath":"src/cli/commands/fix.ts","role":"CLI command adapter for the 'fix' operation, providing a thin interface to delegate execution to the runtime service's fix subsystem facade.","fileKind":"source"},{"filePath":"src/cli/commands/god.ts","role":"CLI command handler for the God Mode feature, providing user warnings and confirmation before delegating to the God engine.","fileKind":"source"},{"filePath":"src/cli/commands/history.ts","role":"CLI command adapter for the `spine history` subcommand, responsible for parsing arguments, delegating to the Manifest infrastructure for drift history and file documentation retrieval, and formatting the output for terminal display.","fileKind":"source"},{"filePath":"src/cli/commands/hook.ts","role":"CLI command adapter for managing git hook integration and synchronization within the ArchSpine system.","fileKind":"source"},{"filePath":"src/cli/commands/info.ts","role":"CLI command handler for the 'info' command, acting as a thin adapter that orchestrates the execution of the info report engine.","fileKind":"source"},{"filePath":"src/cli/commands/init.ts","role":"CLI command orchestrator for initializing the ArchSpine environment, configuration, and repository structure.","fileKind":"source"},{"filePath":"src/cli/commands/languages.ts","role":"CLI command adapter for interactive documentation language configuration management in the ArchSpine system.","fileKind":"source"},{"filePath":"src/cli/commands/llm.ts","role":"CLI command adapter for interactive LLM provider, model, and runtime configuration.","fileKind":"source"},{"filePath":"src/cli/commands/mcp.ts","role":"CLI command adapter for starting the ArchSpine Model Context Protocol (MCP) server.","fileKind":"source"},{"filePath":"src/cli/commands/publish.ts","role":"CLI command handler orchestrating the publish workflow for the ArchSpine mirror system, coordinating preflight checks, sync, document backfill, and atlas state management.","fileKind":"source"},{"filePath":"src/cli/commands/remove.ts","role":"CLI command adapter for the 'remove' operation, orchestrating the cleanup of ArchSpine-managed artifacts from a repository.","fileKind":"source"},{"filePath":"src/cli/commands/repo.ts","role":"CLI command router for repository-level operations in the ArchSpine system.","fileKind":"source"},{"filePath":"src/cli/commands/scan.ts","role":"CLI command handler for the 'scan' operation, orchestrating source code scanning and dry-run reporting.","fileKind":"source"},{"filePath":"src/cli/commands/status.ts","role":"CLI command adapter for displaying the synchronization status of the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/cli/commands/sync.ts","role":"CLI command adapter orchestrating the synchronization workflow for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/cli/commands/try.ts","role":"CLI command adapter for the 'try' preview command, handling filesystem validation, configuration parsing, and user feedback.","fileKind":"source"},{"filePath":"src/cli/commands/usage.ts","role":"CLI command entry point for executing usage reports.","fileKind":"source"},{"filePath":"src/cli/commands/view.ts","role":"CLI command adapter for the 'view' subcommand, handling view selection, validation, and orchestration of protected output writes within the ArchSpine system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T07:41:45.300Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/cli/commands` — ArchSpine CLI 命令适配器

该目录包含 ArchSpine “镜像”系统的所有 CLI 命令适配器模块。每个文件实现对应子命令的参数解析、校验以及向核心服务的委托调用。它们共同构成了系统的完整命令行界面。

## 按功能区域分组

- **初始化与配置** — `init.ts`、`config.ts`、`languages.ts`、`llm.ts`、`hook.ts`、`repo.ts`  
  搭建仓库结构、管理设置、选择文档语言、配置 LLM 提供商、设置 Git 钩子，以及执行仓库级别操作。

- **扫描与分析** — `scan.ts`、`check.ts`、`fix.ts`、`try.ts`、`info.ts`  
  扫描源代码、运行一致性检查、尝试自动修复、预览预运行结果，以及生成系统信息报告。

- **同步与发布** — `sync.ts`、`publish.ts`、`status.ts`、`history.ts`  
  将内容镜像到文档图谱、协调预检与回填、报告同步状态，以及获取变更历史。

- **构建与输出** — `build.ts`、`view.ts`  
  编排完整构建流程，并展示所选文档视图。

- **特殊命令** — `god.ts`（上帝模式，含警告）、`mcp.ts`（模型上下文协议服务器）、`remove.ts`（清理托管工件）、`usage.ts`（使用报告）。

## 关键实现区域

- `init.ts` 是引导 ArchSpine 环境的入口，负责设置仓库结构和初始配置。
- `scan.ts` 执行源代码扫描，可选干运行模式。
- `sync.ts` 编排核心镜像同步工作流。
- `publish.ts` 在同步之上增加预检、文档回填和图谱状态管理功能。
- `check.ts` 通过运行时服务触发 `CheckService`，并以结构化错误报告失败。
- `fix.ts` 暴露修复子系统的外观接口。
- `god.ts` 在委托给上帝引擎之前向用户发出警告。

每个适配器遵循“薄外观”模式：先校验输入，再调用相应的核心服务或子系统。所有命令的错误处理和用户反馈保持一致性。