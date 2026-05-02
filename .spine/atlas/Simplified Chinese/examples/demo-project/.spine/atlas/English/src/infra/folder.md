<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/atlas/English/src/infra","role":"Infrastructure layer providing concrete implementations for data persistence and external system interactions.","responsibility":"Implements the Database class for connection management and query execution, defines the infrastructure layer's boundaries, and provides low-level technical services that support the domain layer, including concrete data access and storage mechanisms.","children":[{"filePath":"examples/demo-project/.spine/atlas/English/src/infra/database.ts.md","role":"Database infrastructure and persistence layer documentation","fileKind":"document"},{"filePath":"examples/demo-project/.spine/atlas/English/src/infra/folder.md","role":"Defines the infrastructure layer's purpose and boundaries within the ArchSpine system architecture.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:31.431Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# 基础设施层 — `infra/`

该目录包含 ArchSpine 示例项目的基础设施层，主要负责提供数据持久化和外部系统交互的具体实现，以低层技术支持领域层。

目录结构围绕两个关键文档组织：

- **`folder.md`** — 定义了基础设施层在整个架构中的边界与用途，是该层的正式契约，明确了其与系统其他部分的交互方式。
- **`database.ts.md`** — 记录了 `Database` 类，负责连接管理与查询执行，是示例项目中数据访问与存储的核心实现。

最重要的实现区域是数据库模块，因为它直接使领域层能够持久化和检索数据。同时，`folder.md` 中定义的层边界同样关键，它建立了基础设施与领域关注点的分离，有助于保持架构的清晰性与可测试性。