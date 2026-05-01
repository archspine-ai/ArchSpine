<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/src","role":"This directory aggregates the application's core layers: API, domain, and infrastructure.","responsibility":"The components in this directory collectively provide the HTTP API for user creation, define the User domain entity with in-memory storage, and supply a database connectivity stub, though the API layer directly manages database connections, violating layered architecture principles.","children":[{"filePath":"examples/demo-project/src/api","role":"This directory contains the HTTP API handler for user creation operations.","fileKind":"folder"},{"filePath":"examples/demo-project/src/domain","role":"This directory contains the domain service for the User entity.","fileKind":"folder"},{"filePath":"examples/demo-project/src/infra","role":"Infrastructure layer providing database connectivity stubs.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.747Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# src – 应用核心层

此目录聚合了应用的核心层：API、领域和基础设施。这些组件共同提供用于创建用户的HTTP API，定义带有内存存储的用户领域实体，并提供数据库连接桩。然而，API层直接管理数据库连接，违反了分层架构原则。

## 主要子目录

- **api/** – 包含用于用户创建操作的HTTP API处理器。
- **domain/** – 包含用户实体的领域服务。
- **infra/** – 提供数据库连接桩的基础设施层。

## 关键实现领域

- API层是用户创建请求的主要入口点。
- 领域层封装了用户实体及其业务逻辑。
- 基础设施层提供数据库连接桩，但其在API层中的使用表明存在设计缺陷。