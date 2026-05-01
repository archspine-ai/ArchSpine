<!-- spine-content-hash:3c804d04f25db77916c68d65da444cb25a44fe66eb6911dc4bc1bca4c12b9a33 -->
# ArchSpine 清单与快照外观模块

该模块是 ArchSpine 系统的基础设施外观，负责清单文件的持久化、反向索引状态跟踪以及语言快照的输入输出。

## 角色

提供一个稳定的底层持久化层，将文件 I/O 细节隔离在公共接口之后。该模块不编排扫描或索引工作流。

## 主要职责

- 定义 `ManifestRuntimeState` 接口，用于跟踪反向索引完成状态。
- 定义 `ManifestStatusSource` 接口，用于查询全局文件计数和活跃违规。
- 从 `.spine` 目录的 JSON 文件中加载清单运行时状态。
- 使用状态源判断清单状态是否为“初始”（无先前同步）。
- 检查清单基线文件是否存在。
- 将反向索引完成状态持久化到清单 JSON 中。
- 保存完整的清单状态，包括运行时状态、状态、模式、持续时间以及可选的 LLM 元数据。
- 从 `.spine` 目录加载语言快照 JSON 文件。
- 将语言快照 JSON 文件保存到 `.spine` 目录。

## 重要不变性

- 所有清单和快照文件路径均通过 `./io.js` 辅助函数（`getManifestPath`、`getLanguageSnapshotPath`）派生。
- 清单状态以 JSON 格式持久化在 `.spine` 目录中。
- 语言快照以 JSON 格式持久化在 `.spine` 目录中。
- 该模块不导入服务、任务或引擎层，保持基础设施隔离。

## 不涉及范围

- 直接文件系统操作（委托给 `FileSystemManager` 和 `./io.js`）。
- 反向索引生成或扫描逻辑。
- 语言快照内容生成或验证。
- 扫描或索引工作流的编排。

## 公共接口

- `ManifestRuntimeState`
- `ManifestStatusSource`
- `loadManifestState`
- `isVirginManifestState`
- `hasManifestBaseline`
- `persistReverseIndexState`
- `saveManifestState`
- `loadLanguageSnapshot`
- `saveLanguageSnapshot`