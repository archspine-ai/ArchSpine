<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/manifest","role":"Infrastructure layer for manifest state persistence, file integrity verification, and file status tracking.","responsibility":"Provides the core data persistence and integrity verification mechanisms for the ArchSpine mirror system, including file hashing, manifest state management, language snapshot I/O, and file status tracking.","children":[{"filePath":"src/infra/manifest/facade.ts","role":"Infrastructure facade for manifest state persistence, file status tracking, and drift history management.","fileKind":"source"},{"filePath":"src/infra/manifest/integrity.ts","role":"Utility function for generating SHA-256 file hashes with metadata validation and database integration.","fileKind":"source"},{"filePath":"src/infra/manifest/io.ts","role":"Infrastructure utility module providing file path resolution, JSON file reading, and file status snapshot capabilities for the ArchSpine manifest and language snapshot system.","fileKind":"source"},{"filePath":"src/infra/manifest/state.ts","role":"Infrastructure facade module providing manifest file persistence, reverse index state tracking, and language snapshot I/O for the ArchSpine system.","fileKind":"source"},{"filePath":"src/infra/manifest/types.ts","role":"TypeScript interface defining a data structure for file metadata snapshots within the ArchSpine mirror system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.165Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine `src/infra/manifest` — 基础设施层：清单与完整性验证

本目录负责 ArchSpine 镜像系统的核心数据持久化与完整性验证机制，包括文件哈希计算、清单状态管理、语言快照的输入输出以及文件状态跟踪。

该模块由五个紧密协作的子模块组成：

- **`facade.ts`** —— 顶层入口，统一提供清单持久化、文件状态查询与漂移历史管理的方法。
- **`integrity.ts`** —— 实现基于 SHA-256 的文件哈希计算，附带元数据验证和数据库集成，确保每个镜像文件的可验证性。
- **`io.ts`** —— 提供底层文件路径解析、JSON 读写以及清单与语言快照的生成能力。
- **`state.ts`** —— 作为内部外观模块，负责清单文件持久化、反向索引状态跟踪和语言快照的输入输出操作。
- **`types.ts`** —— 定义文件元数据快照的 TypeScript 接口，供其他所有模块使用。

关键实现领域包括哈希逻辑、状态持久化以及清单与语言快照之间的集成。`facade.ts` 与 `state.ts` 构成上层的主要 API，而 `integrity.ts` 和 `io.ts` 则承担实际的文件操作与验证工作。