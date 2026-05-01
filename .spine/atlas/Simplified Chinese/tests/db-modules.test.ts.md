<!-- spine-content-hash:4ae04cb47d82695c028b7e8f77f468ee31d575034f957730c2f75d7fe02b7cc9 -->
# ArchSpine 数据库集成测试套件

本 Vitest 集成测试套件用于验证 ArchSpine 镜像系统的运行时数据库模式初始化和批量提交操作。

## 角色

该测试套件通过集成测试确保数据库层功能正确，验证模式创建和数据持久化。

## 主要职责

- **模式验证**：确认 `initializeRuntimeSchema` 创建所有必需的数据库表：`files`、`symbols`、`usage_logs`、`violations` 和 `drift_events`。
- **批量提交测试**：验证 `commitBatch` 函数能正确将 `FileCommitRecord` 数组持久化到数据库。
- **表结构断言**：使用 `PRAGMA table_info` 查询验证表结构和列定义的正确性。
- **集成覆盖**：为数据库仓库层集成点提供测试覆盖，包括 `getDriftHistory`、`getFileDocs` 和 `getTrackedFiles`。

## 重要不变性

- 必须从 `vitest` 导入测试框架函数。
- 必须从 `../src/infra/db/` 导入数据库模式和批量函数。
- 必须使用内存 SQLite 数据库进行隔离测试。
- 测试文件后缀必须为 `.test.ts` 或 `.spec.ts`，遵循项目规则。

## 不涉及范围

- 不单独测试各个仓库函数。
- 不测试非数据库组件，如扫描器或 MCP 资源。
- 不进行数据库操作的性能或负载测试。

## 架构意图

主要目标是通过覆盖模式创建和数据持久化的集成测试，确保数据库层完整性，为 v1.0.0 版本的发布提供稳定可靠的测试覆盖。