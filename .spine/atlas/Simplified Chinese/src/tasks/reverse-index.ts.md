<!-- spine-content-hash:79d2295362c3ad8b3b19cd2fee511c09c39b19211cde3aa955568f771490fd9f -->
# ArchSpine – ReverseIndexingTask

## 角色
核心管道任务，用于从正向依赖索引文件构建反向依赖边。

## 主要职责
- 检查反向索引是否已完成，并在没有新提交时跳过。
- 遍历所有跟踪的文件，读取缓存的正向依赖索引文档。
- 验证索引文档的兼容性，并通过基础设施工具报告读取问题。
- 从目标文件到依赖源文件构建反向边映射。

## 重要不变性与负面范围
- 任务必须仅基于核心契约和引擎执行阶段本地工作。
- 任务不得接管 CLI 命令解析或无关的服务编排。
- 超出范围：CLI 命令解析或参数处理、无关的服务编排或跨阶段协调、超出索引读取和反向边构建的直接文件系统变更。

## 最重要的导出/外部可见行为
- **类：** `ReverseIndexingTask`（继承自 `SpineTask<CommitStageOutput, void>`）
- **名称属性：** `'Reverse Dependency Indexing'`
- **检查点ID属性：** `'reverse-index'`
- **执行方法：** `execute(ctx: TaskContext, input: CommitStageOutput): Promise<void>`