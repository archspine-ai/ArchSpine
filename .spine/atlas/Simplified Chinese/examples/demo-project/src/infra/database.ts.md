<!-- spine-content-hash:6fcee033dd7073ceb67b8d4c613ab93ea05e20412cfadb19fca43e586b995fcf -->
# ArchSpine – 数据库连接存根

## 角色
基础设施层的存根，提供一个用于 SQLite 或 PostgreSQL 的占位数据库连接类。

## 主要职责
- 导出一个包含布尔连接状态的 `Database` 类。
- 提供一个公共 `connect` 方法，记录连接消息并更新内部状态。

## 重要不变性
- 必须在调用 `connect()` 之前实例化 `Database` 类。
- 调用 `connect()` 后，连接状态从 `false` 转换为 `true`。

## 排除范围（不在职责内）
- 实际的数据库查询执行或 ORM 集成。
- 超出简单布尔标志的连接池或生命周期管理。
- 错误处理或重连逻辑。

## 最重要的导出/外部可见行为
- `Database` 类
- `Database.connect()` 方法

## 变更意图
- **架构意图：** 为基础设施层提供一个最小化、可替换的数据库连接抽象。
- **近期变更意图：** 无功能变更；该文件是 ArchSpine 品牌重塑工作的一部分。