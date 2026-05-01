<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/src/infra","role":"Infrastructure layer providing database connectivity stubs.","responsibility":"Provides a placeholder Database class with connection state management and a connect method for SQLite or PostgreSQL integration.","children":[{"filePath":"examples/demo-project/src/infra/database.ts","role":"Infrastructure layer stub providing a placeholder database connection class for SQLite or PostgreSQL.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T02:46:57.264Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# 基础设施层（`src/infra`）

该目录为 ArchSpine 演示项目提供数据库连接存根。它包含一个源文件 `database.ts`，定义了一个占位 `Database` 类，具备连接状态管理和一个用于 SQLite 或 PostgreSQL 集成的 `connect` 方法。该层作为数据库访问的轻量级抽象，允许上层模块依赖稳定的接口，而实际的数据库实现可以在后续替换或扩展。

值得注意的子模块是 `database.ts`，它是该基础设施层的核心。其实现专注于连接生命周期管理，是开发人员处理数据持久化或测试数据库交互时的主要关注区域。