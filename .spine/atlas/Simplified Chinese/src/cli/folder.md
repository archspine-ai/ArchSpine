<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli","role":"Entry point and command-line interface layer for the ArchSpine system, handling user commands, argument parsing, help presentation, and runtime bootstrapping.","responsibility":"Provides the complete command-line interface for ArchSpine, including the main entry point (index.ts), help text rendering, utility functions for UI formatting and configuration parsing, and subdirectories for command adapters (commands), initialization (init), and repository artifact management (repo). Collectively, these components enable users to interact with ArchSpine's semantic mirror workflows through terminal commands.","children":[{"filePath":"src/cli/cli-utils.ts","role":"CLI UI presentation utility for formatting language discovery results, conditional banner rendering, and configuration value parsing.","fileKind":"source"},{"filePath":"src/cli/commands","role":"CLI command adapters for the ArchSpine system, each handling a specific subcommand's argument parsing, validation, and delegation to core services.","fileKind":"folder"},{"filePath":"src/cli/document-languages.ts","role":"Configuration module defining types and constants for document language selection in multilingual documentation tiers.","fileKind":"source"},{"filePath":"src/cli/help.ts","role":"CLI help text renderer for the ArchSpine command-line interface.","fileKind":"source"},{"filePath":"src/cli/index.ts","role":"Primary CLI entrypoint and command router for the ArchSpine semantic mirror system.","fileKind":"source"},{"filePath":"src/cli/init","role":"This directory contains the initialization and bootstrapping subsystem for the ArchSpine project.","fileKind":"folder"},{"filePath":"src/cli/repo","role":"CLI command adapter for managing repository artifact strategies.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-02T07:41:55.417Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/cli` — 命令行界面与入口点

`src/cli` 目录是 ArchSpine 语义镜像系统的用户门户。它负责所有终端交互：解析命令、显示帮助、引导运行时以及将任务委托给核心服务。

## 值得注意的子模块

- **`index.ts`** — 主 CLI 入口和命令路由器。它解释用户的调用并分派到相应的子命令。
- **`commands/`** — 包含 ArchSpine 各子命令适配器的文件夹。每个适配器负责参数验证并委托给核心业务逻辑。
- **`init/`** — 初始化与引导子系统，负责新建 ArchSpine 项目（配置文件、脚手架等）。
- **`repo/`** — 用于管理仓库工件策略（如快照、版本控制策略）的 CLI 适配器。
- **`help.ts`** — 渲染 CLI 帮助文本，包括使用示例和命令说明。
- **`cli-utils.ts`** — 提供 UI 格式（语言发现横幅、条件输出）和配置值解析的实用函数。
- **`document-languages.ts`** — 定义选择多语言文档层级的类型和常量。

## 关键实现领域

- **参数解析与路由**：`index.ts` 和 `commands/` 内的适配器构成了 CLI 调度机制的核心。
- **帮助系统**：`help.ts` 提供动态生成的帮助输出。
- **初始化工作流**：`init/` 子目录处理项目脚手架，是新用户的关键入口。
- **仓库工件管理**：`repo/` 子目录暴露 CLI 命令，用于控制仓库工件的生成与维护方式。
- **语言配置**：`document-languages.ts` 和 `cli-utils.ts` 协同实现语言感知的帮助与配置。