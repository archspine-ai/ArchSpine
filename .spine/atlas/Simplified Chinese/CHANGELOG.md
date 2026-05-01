# ArchSpine 变更日志 — 摘要

## 目的

本文档记录 ArchSpine 每个公开发布版本中的显著变化，是版本追踪与升级规划的唯一权威变更日志。它是了解版本间变更（尤其是 schema 兼容性、CLI 行为变化和产物策略）的单一信息源。

## 读者对象

本变更日志面向以下人员：

- **开发者**：需要了解 API 和 CLI 变更
- **发布经理**：协调版本升级和迁移路径
- **系统集成人员**：依赖 ArchSpine 的 schema 和产物契约

文档采用中英双语编写，同时服务于人工阅读和自动化 CI 流水线。

## 本文档锚定的关键决策与工作流

- **Schema 版本强制**：运行时现在要求 schema 版本为 `1.0.0`；旧快照将被拒绝，需执行 `spine build` 重建。
- **产物策略选择**：`spine init` 支持两种 Git 集成模式——`local`（本地）和 `distributable`（可分发），通过 `--artifact-strategy` 参数指定。
- **可靠性保障**：`.spine` 更新采用原子写入和运行时锁保护；Atlas 写入前自动清理已不在配置中的旧 locale 目录。
- **CLI 架构**：命令已重构为独立的命令编排层、仓库集成层和运行时引导层。
- **重试机制**：`spine sync --retry-failed` 支持基于最新 sync checkpoint 定点重跑失败文件。
- **对称清理**：`spine remove` 现在会对称回滚托管的 `.gitignore` / `.gitattributes` 块。

## 1.0.0 版本新特性

- 首个公开发布版本，引入核心工作流：`init`、`sync`、`check`、`fix`、`mcp start`
- 提供本地 MCP Server、结构化 `.spine` 控制面、视图层产物与多语言扫描能力
- 示例项目已对齐为分发型参考布局
- 扩展了初始化、托管同步和端到端 CLI 行为的测试覆盖