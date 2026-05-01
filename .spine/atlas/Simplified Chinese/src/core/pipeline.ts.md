<!-- spine-content-hash:13f96e255117c7a870b56158cb9dff521317d44336252b66cb847d99080e9102 -->
# ArchSpine – TaskRunner

## 角色
核心运行时编排器，负责执行 SpineTask 实例，提供生命周期管理和性能遥测。

## 主要职责
- 通过 `TaskContext` 实例化，为任务提供执行环境。
- 使用提供的输入调用泛型 `SpineTask` 实例的 `.execute` 方法。
- 通过 `executionCheckpoint` 接口记录任务阶段的开始、完成和失败检查点。
- 通过 `runtimeIO` 接口记录任务执行进度和错误。
- 捕获性能指标（持续时间、内存使用）并通过 `recordTaskStageMetric` 记录。

## 重要不变性
- 仅依赖核心管道契约（`SpineTask`、`TaskContext`）和内部度量工具。
- 必须与 CLI 入口点或 UI 层解耦。
- 生命周期事件（开始、完成、失败）被一致地记录检查点和日志。

## 排除范围
- CLI 命令解析或参数处理
- 任务定义或实现
- 超出检查点记录范围的任务状态持久化
- 超出提供的上下文接口的外部服务集成

## 最重要的导出行为
- **类：** `TaskRunner`
- **构造函数：** `constructor(context: TaskContext)`
- **方法：** `run<I, O>(task: SpineTask<I, O>, input: I): Promise<O>` – 执行任务，包含生命周期跟踪和遥测。