<!-- spine-content-hash:4a09021e3a4f46a2ada0d28508baf7a33420b7806a41f7efc9cbdd32dca6979e -->
# ArchSpine – 用量指标数据访问对象

**角色：** 基础设施层的数据访问对象（DAO），负责在 SQLite 数据库中持久化和查询令牌用量指标。

## 主要职责

- 将令牌用量记录（输入、输出、总计）连同同步元数据插入到 `usage_logs` 表中。
- 提供按日期和同步模式分组的近期用量聚合查询。
- 提供所有记录会话的累计生命周期用量统计。

## 重要不变项与职责范围外

- **不变项：** 所有操作依赖 `better-sqlite3` 数据库实例；导出纯函数，以数据库连接为参数；查询为调用时准备的静态 SQL 字符串；日期列使用 ISO 日期字符串存储。
- **职责范围外：** 编排服务/任务/引擎工作流、暴露高层基础设施外观、处理身份验证或授权、管理数据库连接池或超出简单查询的事务。

## 公开接口（导出函数）

- `recordUsage(db, mode, input, output, total): void`
- `getRecentUsageSummary(db): UsageSummaryRow[]`
- `getLifetimeUsageTotals(db): UsageTotals`

## 变更意图

**架构意图：** 封装用量指标的数据库交互，分离关注点并支持可测试性。  
**近期变更意图：** 本模块未检测到近期变更；最近的提交 `refactor: modularize CLI and decouple core infra services` 可能影响周边基础设施，但未直接影响此 DAO。