<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/runtime/checkpoints","role":"This directory contains execution records for synchronization runs in the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory track the lifecycle and status of sync operations, record metadata about sync runs (full vs. incremental, hook mode, resume state), log per-stage progress and completion timestamps, capture filtered file paths and affected directories during scan-cleanup, and record AST extraction results per source file as well as summarization results per configuration or documentation file.","children":[{"filePath":"examples/demo-project/.spine/runtime/checkpoints/sync.json","role":"Execution record for a synchronization run in the ArchSpine mirror system","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:39.407Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `checkpoints/` — 同步执行记录

此目录存储 ArchSpine 镜像系统中同步运行的执行记录。每个检查点文件记录了同步操作的生命周期和状态，包括运行类型（全量 vs. 增量）、钩子模式、恢复状态、各阶段进度、完成时间戳、过滤后的文件路径、扫描清理期间受影响的目录、每个源文件的 AST 提取结果以及每个配置或文档文件的摘要结果。

该目录目前包含一个重要的子项：

- **`sync.json`** — 同步运行的执行记录。该文件从开始到结束跟踪同步操作的所有细节，用于恢复中断的同步或审计过去的运行。

关键实现领域包括：
- **运行生命周期跟踪** — 记录同步操作的开始、进度和完成。
- **元数据捕获** — 存储运行类型、钩子模式和恢复状态。
- **文件和目录日志记录** — 捕获扫描清理期间过滤后的文件路径和受影响的目录。
- **AST 和摘要结果** — 记录每个源文件的提取结果和每个配置/文档文件的摘要结果。