# ArchSpine SpineManifest 配置摘要

该 JSON Schema 定义了 ArchSpine SpineManifest 文件的结构与校验规则，确保同步状态记录和文件索引的一致性与正确性。清单包含必要的元数据（`schemaVersion`、`generatorVersion`、`createdAt`、`updatedAt`）、同步状态对象以及文件索引。

## 关键参数

- `schemaVersion` 和 `generatorVersion` – 必须符合共享定义；不匹配会导致不兼容。
- `sync.lastSyncAt` – 记录最近一次同步的时间戳，影响数据新鲜度检查。
- `sync.lastSyncMode` – 取值为 `"full"`、`"incremental"` 或 `"unknown"`，决定后续同步策略。
- `sync.reverseIndexComplete` – 布尔标志，表示反向索引是否构建完成，影响查询完整性。
- `sync.indexedUnitCount` – 非负整数，用于进度监控和一致性校验。
- `files.<路径>.contentHash` – 文件内容的哈希值，用于完整性校验和变更检测。
- `files.<路径>.sourceExists` – 标识源文件是否仍然存在，影响重建决策。
- `files.<路径>.docs` – 对象数组，每个对象包含 `locale` 和 `path`，引用相关文档。

## 稳定性与操作风险

该 Schema 对清单文件实施严格校验。数据不完整或枚举值无效（如同步模式未知）可能导致同步失败或索引损坏。非负计数和正确的时间戳等不变量能够防止逻辑冲突。`schemaVersion` 不匹配可能导致生成器与消费者之间不兼容。操作人员应确保数据完整性，并在同步过程中监控校验错误。