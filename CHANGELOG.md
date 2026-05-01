# Changelog

ArchSpine 面向公开发布版本的显著变化记录在此文件中。
封闭开发阶段的内部演进记录不在这里保留。

## [Unreleased]

- 暂无

## [1.0.0] - 2026-04-24

### 🚀 新功能 (Added)

- 首个公开发布版本。
- 提供 `spine init`、`sync`、`check`、`fix`、`mcp start` 等核心工作流。
- 提供本地 MCP Server、结构化 `.spine` 控制面、视图层产物与多语言扫描能力。
- `spine init` 新增仓库产物策略选择：支持 `local` 与 `distributable` 两种 Git 集成模式。
- 新增 `spine init --artifact-strategy <local|distributable>`，支持非交互初始化时显式指定策略。
- 新增 `spine sync --retry-failed`，支持基于最新 sync checkpoint 定点重跑失败文件。

### 🛡️ 系统增强 (Security & Reliability)

- `.spine` 更新采用原子写入与运行时锁保护。
- 提供可配置 Scan Policy，并支持 Git 集成下的仓库产物策略。
- 当前运行时只接受 `1.0.0` schema；过期快照会被明确拒绝并提示重建。
- Atlas 写入前会自动清理已不在配置中的旧 locale 目录。
- 当请求 markdown 输出但模型未返回任何目标语言 block 时，文件会被明确标记为 failed，而不是记为部分成功。

### 📄 文档 (Documentation)

- 提供公开版双语 README 与文档站入口。
- 协议与运行时版本线对齐到 `1.0.0`。
- Runbook、CLI help 与当前恢复分流保持一致：`publish` 负责 Atlas 回填，`sync --retry-failed` 负责定点补跑 sync 失败。

### 🛠️ 重构 (Changed)

- 将 `src/cli/index.ts` 中的 `init` 主流程拆分为独立的命令编排层、仓库集成层和运行时引导层。
- `spine remove` 现在会对称回滚 ArchSpine 托管的 `.gitignore` / `.gitattributes` block。
- `examples/demo-project/` 已对齐为分发型参考项目，补充 `.gitattributes` 并调整 `.gitignore` 默认策略。
- 运行时已移除对 `schemaVersion: "0.4.0"` 的兼容迁移逻辑；旧配置与旧索引快照现在会被明确拒绝，并要求执行 `spine build` 重建。

### ✅ 测试 (Tests)

- 扩展初始化工具测试，覆盖 `.gitignore` / `.gitattributes` managed sync 与清理。
- 新增 CLI 级初始化集成测试，验证 `dist/cli/index.js init --artifact-strategy distributable` 与 `remove --yes` 的端到端行为。
