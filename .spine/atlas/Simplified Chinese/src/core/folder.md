<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/core","role":"This directory implements the core L2 aggregation logic for the ArchSpine mirror system.","responsibility":"It orchestrates data collection from multiple L1 sources, performs validation and deduplication, and constructs the canonical L2 state for the mirror network.","children":[{"filePath":"src/core/compat","role":"This directory contains the core L2 aggregation logic for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/core/config-schema.ts","role":"Core validation contract and constants definition for the ArchSpine configuration schema.","fileKind":"source"},{"filePath":"src/core/errors.ts","role":"Core infrastructure module providing centralized error code constants and error option type definitions for the ArchSpine system.","fileKind":"source"},{"filePath":"src/core/pipeline.ts","role":"Core runtime orchestrator for executing SpineTask instances with lifecycle management and performance telemetry.","fileKind":"source"},{"filePath":"src/core/scan-policy.ts","role":"Core TypeScript type definition module establishing the scanning policy configuration contract for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/core/task-state.ts","role":"Core pipeline state factory and mutation module providing initialization functions and runtime state management for the ArchSpine task execution pipeline.","fileKind":"source"},{"filePath":"src/core/task-types.ts","role":"Core TypeScript contract definitions for ArchSpine pipeline task state, metrics, and stage boundaries.","fileKind":"source"},{"filePath":"src/core/task.ts","role":"Core interface defining the dependency injection context for ArchSpine task execution.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T07:41:54.023Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
`src/core` 目录是 ArchSpine 镜像系统的核心，实现了 L2 聚合逻辑的核心部分。它负责协调从多个 L1 源收集数据、执行验证与去重，并构建用于镜像网络的规范 L2 状态。

该目录围绕几个关键子模块组织：

- **`pipeline.ts`** – 运行时编排器，负责执行 `SpineTask` 实例，提供完整的生命周期管理和性能遥测。这是驱动所有聚合工作流的引擎。
- **`task-state.ts`** 与 **`task-types.ts`** – 共同提供管道任务状态的工厂、变更模块以及契约定义，涵盖任务状态、指标和阶段边界。它们构成了聚合系统的状态机。
- **`config-schema.ts`** – 定义 ArchSpine 配置模式的核心验证契约和常量。这是配置结构的单一权威来源。
- **`scan-policy.ts`** – 通过 TypeScript 类型定义建立扫描策略配置契约。
- **`errors.ts`** – 集中管理系统范围内使用的错误代码常量和错误选项类型定义。
- **`task.ts`** – 定义任务执行中依赖注入上下文的核心接口。
- **`compat/`** – 子目录，包含额外的核心 L2 聚合逻辑，可能用于向后兼容或平台特定适配（详情请查阅该文件夹）。

最重要的实现区域包括管道编排器、任务状态机以及配置模式。这三个区域共同确保从 L1 源到镜像网络规范 L2 状态的数据收集、验证、去重和状态构建的可靠性。
---MARKDOWN:---