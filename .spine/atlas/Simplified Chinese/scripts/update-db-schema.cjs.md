<!-- spine-content-hash:808cb76a458aef0e09e7f7d8359638113791edb10a4671741eca1f33cea0104c -->
# ArchSpine 缓存模式迁移

## 目的
本文档是一个轻量级数据库迁移脚本，确保 ArchSpine 缓存模式包含用于跟踪文件元数据的 `mtime` 和 `size` 列。

## 上下文与受众
适用于维护 ArchSpine 镜像系统的开发者，他们需要在不断现有安装的情况下演进本地 SQLite 缓存模式。

## 主要职责
- 向 `files` 表添加 `mtime`（修改时间）列
- 向 `files` 表添加 `size` 列
- 通过 try-catch 块确保模式更新的幂等性

## 不涉及范围
- 数据迁移或现有记录的回填
- 模式创建或初始数据库设置
- 查询或读取缓存数据

## 关键要点
- 脚本使用 `ALTER TABLE` 配合 try-catch 处理列已存在的情况。
- 目标数据库是用于文件跟踪的 `.spine/cache.db` SQLite 数据库。
- 迁移是增量的且非破坏性的，保留现有数据。