<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli/repo","role":"CLI command adapter for managing repository artifact strategies.","responsibility":"Parses and validates artifact strategy input from CLI arguments, coordinates strategy checks and application via the repository admin service, provides user-facing console feedback, and integrates with system configuration for persisted and initialization strategies.","children":[{"filePath":"src/cli/repo/strategy.ts","role":"CLI command adapter for repository artifact strategy management within the ArchSpine system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.342Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/cli/repo` — 仓库制品策略 CLI 适配器

此目录包含负责管理 ArchSpine 系统中仓库制品策略的 CLI 命令适配器。它充当用户命令行参数与底层仓库管理服务之间的桥梁。

## 关键组件

- **`strategy.ts`** — 该目录中唯一的源文件。它负责解析并验证来自 CLI 参数的制品策略输入，通过仓库管理服务协调策略检查与应用，向用户提供控制台反馈，并与系统配置集成以支持持久化策略和初始化策略。

## 实现重点

该适配器处理三个关键领域：
1. **输入解析与验证** — 将原始 CLI 参数转换为结构化的策略命令。
2. **服务协调** — 将策略检查和应用委托给仓库管理服务。
3. **用户反馈** — 提供清晰的策略操作及其结果的控制台输出。

该模块是一个精简、专注的适配器，确保 CLI 展示层与业务逻辑之间的清晰分离。