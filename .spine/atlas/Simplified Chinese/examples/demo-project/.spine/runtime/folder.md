<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/runtime","role":"Execution checkpoint records for synchronization runs in the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory track the lifecycle and status of sync operations, record metadata about sync runs (full vs. incremental, hook mode, resume state), log per-stage progress and completion timestamps, capture filtered file paths and affected directories during scan-cleanup, and record AST extraction results per source file as well as summarization results per configuration or documentation file.","children":[{"filePath":"examples/demo-project/.spine/runtime/checkpoints","role":"This directory contains execution records for synchronization runs in the ArchSpine mirror system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:01:40.750Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 运行时目录

`runtime` 目录负责存储 ArchSpine 镜像系统中所有同步操作的执行检查点记录。它是系统的运行记忆，追踪每次同步的生命周期、状态和详细元数据。

## 结构

- **`checkpoints/`** — 唯一的子目录，包含每次同步运行的独立检查点文件。每个检查点记录：
  - 同步类型（全量 vs 增量）
  - 钩子模式
  - 恢复状态
  - 各阶段的进度与完成时间戳
  - 扫描清理过程中过滤的文件路径及受影响的目录
  - 每个源文件的 AST 提取结果
  - 配置文件与文档文件的摘要结果

## 实现重点

该目录对以下环节至关重要：
- **同步生命周期管理**：通过持久化状态支持可恢复和增量同步。
- **审计与调试**：提供完整的同步操作历史，便于异常排查。
- **流水线集成**：`provenance` 块显示这些记录由 `archspine/1.0.0` 生成器产出，并经 `ast` 和 `llm` 阶段处理，意味着检查点数据同时包含结构化和语义层面的信息。

## 具体子模块

- **checkpoints/**：该文件夹内的每个文件对应一次同步执行，命名通常关联时间戳或运行 ID。存储的数据可用于后续的恢复操作或事后分析。

如需进一步探索，可参考同级目录如 `ast`（AST 提取结果）和 `config`（项目配置），这些目录与运行时记录相互配合。