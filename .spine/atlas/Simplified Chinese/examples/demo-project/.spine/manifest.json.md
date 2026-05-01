<!-- spine-content-hash:12c8b567f15a43d187207ac6c3e019507bdfb4a50548331f7d1f7116b6edfc1a -->
# ArchSpine 健康与同步快照

## 角色
提供 ArchSpine 镜像系统的同步状态和约束健康状况的轻量级只读快照。

## 主要职责
- 记录最近一次同步的时间戳和模式（完整同步或增量同步）。
- 报告反向索引是否完整以及已索引的单元数量。
- 公开最近一次同步使用的 LLM 提供商和模型。
- 报告当前活跃的约束违规数量以及最近一次同步的持续时间。

## 重要不变性
- `activeViolations` 必须为非负数。
- `lastSyncDurationMs` 必须为非负数。
- `indexedUnitCount` 必须为非负数。
- `reverseIndexComplete` 必须为布尔值。

## 负面范围
此文件不直接控制系统行为。它是一个派生的只读快照。核心状态存储在 `.spine/cache.db` 中。

## 导出的外部可见行为
该文件在 `sync` 和 `health` 命名空间下公开一组扁平字段。所有值均为信息性，用于监控、告警和调试。不导出任何函数或类。

## 参数定义
- `schemaVersion`：此文件所遵循的架构版本。
- `generatorVersion`：生成此文件的 ArchSpine 生成器版本。
- `project`：此配置所属的项目名称。
- `sync.lastSyncAt`：最近一次同步的 ISO 8601 时间戳。
- `sync.lastSyncMode`：最近一次同步的类型（例如 full 或 incremental）。
- `sync.reverseIndexComplete`：布尔值，指示最近一次同步是否完整构建了反向索引。
- `sync.indexedUnitCount`：最近一次同步中索引的单元数量。
- `sync.llm.provider`：最近一次同步使用的 LLM 提供商（例如 mock、openai）。
- `sync.llm.providerSource`：LLM 提供商配置的来源（例如 project-config、global-config）。
- `sync.llm.model`：最近一次同步使用的 LLM 模型（例如 deepseek-chat）。
- `sync.llm.modelSource`：LLM 模型配置的来源（例如 global-config）。
- `health.activeViolations`：当前活跃的约束违规数量。零表示系统健康。
- `health.lastSyncDurationMs`：最近一次同步操作的持续时间（毫秒）。
- `_note`：提示信息，说明核心状态存储在 `.spine/cache.db` 中。

## 稳定性与风险
此文件是一个派生的只读快照，不直接控制系统行为。但如果其值与缓存数据库不一致，监控和告警系统可能会误报或遗漏真实问题。非零的 `activeViolations` 表示存在约束违规，可能影响下游操作。过高的 `lastSyncDurationMs` 可能表明性能下降或资源争用。LLM 提供商和模型字段仅供参考；若与实际运行时配置不匹配，可能在调试时造成混淆。