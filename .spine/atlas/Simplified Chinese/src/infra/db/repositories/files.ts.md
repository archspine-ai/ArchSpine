<!-- spine-content-hash:3017ae5b9269b3cdb7fca6fd57aba9092ded38cedca4c4a824315af02e617674 -->
# ArchSpine 文件元数据 DAO

该模块是一个**数据访问对象（DAO）**，为 ArchSpine 索引系统提供基于 SQLite 的文件元数据持久化操作。它封装了所有直接的数据库交互，将 SQL 关注点与高层业务逻辑隔离。

## 主要职责

- **查询文件状态**：根据文件路径从 SQLite 数据库中检索文件状态记录（哈希值、类型、修改时间、大小）。
- **更新或插入文件记录**：使用可选元数据插入或更新文件记录，确保操作的幂等性。
- **更新文档和权威状态**：修改数据库中的文件文档和权威状态。
- **删除文件记录**：根据路径删除文件记录。
- **列出所有文件**：返回所有存储的文件路径。
- **统计文件数量**：返回文件记录的总数。

## 重要不变性

- 所有操作依赖于 `better-sqlite3` 的数据库实例。
- 该模块假定存在一个 `files` 表，包含列：`path`、`hash`、`kind`、`lastIndexedAt`、`docs`、`is_authoritative`、`mtime`、`size`。
- 导出的函数是纯函数，仅执行直接的 SQL 操作，除数据库外无其他副作用。

## 不涉及范围

- **不**编排索引任务或引擎工作流。
- **不**为其他服务提供高层基础设施外观。
- **不**处理 HTTP 请求或用户认证。
- **不**管理数据库模式迁移或连接。

## 公开接口（导出的函数）

- `getFileStatus`
- `ensureFileRecord`
- `updateFileDocs`
- `updateFileAuthoritative`
- `deleteFileRecord`
- `listAllFiles`
- `countFiles`