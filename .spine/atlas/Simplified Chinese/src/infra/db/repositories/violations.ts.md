<!-- spine-content-hash:02de2bea6657fea6927779a797250d454e4adc15a5492f83817b1a35de8bbc19 -->
# ArchSpine – 违规记录数据访问对象（SQLite）

## 角色
基础设施层的数据访问对象（DAO），负责在 SQLite 中持久化和查询架构规则违规记录。

## 主要职责
- 向 SQLite 的违规记录表中插入新的违规记录（文件路径、规则 ID、严重级别、原因、时间戳）。
- 删除与特定文件路径关联的所有违规记录。
- 按严重级别和检测时间排序，检索所有违规记录以供报告使用。

## 重要不变性
- 仅依赖 SQLite 驱动（`better-sqlite3`）和内部类型。
- 提供稳定、低层的数据访问接口，专门用于违规记录。
- 调用方必须提供活跃的数据库连接。

## 排除范围（不负责）
- 编排扫描或审计流程。
- 执行架构规则或进行验证。
- 为其他基础设施服务提供高层外观接口。

## 公开接口（导出的行为）
- `recordViolation(db, filePath, ruleId, severity, reason): void`
- `deleteViolationsForFile(db, filePath): void`
- `getAllViolations(db): ViolationRecord[]`