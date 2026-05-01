<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli","role":"CLI layer providing user-facing commands, utilities, and initialization logic for the ArchSpine system.","responsibility":"Collectively, this directory implements the command-line interface of ArchSpine, including argument parsing, command routing, help text rendering, configuration bootstrapping, language discovery, repository setup, and UI formatting utilities that bridge user input with core services.","children":[{"filePath":"src/cli/cli-utils.ts","role":"CLI UI presentation utility for formatting language discovery results, conditional banner rendering, and configuration value parsing.","fileKind":"source"},{"filePath":"src/cli/commands","role":"CLI command adapters that provide the user-facing interface for all ArchSpine operations.","fileKind":"folder"},{"filePath":"src/cli/document-languages.ts","role":"Configuration module defining types and constants for document language selection in multilingual documentation tiers.","fileKind":"source"},{"filePath":"src/cli/help.ts","role":"CLI help text renderer for the ArchSpine command-line interface.","fileKind":"source"},{"filePath":"src/cli/index.ts","role":"Primary CLI entrypoint and command router for the ArchSpine semantic mirror system.","fileKind":"source"},{"filePath":"src/cli/init","role":"This directory contains the initialization and bootstrapping subsystem for the ArchSpine project.","fileKind":"folder"},{"filePath":"src/cli/repo","role":"CLI command adapter for managing repository artifact strategies.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:01:50.635Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/cli` — ArchSpine 命令行界面

此目录实现了 ArchSpine 语义镜像系统的整个用户面向命令行层。它负责参数解析、命令路由、帮助文本渲染、配置引导、语言发现、仓库设置以及连接用户输入与核心服务的 UI 格式化工具。

## 主要子模块

- **`index.ts`** — 主 CLI 入口和命令路由器。所有用户命令在此被分发到对应的处理器。
- **`commands/`** — 包含命令适配器的文件夹，为所有 ArchSpine 操作提供用户界面。每个子命令（如 `init`、`repo`）在此拥有自己的适配器。
- **`init/`** — 初始化和引导子系统。处理首次项目设置、配置生成和环境验证。
- **`repo/`** — 用于管理仓库工件策略的 CLI 命令适配器，例如克隆、更新或列出镜像。
- **`cli-utils.ts`** — UI 展示工具，用于格式化语言发现结果、条件性横幅渲染和配置值解析。
- **`document-languages.ts`** — 配置模块，定义多语言文档层级中文档语言选择的类型和常量。
- **`help.ts`** — CLI 帮助文本渲染器，为所有命令生成格式化的使用信息。

## 关键实现领域

- **命令路由** 在 `index.ts` 中根据用户输入决定调用哪个处理器。
- **引导** 在 `init/` 中处理项目初始化的完整生命周期，包括依赖检查和模板生成。
- **仓库管理** 在 `repo/` 中提供用于操作远程和本地镜像仓库的命令。
- **语言发现** 工具在 `cli-utils.ts` 和 `document-languages.ts` 中支持多语言文档工作流。
- **帮助系统** 在 `help.ts` 中确保用户始终可以访问任何命令的清晰、结构化的文档。