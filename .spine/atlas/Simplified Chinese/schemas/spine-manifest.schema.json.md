<!-- spine-content-hash:63ef3291e0e8d90eebfe8cf16f0263163dee1ebc6b8255f0e00a67023c0a4c4d -->
# ArchSpine SpineManifest 架构

## 角色

定义 ArchSpine SpineManifest 的架构，这是一个元数据清单，用于跟踪镜像仓库的同步状态和已索引文件清单。

## 主要职责

- 声明 `spine-manifest.json` 文件所需的结构和验证规则
- 强制要求必填字段：`schemaVersion`、`generatorVersion`、`createdAt`、`updatedAt`、`sync`、`files`
- 管理同步元数据块，包括上次同步时间戳、模式、反向索引完整性和已索引单元计数
- 管理文件清单块，将仓库相对路径映射到其内容哈希、文件类型、上次索引时间戳、关联文档语言区域和源文件存在标志

## 重要不变量

- `sync` 对象必须始终包含 `lastSyncAt`、`lastSyncMode`、`reverseIndexComplete` 和 `indexedUnitCount`
- `lastSyncMode` 必须是以下之一：`'full'`（全量）、`'incremental'`（增量）或 `'unknown'`（未知）
- `indexedUnitCount` 必须是非负整数
- 每个文件条目必须包含 `contentHash`、`fileKind`、`lastIndexedAt`、`docs` 和 `sourceExists`
- `files` 对象的键必须符合仓库相对路径格式
- 根级别以及 sync 或文件条目对象内不允许有额外属性

## 负面范围

此架构不定义实际的同步逻辑、文件索引算法或存储后端。它仅定义清单文件本身的结构和验证规则。

## 最重要的导出行为

此架构强制保证了脊柱清单的结构完整性，这对于镜像系统跟踪同步状态和文件清单至关重要。违反架构（例如缺少必填字段、无效的枚举值或负数计数）将导致验证失败，可能中断同步操作或损坏清单。严格的 `additionalProperties: false` 约束防止注入意外字段，降低了静默数据损坏的风险。`reverseIndexComplete` 标志是一个安全不变量：如果该标志为 `false` 而 `indexedUnitCount` 大于 0，下游工具可能会基于不完整的数据进行操作。可空的 `lastSyncAt` 字段允许优雅地处理从未同步过的仓库。总体而言，严格遵守此架构对于可靠的镜像状态管理和恢复至关重要。

## 参数定义

- **schemaVersion**：引用共享的架构版本定义；确保与预期的架构修订版本兼容。
- **generatorVersion**：标识生成此清单的工具版本的非空字符串。
- **createdAt**：ISO 8601 时间戳，标记此清单首次创建的时间。
- **updatedAt**：ISO 8601 时间戳，标记此清单的最后修改时间。
- **sync.lastSyncAt**：可为空的 ISO 8601 时间戳，表示最近一次同步事件的时间；null 表示从未同步过。
- **sync.lastSyncMode**：枚举字段，指示同步模式：`'full'`（全量）、`'incremental'`（增量）或 `'unknown'`（未知）。
- **sync.reverseIndexComplete**：布尔标志，指示反向索引（将索引单元映射回文件）是否已完全构建。
- **sync.indexedUnitCount**：非负整数，统计仓库中已索引单元（例如文档或片段）的总数。
- **files.\<path\>.contentHash**：文件内容的哈希值，用于检测变更并确保完整性。
- **files.\<path\>.fileKind**：文件类型的分类（例如源代码、文档、配置），由共享的 fileKind 架构定义。
- **files.\<path\>.lastIndexedAt**：ISO 8601 时间戳，表示此文件最后一次被索引的时间。
- **files.\<path\>.docs**：关联文档条目的数组，每个条目包含一个语言区域和一个仓库相对路径。
- **files.\<path\>.sourceExists**：布尔值，指示原始源文件是否仍然存在于磁盘上。

## 稳定性与风险

此架构强制保证了脊柱清单的结构完整性，这对于镜像系统跟踪同步状态和文件清单至关重要。违反架构（例如缺少必填字段、无效的枚举值或负数计数）将导致验证失败，可能中断同步操作或损坏清单。严格的 `additionalProperties: false` 约束防止注入意外字段，降低了静默数据损坏的风险。`reverseIndexComplete` 标志是一个安全不变量：如果该标志为 `false` 而 `indexedUnitCount` 大于 0，下游工具可能会基于不完整的数据进行操作。可空的 `lastSyncAt` 字段允许优雅地处理从未同步过的仓库。总体而言，严格遵守此架构对于可靠的镜像状态管理和恢复至关重要。