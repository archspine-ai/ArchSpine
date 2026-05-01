<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/db/repositories","role":"Persistence layer for the ArchSpine indexing system, providing SQLite-based data access objects for all core entities.","responsibility":"Provides a unified data access layer that handles CRUD operations for file metadata, symbol tables, semantic drift events, token usage metrics, and architectural violation records, ensuring reliable persistence and retrieval of all system state in SQLite.","children":[{"filePath":"src/infra/db/repositories/drift.ts","role":"Infrastructure data access function for persisting and retrieving semantic drift audit events in SQLite.","fileKind":"source"},{"filePath":"src/infra/db/repositories/files.ts","role":"Data Access Object (DAO) providing SQLite persistence operations for file metadata in the ArchSpine indexing system.","fileKind":"source"},{"filePath":"src/infra/db/repositories/symbols.ts","role":"Infrastructure Data Access Object (DAO) for SQLite symbol table persistence.","fileKind":"source"},{"filePath":"src/infra/db/repositories/usage.ts","role":"Infrastructure Data Access Object (DAO) for persisting and querying token usage metrics in the SQLite database.","fileKind":"source"},{"filePath":"src/infra/db/repositories/violations.ts","role":"Infrastructure Data Access Object (DAO) for persisting and querying architectural rule violation records in SQLite.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.330Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 仓库层 — `src/infra/db/repositories`

该目录实现了 ArchSpine 索引系统的持久化层。它提供基于 SQLite 的数据访问对象（DAO），封装了系统所追踪核心实体的所有增删改查操作。目录中的每个文件对应一个独立的领域概念，并对外暴露一组聚焦的读写函数。

仓库层按实体类型组织，包含五个具体模块：

- **`files.ts`** — 文件元数据的 DAO。负责存储和检索每个被索引文件的信息，包括路径、哈希值和索引时间戳。
- **`symbols.ts`** — 符号表的 DAO。管理代码库中所有提取符号（类、函数、变量等）及其关系的持久化。
- **`drift.ts`** — 语义漂移审计事件的数据访问层。记录系统检测到符号含义或用法随时间发生变化的事件，支持漂移分析。
- **`usage.ts`** — Token 用量指标的 DAO。持久化和查询 LLM Token 的消耗数据，支持成本追踪和使用分析。
- **`violations.ts`** — 架构规则违规记录的 DAO。存储检测到的架构约束违反事件，支持执行和报告。

最重要的实现领域是符号表 DAO（`symbols.ts`）和漂移事件 DAO（`drift.ts`），因为它们直接支撑 ArchSpine 追踪代码库版本间语义演化的核心价值主张。违规 DAO（`violations.ts`）对于治理工作流同样至关重要。