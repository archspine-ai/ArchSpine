<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/core","role":"Core L2 aggregation logic and pipeline orchestration for the ArchSpine mirror system.","responsibility":"Defines the central validation contracts, error handling, task execution pipeline, scanning policies, and state management that collectively enable the ArchSpine system to collect, validate, deduplicate, and process data from multiple L1 sources into a canonical L2 mirror state.","children":[{"filePath":"src/core/compat","role":"This directory contains the core L2 aggregation logic for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/core/config-schema.ts","role":"Core validation contract and constants definition for the ArchSpine configuration schema.","fileKind":"source"},{"filePath":"src/core/errors.ts","role":"Core infrastructure module providing centralized error code constants and error option type definitions for the ArchSpine system.","fileKind":"source"},{"filePath":"src/core/pipeline.ts","role":"Core runtime orchestrator for executing SpineTask instances with lifecycle management and performance telemetry.","fileKind":"source"},{"filePath":"src/core/scan-policy.ts","role":"Core TypeScript type definition module establishing the scanning policy configuration contract for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/core/task-state.ts","role":"Core pipeline state factory and mutation module providing initialization functions and runtime state management for the ArchSpine task execution pipeline.","fileKind":"source"},{"filePath":"src/core/task-types.ts","role":"Core TypeScript contract definitions for ArchSpine pipeline task state, metrics, and stage boundaries.","fileKind":"source"},{"filePath":"src/core/task.ts","role":"Core interface defining the dependency injection context for ArchSpine task execution.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T07:20:46.666Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/core` — ArchSpine 核心 L2 聚合与管道编排

此目录是 ArchSpine 镜像系统的中枢神经。它定义了验证契约、错误处理、任务执行管道、扫描策略和状态管理，共同使 ArchSpine 能够从多个 L1 源收集、验证、去重和处理数据，最终形成规范的 L2 镜像状态。

## 重要子项

- **`compat/`** — 包含核心 L2 聚合逻辑的子目录（详情见内部）。
- **`config-schema.ts`** — ArchSpine 配置模式的验证契约和常量定义。
- **`errors.ts`** — 集中式错误代码常量和错误选项类型定义。
- **`pipeline.ts`** — 运行时编排器，负责执行 `SpineTask` 实例，并管理生命周期和性能遥测。
- **`scan-policy.ts`** — 定义扫描策略配置契约的 TypeScript 类型定义。
- **`task-state.ts`** — 管道状态工厂和变更模块，提供初始化函数和运行时状态管理。
- **`task-types.ts`** — 管道任务状态、指标和阶段边界的契约定义。
- **`task.ts`** — 定义任务执行依赖注入上下文的接口。

## 关键实现领域

- **管道编排**（`pipeline.ts`、`task-state.ts`、`task-types.ts`、`task.ts`）— 驱动所有镜像操作的核心执行流程。
- **验证与错误处理**（`config-schema.ts`、`errors.ts`）— 确保数据完整性的契约和错误基础设施。
- **扫描策略**（`scan-policy.ts`）— 管理 L1 源扫描方式的配置契约。
- **聚合逻辑**（`compat/`）— 负责合并和去重来自多个源数据的子模块。