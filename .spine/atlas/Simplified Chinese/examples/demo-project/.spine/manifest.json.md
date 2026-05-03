# ArchSpine 健康检查配置摘要

本文档总结了 ArchSpine 系统生成的配置文件快照。它是一个轻量级、可读性高的健康检查视图，**并非**权威状态存储（实际状态存储于 `.spine/cache.db`）。操作人员和 CI 系统可借此快速评估同步健康和项目元数据。

## 配置参数说明

| 参数 | 说明 | 最近一次同步的示例值 |
|------|------|------------------------|
| `schemaVersion` | 定义此配置文件的格式版本。必须为 `1.0.0` 以确保与当前工具链兼容。 | `1.0.0` |
| `generatorVersion` | 生成此文件的 ArchSpine 生成器版本，用于追溯和升级决策。 | `archspine/1.0.0` |
| `project` | 人类可读的项目名称，用于在多项目环境中进行标识。 | `demo-project` |
| `sync.lastSyncAt` | 最近一次全量或增量同步的 ISO 8601 时间戳。时间戳过时表示仓库可能不同步。 | `2026-04-26T03:53:07.598Z` |
| `sync.lastSyncMode` | 指示上次同步是 `full`（全量）还是 `incremental`（增量），影响重建了多少状态。 | `full` |
| `sync.reverseIndexComplete` | 布尔标志；为 `false` 时，任何依赖反向索引的操作（如符号搜索）可能不完整。 | `true` |
| `sync.indexedUnitCount` | 成功索引的源单元数量。低于预期可能表示缺少文件或扫描失败。 | `7` |
| `sync.llm.provider` | 上次同步使用的 LLM 提供商（例如 `mock`、`openai`、`gemini`），对成本和一致性审计重要。 | `mock` |
| `sync.llm.providerSource` | 提供商选择来源（`project-config` 或 `global-config`），影响覆盖行为。 | `project-config` |
| `sync.llm.model` | 用于 LLM 调用的具体模型名称。 | `deepseek-chat` |
| `sync.llm.modelSource` | 模型的来源，用于调试模型解析优先级。 | `global-config` |
| `health.activeViolations` | 当前未解决的规则违规数量。零为理想值，正值需要调查。 | `0` |
| `health.lastSyncDurationMs` | 上次同步所花费的毫秒数，用于性能趋势分析。 | `826` |

## 操作风险与稳定性注意事项

- **派生视图，非主状态。** 此文件是同步过程生成的快照，权威状态在 `.spine/cache.db` 中。即使 `activeViolations` 为零，也不能保证底层缓存未损坏或是最新状态。
- **时间戳过时风险。** 如果 `lastSyncAt` 明显早于当前时间，仓库可能已不同步。做出关键决策前请务必与实际仓库状态交叉验证。
- **索引完整性保护。** 任何依赖反向索引的操作（如符号搜索、依赖分析）必须在 `reverseIndexComplete === true` 的情况下才能信任。若为 `false`，可能导致结果不完整。
- **零违规 ≠ 一切正常。** 缓存中可能存在尚未反映在此快照中的未解决违规。进行治理审计时，请务必与完整清单和缓存核对。
- **提供商/模型解析。** 不同同步之间更改 `llm.provider` 或 `llm.model` 会影响成本和输出一致性。`providerSource` 和 `modelSource` 字段有助于调试意外的覆盖行为。

## 操作人员注意事项（关键不变量）

- `schemaVersion` 必须为 `1.0.0` 以确保协议兼容。
- `generatorVersion` 应符合预期的 ArchSpine 版本模式。
- `lastSyncAt` 必须是有效的 ISO 8601 UTC 时间戳，避免时间漂移问题。
- `reverseIndexComplete` 必须为 `true` 才能使用基于索引的功能。
- `health.activeViolations` 必须为 `0` 才表示健康状态。

请将此文件视为快速诊断指标。对于关键操作，请始终根据 `.spine/cache.db` 中的权威状态进行验证。