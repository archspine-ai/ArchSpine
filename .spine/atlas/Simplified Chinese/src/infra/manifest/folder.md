<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/manifest","role":"Infrastructure layer for manifest state persistence, file integrity verification, and file status tracking.","responsibility":"Provides the core data persistence and integrity verification mechanisms for the ArchSpine mirror system, including file hashing, manifest state management, language snapshot I/O, and file status tracking.","children":[{"filePath":"src/infra/manifest/facade.ts","role":"Infrastructure facade for manifest state persistence, file status tracking, and drift history management.","fileKind":"source"},{"filePath":"src/infra/manifest/integrity.ts","role":"Utility function for generating SHA-256 file hashes with metadata validation and database integration.","fileKind":"source"},{"filePath":"src/infra/manifest/io.ts","role":"Infrastructure utility module providing file path resolution, JSON file reading, and file status snapshot capabilities for the ArchSpine manifest and language snapshot system.","fileKind":"source"},{"filePath":"src/infra/manifest/state.ts","role":"Infrastructure facade module providing manifest file persistence, reverse index state tracking, and language snapshot I/O for the ArchSpine system.","fileKind":"source"},{"filePath":"src/infra/manifest/types.ts","role":"TypeScript interface defining a data structure for file metadata snapshots within the ArchSpine mirror system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.165Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/manifest` — 清单基础设施层

该目录实现了 ArchSpine 镜像系统的核心持久化和完整性验证机制，负责文件哈希计算、清单状态管理、语言快照输入输出以及文件状态追踪。

## 主要子模块

- **`facade.ts`** — 提供清单状态持久化、文件状态追踪和漂移历史管理的基础设施外观模块。
- **`integrity.ts`** — 生成 SHA-256 文件哈希的实用函数，支持元数据验证和数据库集成。
- **`io.ts`** — 提供文件路径解析、JSON 文件读取和文件状态快照功能的基础设施工具模块，服务于 ArchSpine 清单和语言快照系统。
- **`state.ts`** — 提供清单文件持久化、反向索引状态追踪和语言快照输入输出的基础设施外观模块。
- **`types.ts`** — 定义文件元数据快照数据结构的 TypeScript 接口。

## 关键实现领域

- **文件完整性验证** — `integrity.ts` 模块提供 SHA-256 哈希计算，配合元数据验证和数据库集成，确保文件内容能够与存储的哈希值可靠比对。
- **清单状态持久化** — `facade.ts` 和 `state.ts` 共同处理清单状态的持久化，包括反向索引追踪和漂移历史管理。
- **语言快照输入输出** — `io.ts` 模块支持读写特定语言的快照，使系统能够追踪镜像内容在不同语言版本间的变化。
- **文件状态追踪** — 外观模块和状态模块协同工作，追踪文件状态随时间的变化，支持漂移检测和同步工作流。