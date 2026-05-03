# 核心运行时基础设施（`src/runtime`）

该目录承载 ArchSpine 镜像系统的运行时基础框架，负责配置验证、错误定义、管道编排、扫描策略契约以及任务执行状态管理。文件按以下六个实现领域分组：

1. **配置验证** – `config-schema.ts`  
   提供运行时谓词，以及核心的 `resolveSpineConfig` 函数（附带便捷封装 `validateSpineConfig`），用于解析并验证 `SpineConfig` 架构，检查各枚举字段是否满足预设的允许值集合。返回验证通过的配置或问题列表。

2. **错误定义** – `errors.ts`  
   集中管理所有错误码常量（CLI、运行时、发布、配置领域），形成联合类型 `ArchSpineErrorCode`，并定义 `ArchSpineErrorOptions` 接口以支持结构化错误构造。

3. **管道编排** – `pipeline.ts`  
   任务执行的核心编排器，运行泛型 `SpineTask` 实例，具备完整的生命周期管理（开始、完成、失败检查点）、性能遥测（耗时、内存），并通过 `runtimeIO` 接口记录日志。

4. **扫描策略** – `scan-policy.ts`  
   定义 `FileSource` 联合类型，以及 `ScanPolicy` / `PartialScanPolicy` 接口，用于规定文件来源、忽略链配置以及协议包含/排除列表。

5. **任务状态管理** – `task-state.ts`  
   导出工厂函数（`createTaskArtifactsState`、`createTaskTelemetryState`、`createTaskState`）以初始化管道状态对象，并提供状态重置、LLM 用量追踪、性能指标记录、运行时缓存管理以及文件计数（处理/跳过/失败）增量等变更辅助工具。此外还包含漂移警告和诊断快照的记录功能。

6. **类型契约** – `task-types.ts` 和 `task.ts`  
   `task-types.ts` 定义了统计接口（`TaskStats`、`TaskStageMetric`）、状态容器以及所有管道阶段的输入/输出契约。`task.ts` 定义了 `TaskContext` 接口，为任务执行提供共享引擎（Scanner、Aggregator、ContextEngine、RuleEngine、ASTExtractor）和基础设施（Manifest、OutputManager）的依赖注入。

最关键的实现领域包括：配置验证（确保系统启动时的完整性）、带遥测的管道编排（提供可观测性与生命周期控制）、以及任务状态管理（多阶段执行追踪的骨干）。这些子模块是所有高层镜像操作依赖的核心契约点。