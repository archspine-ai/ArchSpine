<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/runtime","role":"Execution checkpoint records for synchronization runs in the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory track the lifecycle and status of sync operations, record metadata about sync runs (full vs. incremental, hook mode, resume state), log per-stage progress and completion timestamps, capture filtered file paths and affected directories during scan-cleanup, and record AST extraction results per source file as well as summarization results per configuration or documentation file.","children":[{"filePath":"examples/demo-project/.spine/runtime/checkpoints","role":"This directory contains execution records for synchronization runs in the ArchSpine mirror system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:01:40.750Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `.spine/runtime` — 执行检查点记录

本目录存放 ArchSpine 镜像系统中同步操作的完整生命周期追踪与状态元数据。它充当系统的运行内存，记录每一次同步操作的进度、结果及相关辅助数据。

## 主要子目录

- **`checkpoints/`** — 存储每次同步运行的执行记录。每个检查点不仅记录了同步是完整扫描还是增量扫描、使用哪种钩子模式（如`pre-commit`或`post-commit`）、是否从中断处恢复运行，还包含了各阶段的时间戳、扫描清理过程中被过滤的文件路径、每个源文件的抽象语法树提取结果、以及每个配置或文档文件的摘要结果。

## 关键实现领域

以下子模块承载了最重要的功能：

- **同步生命周期记录** — 记录镜像启动、阶段转换和完成的全过程。
- **元数据持久化** — 存储运行类型（完整/增量）、钩子上下文和恢复状态，以实现崩溃后的回恢复。
- **过滤与扫描日志** — 捕获哪些文件被过滤、哪些目录在清理扫描中被触及。
- **AST 提取记录** — 针对每个源文件详细记录结构解析器提取的内容。
- **摘要记录** — 针对每个配置或文档文件，记录在 LLM 处理阶段生成的摘要。

这些子模块共同确保每一次镜像操作都可审计、可恢复，系统能够输出详细的运行历史以支持诊断或回滚决策。