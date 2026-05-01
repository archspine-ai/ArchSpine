<!-- spine-content-hash:c0b6b4d82eeb7184246221a3a20ea9977bd4c1b77e48c06d3d6e193935914b8b -->
# ArchSpine – 符号表数据访问对象（SQLite）

## 角色
基础设施层的数据访问对象（DAO），负责 SQLite 符号表的持久化操作。

## 主要职责
- 提供原子操作以清空整个符号缓存。
- 插入或忽略与源文件路径关联的导出符号名称。
- 根据文件路径删除符号。
- 根据符号名称查询文件路径。

## 关键不变性与负面范围
- 提供针对符号表的稳定、底层 SQLite 操作。
- 调用者必须提供有效的 `Database.Database` 实例。
- 函数是原子的，并在适当情况下支持事务。
- **不在范围内：** 编排服务或任务工作流、提供高层业务逻辑或应用服务、暴露超出直接数据库操作的公共外观。

## 公开接口（导出的函数）
- `invalidateCache(db: Database.Database): void`
- `addFileExports(db: Database.Database, filePath: string, exports: string[]): void`
- `deleteSymbolsByFilePath(db: Database.Database, filePath: string): void`
- `queryFilesBySymbol(db: Database.Database, symbol: string): string[]`