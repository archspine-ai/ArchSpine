<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/src","role":"This directory aggregates the application's core layers: API, domain, and infrastructure.","responsibility":"The components in this directory collectively provide the HTTP API for user creation, define the User domain entity with in-memory storage, and supply a database connectivity stub, though the API layer directly manages database connections, violating layered architecture principles.","children":[{"filePath":"examples/demo-project/src/api","role":"This directory contains the HTTP API handler for user creation operations.","fileKind":"folder"},{"filePath":"examples/demo-project/src/domain","role":"This directory contains the domain service for the User entity.","fileKind":"folder"},{"filePath":"examples/demo-project/src/infra","role":"Infrastructure layer providing database connectivity stubs.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.747Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
`src` 目录位于 `examples/demo-project` 下，是应用核心层（API、领域、基础设施）的汇聚点。它包含用于创建用户的 HTTP 处理器、带有内存存储的 `User` 领域实体，以及数据库连接桩。但当前 API 层直接管理数据库连接，违反了清晰的分层架构设计原则。

主要子目录包括：
- **api/** – 包含用户创建操作的 HTTP API 处理器。
- **domain/** – 持有 `User` 实体的领域服务。
- **infra/** – 提供数据库连接桩。

最重要的实现区域包括：API 层（目前因混合数据访问而违背分层原则）、领域模型（负责核心业务逻辑和内存存储），以及基础设施桩（需完整实现）。每个子模块都应重构以强化依赖反转，确保领域仅依赖抽象而非直接调用基础设施。