# ArchSpine Atlas 清单 – 运维摘要

## 用途

此清单文件（`atlas.json`）是 ArchSpine Atlas 系统的中央索引，记录了所有已索引的源文件及其内容指纹（SHA-256 哈希），以及各语言环境下的文档链接。同时包含同步检查点数据，供运行时判断是否需要重新扫描。

## 关键参数及其控制内容

| 参数 | 含义 | 重要性 |
|------|------|--------|
| `schemaVersion` | 清单模式的版本号。 | 升级此版本可能破坏与旧工具的兼容性。 |
| `generatorVersion` | 创建此清单的 ArchSpine 工具精确版本。 | 便于调试和迁移。 |
| `createdAt` / `updatedAt` | 初始创建和最后修改的时间戳。 | 用于追踪索引的生命周期和检测过时状态。 |
| `sync.lastSyncAt` | 上次同步完成的时间。 | 用于增量同步决策。 |
| `sync.lastSyncMode` | `'full'` 或 `'incremental'`。 | 影响索引的可信度。 |
| `sync.reverseIndexComplete` | 布尔值：反向索引（从文档映射回源文件）是否已完全构建。 | 若为 `false`，视图生成和某些查询会降级，需谨慎处理。 |
| `sync.indexedUnitCount` | 当前跟踪的源单元数量。 | 应与 `files` 对象中的键数量一致；**不一致表示数据损坏**。 |
| `files.<path>.contentHash` | 文件内容的 SHA-256 十六进制摘要。 | 用于在不重新读取整个文件的情况下检测修改。 |
| `files.<path>.fileKind` | 文件分类（如 `source`、`test`、`config`）。 | 影响所应用的分析流程。 |
| `files.<path>.lastIndexedAt` | 该文件上次被索引的时间戳。 | 判断是否需要重新索引。 |
| `files.<path>.docs` | 语言环境与 Atlas 文档路径的数组。 | 每个条目必须有有效的语言代码且路径位于 `.spine/atlas/` 下。 |
| `files.<path>.sourceExists` | 布尔值：源文件是否仍存在于磁盘上。 | 使系统能够优雅处理已删除的文件。 |

## 运维风险与稳定性注意事项

- **唯一真实数据源**：此清单是所有索引和分析的基础。若其内容不一致（例如 `contentHash` 与实际文件内容不匹配），分析和修复操作会产生误报或遗漏违规。
- **文件损坏或删除**：如果此文件被删除或损坏，下次同步时会触发**完全重新索引**，这可能非常耗时。
- **`reverseIndexComplete` 标志**：若设为 `false`，视图生成和某些查询功能会降级。仅在反向索引完全构建后才应设为 `true`，并确保构建过程可靠。
- **`indexedUnitCount` 不匹配**：如果 `files` 中的条目数量与 `sync.indexedUnitCount` 不同，则清单已损坏。运维人员应在每次同步后验证此计数。
- **`contentHash` 完整性**：哈希必须与实际文件内容一致。若文件发生变化而未更新哈希，系统将无法检测到变更。请仅使用授权的 ArchSpine 工具更新清单。
- **文件系统同步**：整个系统的完整性依赖于此清单与文件系统保持同步。任何手动编辑或带外修改都可能导致不稳定。

## 示例（基于当前上下文）

- `files` 中包含两个条目（`src/auth.ts` 和 `src/sync.ts`），均为 `source` 类型，文档语言为 `zh-CN`。
- `reverseIndexComplete` 为 `false` —— 意味着在运行完整的反向索引构建之前，某些跨引用查询可能无法正常工作。
- `sync.lastSyncMode` 为 `full` —— 上次同步时完全重建了索引。