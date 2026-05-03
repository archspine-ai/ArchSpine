该目录是 ArchSpine 系统中负责管理 SQLite 运行时数据库的基础设施层。它的核心职责涵盖数据库的完整生命周期：创建数据库文件、恢复预写日志（WAL）、初始化架构、提供原子批量提交机制（支持元数据提交并自动检测语义漂移）、将运行时数据库错误映射为标准错误码，以及提供稳定的 TypeScript 类型定义，从而将数据生产者（索引器、审计器）与消费者（CLI、服务）解耦。

主要模块按实现领域分组如下：

- **数据库生命周期管理** – `runtime.ts`（外观模块，确保 `.spine` 数据目录存在，在打开数据库前恢复陈旧 WAL 文件，并实例化 `better-sqlite3` 实例）、`wal-recovery.ts`（通过 512KB 阈值检测陈旧 WAL/SHM 文件并删除，防止空协调导致的速率限制过载）以及 `schema.ts`（初始化 `files` 表并通过 `journal_mode=WAL` 设置启用 WAL 日志模式）。

- **原子批量提交与漂移检测** – `batch.ts` 在事务中执行 `FileCommitRecord` 对象的原子插入/更新，比较提交记录中的先前角色与职责以检测语义漂移，并通过漂移仓库记录漂移事件。

- **错误映射** – `errors.ts` 将运行时数据库的未知错误（来自打开/初始化阶段）映射为标准的 `ArchSpineError` 实例，检测只读条件并分配相应的错误码（`RuntimeDbOpenFailed`、`RuntimeDbInitFailed`、`RuntimeDbReadonly`）。

- **数据访问层** – `repositories` 文件夹提供对漂移事件、文件元数据、符号、令牌使用和违规记录的 CRUD 操作，管理所有跟踪数据的持久化和检索。

- **共享类型契约** – `types.ts` 定义了 `FileRecord`、`FileStatusRecord`、`FileCommitRecord`、`DriftEvent`、`UsageSummaryRow`、`UsageTotals`、`ViolationRecord` 和 `GlobalStatus` 等接口，确保系统中数据形状的一致性。

这些模块共同构成数据库交互的骨干，最重要的实现领域包括 WAL 恢复（防止数据损坏和速率限制过载）、原子批量提交（维护数据完整性并检测漂移）以及标准化错误码（为上层提供稳健的错误处理）。