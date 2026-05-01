<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/src/domain","role":"This directory contains the domain service for the User entity.","responsibility":"The components in this directory collectively define the User entity interface and implement in-memory storage, creation, and retrieval of user data.","children":[{"filePath":"examples/demo-project/src/domain/user-service.ts","role":"Domain Service isolating business logic for the User entity.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:41.798Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# 领域层 – 用户实体

该目录包含用户实体的核心领域服务。它定义了接口并实现了用户数据的内存存储、创建和检索。主要实现位于 `user-service.ts` 中，该文件隔离了用户实体的业务逻辑。

**关键子模块：** `user-service.ts` – 处理用户操作的领域服务。