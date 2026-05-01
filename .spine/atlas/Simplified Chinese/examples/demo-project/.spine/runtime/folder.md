<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/runtime","role":"Execution checkpoint records for synchronization runs in the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory track the lifecycle and status of sync operations, record metadata about sync runs (full vs. incremental, hook mode, resume state), log per-stage progress and completion timestamps, capture filtered file paths and affected directories during scan-cleanup, and record AST extraction results per source file as well as summarization results per configuration or documentation file.","children":[{"filePath":"examples/demo-project/.spine/runtime/checkpoints","role":"This directory contains execution records for synchronization runs in the ArchSpine mirror system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:01:40.750Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 运行时检查点

`runtime` 目录是 ArchSpine 镜像系统的运行神经中枢。它存储每次同步操作的执行检查点记录，捕获同步操作的完整生命周期和状态。

## 结构

该目录包含一个子文件夹：

- **`checkpoints/`** — 此文件夹保存所有同步操作的执行记录。每条记录跟踪操作的元数据，包括是全量还是增量运行、使用的钩子模式以及恢复状态。它记录每个阶段的进度和完成时间戳，捕获扫描清理期间过滤的文件路径和受影响的目录，并记录每个源文件的 AST 提取结果以及每个配置或文档文件的摘要结果。

## 关键实现领域

检查点系统对于以下方面至关重要：
- **同步生命周期跟踪** — 记录运行何时开始、经过哪些阶段以及何时完成
- **运行元数据** — 区分全量与增量运行、钩子模式和恢复状态
- **文件级粒度** — 捕获哪些文件被扫描、清理、通过 AST 提取以及被摘要
- **操作调试** — 为排查同步问题提供完整的审计追踪