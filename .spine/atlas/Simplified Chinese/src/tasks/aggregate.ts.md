<!-- spine-content-hash:fc4f6b2a5a035c49d21d95acdac83aafb028abf747d83f1b65b77a216b4fdaf6 -->
# AggregationTask – 层次化内容聚合

## 角色
核心管道任务，用于跨目录和项目的层次化内容聚合。

## 主要职责
- 通过扫描器状态从跟踪文件中收集需要聚合的目录。
- 基于扫描器状态和聚合引擎确定哪些目录需要聚合。
- 通过聚合引擎识别需要聚合的项目。
- 按深度组织目录以实现有序的层次化处理。

## 重要不变项与负面范围
- 必须在 SpineTask 契约内运行，并使用核心任务基础设施。
- 不得接管 CLI 命令解析或不相关的服务编排。
- **不**处理 CLI 命令解析或参数处理。
- **不**执行超出内容聚合范围的不相关服务编排。
- **不**执行直接的文件系统写入或输出格式化。

## 最重要的导出/外部可见行为
- **`AggregationTask`** 类，继承自 `SpineTask<CommitStageOutput, void>`
- **`name`** = `'Hierarchical Content Aggregation'`
- **`checkpointId`** = `'aggregation'`
- **`collectRecoverableDirs(ctx: TaskContext): string[]`** – 用于收集可在聚合过程中恢复的目录的公共方法。