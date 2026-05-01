<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/db","role":"Infrastructure persistence layer providing SQLite database lifecycle management, schema evolution, and data access for the ArchSpine indexing system.","responsibility":"Manages the SQLite database lifecycle including file preparation, WAL recovery, schema migration, and error mapping, while providing a unified data access layer for CRUD operations on file metadata, symbol tables, drift events, usage metrics, and violation records.","children":[{"filePath":"src/infra/db/batch.ts","role":"Infrastructure-layer batch commit function for atomic file metadata synchronization to the SQLite index database.","fileKind":"source"},{"filePath":"src/infra/db/errors.ts","role":"Database runtime error mapping utility in the infrastructure layer.","fileKind":"source"},{"filePath":"src/infra/db/repositories","role":"Persistence layer for the ArchSpine indexing system, providing SQLite-based data access objects for all core entities.","fileKind":"folder"},{"filePath":"src/infra/db/runtime.ts","role":"Infrastructure facade module providing low-level runtime SQLite database lifecycle management, including filesystem preparation, stale WAL file detection/recovery, and error handling.","fileKind":"source"},{"filePath":"src/infra/db/schema.ts","role":"Database infrastructure utility for SQLite schema migration error handling and safe column addition.","fileKind":"source"},{"filePath":"src/infra/db/types.ts","role":"Infrastructure Type Definitions module providing stable data contracts for the indexing, audit, and status reporting domains.","fileKind":"source"},{"filePath":"src/infra/db/wal-recovery.ts","role":"Infrastructure utility module for SQLite Write-Ahead Log (WAL) stale file detection and cleanup.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:48.572Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/db` — SQLite 持久化层

该目录是 ArchSpine 索引系统的基础设施持久化核心，负责 SQLite 数据库的完整生命周期管理，包括文件准备、预写日志（WAL）恢复、模式迁移以及运行时错误映射。该层为所有核心实体提供了统一的数据访问接口。

## 主要子模块

- **`runtime.ts`** — 底层数据库生命周期管理的主外观模块。负责文件系统准备、过期 WAL 文件检测与恢复，并封装所有错误处理，使调用方无需直接处理 SQLite 异常。
- **`wal-recovery.ts`** — 专注于检测和清理过期 WAL 文件的工具模块，在打开数据库前防止因写入中断导致的损坏。
- **`schema.ts`** — 管理数据库模式迁移逻辑，包括安全添加列以及 DDL 操作期间的错误处理。
- **`errors.ts`** — 将 SQLite 运行时错误映射为系统中使用的领域特定错误类型。
- **`types.ts`** — 为索引、审计和状态报告领域定义稳定的 TypeScript 接口和数据契约。
- **`batch.ts`** — 提供原子批量提交功能，用于将文件元数据同步到索引数据库。
- **`repositories/`** — 子文件夹，包含基于 SQLite 的数据访问对象（DAO），覆盖所有核心实体：文件元数据、符号表、漂移事件、使用指标和违规记录。实际的增删改查逻辑均在此实现。

## 关键实现领域

- **生命周期管理** — `runtime.ts` 与 `wal-recovery.ts` 协同工作，确保数据库在任何读写操作前始终处于一致状态。
- **模式演进** — `schema.ts` 安全地处理数据库迁移，支持增量变更和错误恢复。
- **数据访问** — `repositories/` 子文件夹实现了实际的持久化逻辑，每个仓库专注于单一实体类型。
- **错误映射** — `errors.ts` 将底层 SQLite 错误转换为有意义的领域错误，使系统其余部分与数据库内部实现解耦。