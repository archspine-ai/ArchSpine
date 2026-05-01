<!-- spine-content-hash:1380be2216ac28161f2e053b7b87af0c464a34bad0fede2658bb3ff017ffea1c -->
# ASTExtractionTask — 核心流水线任务

**角色：** ArchSpine 镜像系统中负责 AST 提取与符号注册的核心流水线任务。

**主要职责：**
- 通过 `LangRegistry.isSourceFile` 识别源文件，并使用 `resolveLanguage` 解析其编程语言。
- 从支持的源文件中提取 AST 骨架，使用配置的提取器 (`ctx.extractor.extract`)。
- 将提取的骨架注册到运行时缓存和任务状态中，通过 `setTaskSkeleton` 实现。
- 处理不支持的源文件：记录警告、更新清单以跳过这些文件，并通过 `setUnsupportedTaskFile` 标记为不支持。
- 通过执行检查点和清单操作管理文件状态转换（开始、跳过、移除）。
- 对标记在 `ctx.forcedSyncFiles` 中的文件强制重新提取，清除其导出记录并重新计算哈希。

**重要不变性与负面范围：**
- 任务模块应在核心契约和引擎之上实现阶段本地工作，不应接管 CLI 命令解析或不相关的服务编排。
- 不在范围内：CLI 命令解析或参数处理、超出提取阶段边界的服务编排、直接的文件系统扫描或发现（委托给 `ScanStage`）、语言注册或语言注册表配置。

**最重要的导出/外部可见行为：**
- `ASTExtractionTask`（类，继承自 `SpineTask<ScanStageOutput, ExtractionStageOutput>`）
- `name = 'AST Extraction & Symbol Registration'`
- `checkpointId = 'ast-extraction'`
- `execute(ctx: TaskContext, input: ScanStageOutput): Promise<ExtractionStageOutput>`