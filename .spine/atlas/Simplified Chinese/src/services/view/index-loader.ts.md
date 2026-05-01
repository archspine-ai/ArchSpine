<!-- spine-content-hash:e91992edd56819659c6a888ddc610d4b89e2b4107b9eaaaebce435e97260d721 -->
# ViewIndexLoader — 基础设施模块

## 角色
从 `.spine/index` 目录加载并缓存索引化的 Spine 单元，供视图层（特别是架构图生成）使用。

## 主要职责
- 递归遍历 `.spine/index` 目录，加载并缓存 `SpineFolderUnit` 和 `SpineProjectUnit` JSON 文件。
- 使用 `infra/index-reader` 中的 `isCompatibleIndexDocument` 工具，根据 SpineUnit 类型模式验证加载的 JSON。
- 为架构图生成提供索引化单元，并通过 `MAX_ARCH_DIAGRAM_FOLDERS` 限制文件夹数量以保持图表清晰。
- 在加载过程中，通过 `RuntimeIO` 使用 `reportIndexReadIssueOnce` 报告格式错误或不兼容的 JSON 文件。

## 重要不变性与否定范围
- **依赖** `infra/index-reader.js` 进行文档读取和模式验证。
- **使用** `RuntimeIO` 输出可选警告。
- **缓存** 已加载的单元，避免重复的文件系统读取。
- **不负责** 渲染架构图或其他可视化内容。
- **不负责** 写入或更新索引文件。
- **不负责** 编排超出数据加载范围的视图特定业务逻辑。

## 公开接口
- **类 `ViewIndexLoader`**，包含构造函数和 `getIndexedUnits` 方法。

## 规则违规
- **警告：** 该模块是视图特定的（为架构图加载单元），但位于 `src/infra/` 下，而非规则要求的 `src/services/view/`，违反了 `service-runtime-boundary` 规则。