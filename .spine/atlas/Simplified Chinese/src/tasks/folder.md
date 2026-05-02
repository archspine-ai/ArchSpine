<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/tasks","role":"Pipeline task orchestration and execution layer for the ArchSpine mirror system.","responsibility":"Implements and coordinates all pipeline stages including scanning, AST extraction, lightweight and full summarization, architectural validation, automated fixing, documentation backfill, reverse indexing, view derivation, and state commitment. Each task module encapsulates a specific stage, manages its lifecycle (checkpoints, concurrency, caching), and produces structured output for downstream stages.","children":[{"filePath":"src/tasks/aggregate.ts","role":"Core pipeline task for hierarchical content aggregation across directories and projects.","fileKind":"source"},{"filePath":"src/tasks/ast-extra.ts","role":"Core pipeline task for AST extraction and symbol registration within the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/tasks/document-backfill.ts","role":"Pipeline task module for backfilling project documentation by generating markdown content from JSON data via LLM prompts, with content hash tracking for idempotency.","fileKind":"source"},{"filePath":"src/tasks/fix.ts","role":"SpineTask implementation for the automated LLM-driven architectural violation fixing stage in the pipeline.","fileKind":"source"},{"filePath":"src/tasks/lite-summarize.ts","role":"Pipeline task for lightweight source code summarization, processing filtered files from the extraction stage and delegating to a dedicated summarization method.","fileKind":"source"},{"filePath":"src/tasks/post-commit-derivation.ts","role":"Pipeline stage task orchestrating post-commit derivation of views, aggregations, and reverse indices.","fileKind":"source"},{"filePath":"src/tasks/reconcile.ts","role":"ArchSpine reconciliation task that synchronizes the manifest's file status with the actual repository state, validates index document compatibility, and updates cache metadata.","fileKind":"source"},{"filePath":"src/tasks/reverse-index.ts","role":"Core pipeline task for constructing reverse dependency edges from forward dependency index files.","fileKind":"source"},{"filePath":"src/tasks/scan-cleanup.ts","role":"Pipeline stage task for scanning the file system and cleaning up orphaned or stale files within the ArchSpine tracked state.","fileKind":"source"},{"filePath":"src/tasks/state-commit.ts","role":"Pipeline stage task for committing synchronized file state (hashes and metadata) to the SQLite database after AST extraction and LLM summarization.","fileKind":"source"},{"filePath":"src/tasks/summarize.ts","role":"ArchSpine summarization pipeline task module that orchestrates LLM-based semantic summary generation from source code extraction outputs.","fileKind":"source"},{"filePath":"src/tasks/validate.ts","role":"ArchSpine validation task orchestrator for LLM-powered architectural rule compliance checking.","fileKind":"source"},{"filePath":"src/tasks/view-derivation.ts","role":"Pipeline task stage that orchestrates the derivation of multiple architectural views (public surface, risk hotspots, architecture diagram) from committed changes using the ViewService facade.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T10:11:08.494Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/tasks` — 流水线任务编排层

本目录包含驱动 ArchSpine 镜像系统各处理阶段的所有流水线任务模块。每个模块封装了单一阶段的逻辑——从文件系统扫描、AST 符号提取，到生成轻量与完整摘要、验证架构规则、执行自动修复、反向填充文档、构建反向索引、推导架构视图，以及将变更状态提交到 SQLite 数据库。

## 子模块及其分组

- **扫描与同步**  
  `scan-cleanup.ts`、`reconcile.ts` —— 检查实际文件系统，清理孤立项，确保清单与仓库状态一致。

- **AST 提取**  
  `ast-extra.ts` —— 提取 AST 级别的符号并在镜像的符号索引中注册。

- **摘要生成（轻量与完整）**  
  `lite-summarize.ts`、`summarize.ts` —— 通过 LLM 调用先生成简明的摘要，再生成全面的语义摘要。

- **验证与自动修复**  
  `validate.ts`、`fix.ts` —— 检查架构规则的符合性，并尝试由 LLM 驱动的修正。

- **文档反向填充**  
  `document-backfill.ts` —— 利用 LLM 提示从 JSON 数据生成缺失的 Markdown 文档，并通过内容哈希实现幂等性。

- **反向索引**  
  `reverse-index.ts` —— 从正向依赖索引文件构建反向依赖关系。

- **视图推导与提交后推导**  
  `view-derivation.ts`、`post-commit-derivation.ts` —— 推导架构视图（公开表面、风险热点、架构图），并在状态提交后生成聚合与索引。

- **状态提交**  
  `state-commit.ts` —— 在提取和摘要之后，将哈希与元数据写入 SQLite 数据库。

- **聚合**  
  `aggregate.ts` —— 跨目录和项目执行分层的逻辑内容聚合。

## 关键实现要点

- **生命周期管理** —— 每个任务处理检查点、并发与缓存，以支持部分重运行和高效的增量处理。
- **LLM 集成** —— 用于摘要、验证、修复和文档反向填充，包含提示模板与响应解析。
- **持久化抽象** —— 状态提交和同步通过统一的数据访问层与 SQLite 交互。
- **幂等性** —— 内容哈希（如 `document-backfill.ts` 中）和清单比较确保任务的安全重复执行。

这些模块共同构成了一条模块化、可扩展的流水线，每个阶段消费前一阶段的输出，并为下一阶段生成结构化数据。