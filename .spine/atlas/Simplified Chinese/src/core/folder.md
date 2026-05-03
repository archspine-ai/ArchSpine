`core/` 目录是 ArchSpine 镜像系统的结构与行为核心，包含了所有基础约定定义、运行时编排逻辑以及协调任务执行的依赖注入上下文。该模块按职责划分为七个关键子模块：

- **配置验证**（`config-schema.ts`）——提供运行时类型守卫和完整的验证函数 `resolveSpineConfig`，确保输入的 `SpineConfig` 符合预定义的枚举值集合，并导出便捷包装 `validateSpineConfig`。
- **错误码基础设施**（`errors.ts`）——定义了一套规范化的字符串错误码（按 CLI、运行时、发布、配置领域分组），以及 `ArchSpineErrorCode` 类型和 `ArchSpineErrorOptions` 接口，支持类型安全的、结构化的错误构造。
- **流水线执行编排器**（`pipeline.ts`）——实现运行时引擎，通过 `TaskContext` 实例驱动 `SpineTask` 的生命周期，借助 `executionCheckpoint` 记录阶段检查点，并通过 `recordTaskStageMetric` 采集性能指标（耗时、内存）。
- **扫描策略约定**（`scan-policy.ts`）——定义了 `FileSource` 联合类型（git‑tracked、git‑tracked‑plus‑untracked、filesystem）以及 `ScanPolicy` 接口（包含忽略链配置和协议包含/排除列表），同时提供 `PartialScanPolicy` 支持部分覆盖。
- **任务状态管理**（`task-state.ts`）——提供工厂函数（`createTaskArtifactsState`、`createTaskTelemetryState`、`createTaskState`）初始化流水线状态对象，并包含重置状态、追踪 LLM 用量、记录分阶段指标、维护运行时缓存和递增文件计数器的修改器，还处理摘要和验证阶段的漂移警告与诊断快照。
- **类型定义约定**（`task-types.ts`）——作为所有跨阶段数据接口的中心枢纽：统计指标（`TaskStats`、`TaskStageMetric`）、状态容器（诊断、选择、制品、遥测）以及阶段输入/输出类型（Scan、Extraction、Fix、Commit、ViewDerivation）。
- **依赖注入上下文**（`task.ts`）——定义了 `TaskContext` 接口，为任务实现提供共享引擎（Scanner、Aggregator、ContextEngine、RuleEngine、ASTExtractor）和基础设施（Manifest、OutputManager）的访问，同时包含 LLM 客户端、提示策略、运行时 I/O 和执行检查点的类型引用。

最关键的实现领域包括：类型安全的验证流水线、用于结构化失败处理的集中式错误码目录、感知生命周期的流水线编排器，以及覆盖全部五个阶段的指标、缓存和诊断的状态工厂系统。