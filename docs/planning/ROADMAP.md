# ArchSpine 路线图

## V1.0.0 — 开源首发 `[当前]`

- [x] 核心 CLI 命令（init, sync, check, fix, status, view, publish, remove）
- [x] AST 提取（TypeScript, Python, Go, Java, Rust, C, C++）
- [x] 双语语义化摘要生成（English + Simplified Chinese）
- [x] 分层架构规则引擎 + 治理审计
- [x] MCP STDIO 服务器
- [x] LLM Provider 抽象层（OpenAI, Gemini, Mock）
- [x] 风险热点分析视图
- [x] 公共接口视图
- [x] 协议校验 + Schema 合规
- [x] 366 项测试全绿 · 零 lint · 发布门禁通过

## V1.1 — 架构收尾

### LLM Provider 瘦身

**现状：** `openai.ts` 和 `gemini.ts` 违反分层约束——Provider 客户端吸收了 prompt 生成、策略编排、响应解析，超出了 `LLMClient` 接口的薄传输层定位。

**目标：** 提取共享编排逻辑到独立层，Provider 回归纯 `generate(prompt)` 约定。

**影响文件：** `src/infra/llm/providers/openai.ts`, `gemini.ts`, `src/infra/llm/base.ts`, `src/infra/llm/runtime.ts`

**参考：** `.spine/rules/layered-architecture.yml` Infra Facade Imports 规则的 KnownExceptions

> 标签：`help-wanted` `good-first-issue` `refactor`

---

### 关键模块单元测试补全

**现状：** 21/27 个 engine + task 模块缺少专项单元测试。核心路径有集成/e2e 覆盖（summarize 被 14 个测试文件引用，scanner 被 10 个引用），但模块级回归防护不足。

**优先级最高的未测试文件：**

- `src/tasks/summarize.ts`（668 行）— LLM 流水线核心
- `src/engines/scanner.ts`（379 行）— 文件扫描引擎
- `src/tasks/validate.ts`（379 行）— 规则校验
- `src/engines/context.ts`, `src/engines/context-relevance.ts` — 上下文构建
- `src/engines/aggregator.ts` — 结果聚合

> 标签：`help-wanted` `good-first-issue` `testing`

---

### CLI 薄适配器重构

**现状：** `spine check` 报告两项 `cli-entrypoint-separation` 违规（Error 级）：

- `src/cli/commands/publish.ts` — `runPublishWorkflow` 编排了 sync/backfill/manifest 等流水线逻辑
- `src/cli/commands/try.ts` — `executeTryCommand` 直接读写文件系统、解析配置

**目标：** CLI 命令缩减为薄适配器（parse args → call service → format output），编排逻辑下沉到 `src/services/`。

> 标签：`help-wanted` `good-first-issue` `refactor`

---

## V1.2+ — 社区驱动的功能扩展

以下方向待社区反馈后确定优先级：

- **多仓库治理**：跨仓依赖拓扑、Monorepo 感知
- **CI/CD 原生集成**：GitHub App、GitLab CI 模板
- **增量 Sync**：仅对变更文件重新生成摘要，优化 LLM 成本
- **Code Review 辅助**：PR diff → 语义影响分析 → Review 建议
- **协议兼容性矩阵**：`.spine/` 协议版本迁移工具
- **插件系统**：自定义规则引擎、Provider 热插拔
