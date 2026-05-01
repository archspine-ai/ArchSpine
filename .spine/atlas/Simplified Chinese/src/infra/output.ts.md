<!-- spine-content-hash:7286b2595c28ca3b40b9bf87979ca1a44a9aa9919674712b12a23f5eb9d45876 -->
# OutputManager — Spine 文件系统外观层

## 角色
基础设施外观层，用于将 Spine 索引单元（JSON）写入 `.spine` 目录下的文件系统。

## 主要职责
- 管理输出操作的根目录和 `.spine` 目录路径。
- 将 `SpineUnit`、`SpineFolderUnit` 和 `SpineProjectUnit` 对象以 JSON 文件形式写入 `.spine` 下的适当位置。
- 通过相对路径从磁盘读取 `SpineUnit` 对象，若路径缺失则回退到 `.json` 扩展名。
- 通过 `ensureDir` 方法确保写入文件前目标目录已存在。

## 重要不变性与负面范围
- 所有输出路径均相对于 `rootDir` 下的 `.spine` 目录。
- 在任何文件写入操作之前，目标目录都会被创建。
- 文件读取时，若精确路径未找到，则回退到 `.json` 扩展名。
- **不**处理非 Spine 文件的读写操作。
- **不**管理运行时 I/O 或流程编排。
- **不**验证 Spine 单元内容，仅进行类型约束检查。

## 公开接口
- `OutputConfig` 接口
- `OutputManager` 类

## 变更意图
提供一个稳定、低层次的文件系统外观层，用于持久化 Spine 索引数据，将文件 I/O 关注点与更高级别的编排逻辑隔离。最近的变更解决了 lint 错误并完成了 v1.0 前的流水线修复——该文件目前稳定，无 lint 问题。