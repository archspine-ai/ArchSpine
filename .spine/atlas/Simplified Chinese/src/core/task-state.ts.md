<!-- spine-content-hash:71783ea5b9fceb937902a653168c302eff6bf4fc2169d6e282897051a93648aa -->
# ArchSpine 核心管道状态模块

## 角色
核心管道状态工厂与变更模块，为 ArchSpine 任务执行管道提供初始化函数和运行时状态管理。

## 主要职责
- 导出工厂函数（`createTaskArtifactsState`、`createTaskTelemetryState`、`createTaskState`），使用默认的 Map 和遥测结构初始化管道状态对象。
- 提供 `resetTaskState` 函数，用于重新初始化 `TaskContext` 的状态和运行时缓存，并支持可选覆盖。
- 通过 `addTaskUsage` 跟踪 LLM 使用情况，将 token 计数和成本累加到遥测中。
- 通过 `recordTaskStageMetric` 记录每个阶段的性能指标（持续时间、堆内存、RSS），并更新最小值/最大值/计数。
- 通过 set/get/queue 辅助函数维护文件骨架、不支持文件和待提交的运行时缓存。
- 通过 `markTaskProcessedFile`、`incrementTaskSkipped`、`incrementTaskFailed` 增加已处理、已跳过和已失败文件的遥测计数器。
- 通过 `addTaskDriftWarning`、`pushSummarizeDiagnostics`、`pushValidateDiagnostics` 管理漂移警告以及 summarize 和 validate 阶段的诊断快照。

## 重要不变性
- 核心管道状态工厂不得依赖 CLI 入口代码（核心管道隔离）。
- 所有状态变更操作都作用于 `TaskContext` 对象，确保集中式状态管理。
- 遥测计数器和指标通过辅助函数原子化更新。

## 排除范围
- CLI 参数解析或命令调用逻辑。
- 文件系统 I/O 或外部服务调用。
- 管道阶段编排或排序逻辑。
- 面向用户的输出格式化或日志记录。

## 公开接口（导出函数）
- `createTaskArtifactsState`
- `createTaskTelemetryState`
- `createTaskState`
- `resetTaskState`
- `addTaskUsage`
- `recordTaskStageMetric`
- `markTaskProcessedFile`
- `incrementTaskSkipped`
- `incrementTaskFailed`
- `setUnsupportedTaskFile`
- `hasUnsupportedTaskFile`
- `setTaskSkeleton`
- `getTaskSkeleton`
- `queueTaskCommit`
- `addTaskDriftWarning`
- `pushSummarizeDiagnostics`
- `pushValidateDiagnostics`