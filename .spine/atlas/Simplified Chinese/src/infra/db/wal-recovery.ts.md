<!-- spine-content-hash:dce8021ed8f2738ac312b0e952d381279f7a36e2d40de2b7871903e132dda1bf -->
# ArchSpine – `walRecovery` 模块摘要

**角色：** 用于 SQLite 预写日志（WAL）过期文件检测与清理的基础设施工具模块。

**主要职责：**
- 定义字节阈值（`STALE_WAL_THRESHOLD_BYTES` = 512KB），用于识别可能因进程被杀死而残留的过期 WAL 文件。
- 提供恢复函数（`recoverStaleWal`），删除过期的 WAL 和共享内存（SHM）文件，防止空数据恢复导致后续 LLM 速率限制过载。

**重要不变性与负面范围：**
- 阈值常量必须保持为 512KB，以匹配检测被杀死进程的启发式规则。
- `recoverStaleWal` 只能操作从给定 `dbPath` 派生的 WAL 和 SHM 文件。
- 该模块不得导入或依赖服务、任务或引擎模块，以遵守基础设施外观导入规则。
- **不涉及：** 数据库连接管理、查询执行、协调或同步任务的编排，以及任何更高级别的业务逻辑或服务协调。

**最重要的导出/外部可见行为：**
- `STALE_WAL_THRESHOLD_BYTES`（常量）——用于识别过期 WAL 文件的字节阈值。
- `recoverStaleWal(dbPath: string): void`——删除指定数据库路径的过期 WAL 和 SHM 文件，防止数据丢失和 LLM 速率限制问题。

**变更意图：** 该模块提供了一个稳定的低级基础设施外观，用于检测和清理过期的 SQLite WAL 文件。未检测到近期变更；该模块似乎稳定，并与 v1.0 之前的管道修复保持一致。