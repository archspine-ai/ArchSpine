# ArchSpine 基础设施 – SQLite 数据库层 (`src/infra/db`)

本目录为 ArchSpine 镜像系统提供核心持久化支持，管理 `.spine` 目录下 SQLite 运行时数据库的完整生命周期：包括数据库模式初始化、WAL 日志模式设置、原子批量提交、错误映射，以及数据访问层。通过稳定的 TypeScript 接口，该层将数据生产者（索引器、审计器）与消费者（CLI、服务）解耦。

## 主要组件与分组

- **运行时生命周期管理** (`runtime.ts`, `wal-recovery.ts`, `schema.ts`) – 负责数据库连接的启动和维护。`runtime.ts` 确保 `.spine` 目录存在，通过 `wal-recovery.ts` 恢复陈旧的 WAL 文件，然后实例化 `better-sqlite3` 实例。`schema.ts` 初始化 `files` 表并启用预写日志模式（`journal_mode = WAL`）。

- **原子批量操作** (`batch.ts`) – 提供文件元数据记录（`FileCommitRecord`）的原子批量插入/更新功能。每次提交都在事务内执行，并通过对比传入记录中的角色/职责与当前状态来进行语义漂移检测。检测到的漂移会立即通过漂移仓库进行记录。

- **错误处理** (`errors.ts`) – 将未知的运行时数据库错误（打开或初始化阶段）映射为标准化的 `ArchSpineError` 实例。通过错误消息模式匹配检测只读数据库条件，并根据失败阶段（`RuntimeDbOpenFailed`, `RuntimeDbInitFailed`）或只读状态（`RuntimeDbReadonly`）分配适当的错误码。

- **数据访问层** (`repositories/` 文件夹) – 包含基于 SQLite 的数据访问对象，用于对文件元数据、语义漂移事件、导出符号缓存、令牌使用指标和架构违规记录进行增删改查操作。这是所有持久化存储逻辑的主要接口。

- **类型定义** (`types.ts`) – 定义稳定的 TypeScript 接口：`FileRecord`, `FileStatusRecord`, `FileCommitRecord`, `DriftEvent`, `UsageSummaryRow`, `UsageTotals`, `ViolationRecord` 和 `GlobalStatus`。这些契约统一了索引、审计和状态报告领域的数据结构。

## 关键实现领域

- **陈旧 WAL 文件恢复** – `wal-recovery.ts` 模块使用字节阈值（512 KB）检测因进程被杀而留下的陈旧 WAL/SHM 文件，并将其删除，以防止空协调和随之而来的 LLM 速率限制过载。
- **语义漂移检测** – 内置于批量提交函数（`batch.ts`）中，逐文件比较新旧角色/职责元数据。
- **模式初始化** – 仅创建核心 `files` 表；其他表由仓库层管理。
- **错误隔离** – 每次数据库打开/初始化失败都会被封装为有意义的 `ArchSpineError`，使上层能够统一响应。