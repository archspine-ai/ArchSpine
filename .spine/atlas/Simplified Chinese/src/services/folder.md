<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/services","role":"Service orchestration layer that coordinates the core ArchSpine pipelines (check, fix, sync, publish) and runtime session management.","responsibility":"Provides the central orchestration for all major ArchSpine operations including architectural checking, automated fixing, repository synchronization, and publish preflight validation. Manages runtime sessions with checkpoint-based resumability, resolves LLM execution profiles, coordinates multi-stage task pipelines (scanning, AST extraction, validation, LLM correction), and generates architectural views. Handles error recovery, usage metrics recording, and lock management for thread-safe operations.","children":[{"filePath":"src/services/check-service.ts","role":"Service facade orchestrating the ArchSpine 'check' command pipeline, coordinating scanning, AST extraction, validation, and usage recording within a managed runtime session.","fileKind":"source"},{"filePath":"src/services/fix-service.ts","role":"Service-layer orchestrator for the ArchSpine architectural fix pipeline, managing the sequential execution of scanning, AST extraction, LLM-driven correction, and validation tasks with runtime session integration.","fileKind":"source"},{"filePath":"src/services/llm-admin-service.ts","role":"TypeScript type definition module for LLM configuration command structures and view models within the view service layer.","fileKind":"source"},{"filePath":"src/services/publish-preflight.ts","role":"Infrastructure-layer validation facade that asserts runtime conditions for publish operations, including baseline checks, snapshot readiness, and local strategy warnings.","fileKind":"source"},{"filePath":"src/services/repository-admin-service.ts","role":"Infrastructure module defining interfaces and orchestration logic for repository artifact management and initialization strategies.","fileKind":"source"},{"filePath":"src/services/runtime-execution-profile.ts","role":"Type definition module for resolved runtime execution profiles and commands within the service layer.","fileKind":"source"},{"filePath":"src/services/runtime-service.ts","role":"Service layer facade for runtime orchestration that resolves execution profiles, LLM settings, view configurations, and constructs domain service instances (Check, Fix, Sync) in the ArchSpine system.","fileKind":"source"},{"filePath":"src/services/runtime-service.types.ts","role":"TypeScript interface defining a placeholder boundary for future runtime service capabilities within the ArchSpine type system.","fileKind":"source"},{"filePath":"src/services/runtime-session.ts","role":"Infrastructure orchestration service for managing resumable command execution sessions with checkpoint validation and protected output mutation detection.","fileKind":"source"},{"filePath":"src/services/sync-service.ts","role":"Core orchestration service that coordinates the multi-stage synchronization pipeline for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/services/task-runtime.ts","role":"Core service orchestrator that prepares and coordinates task execution engines and infrastructure for the ArchSpine system.","fileKind":"source"},{"filePath":"src/services/view","role":"View layer for generating and rendering architectural visualizations and analysis reports.","fileKind":"folder"},{"filePath":"src/services/view-service.ts","role":"Service orchestrator for generating and managing architectural views from indexed codebase data.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T07:20:48.492Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/services` — ArchSpine 服务编排层

此目录是 ArchSpine 所有主要管线的中央协调枢纽。它实现了驱动四个核心命令（**检查**、**修复**、**同步**、**发布**）的服务编排，以及支持基于检查点可恢复性的运行时会话管理。

## 关键子模块

- **`check-service.ts`** — 编排 `check` 命令管线：在托管运行时会话内执行扫描、AST 提取、验证和用量记录。
- **`fix-service.ts`** — 管理架构修复管线：扫描、AST 提取、LLM 驱动的修正和验证，并与运行时会话集成。
- **`sync-service.ts`** — 协调镜像系统的多阶段同步管线。
- **`publish-preflight.ts`** — 在发布前验证运行时条件，包括基线检查、快照就绪状态和本地策略警告。
- **`runtime-service.ts`** — 解析执行配置文件、LLM 设置和视图配置，然后构造领域服务实例（Check、Fix、Sync）。
- **`runtime-session.ts`** — 管理具有检查点验证和受保护输出变更检测的可恢复命令执行会话。
- **`task-runtime.ts`** — 准备并协调任务执行引擎和基础设施。
- **`view-service.ts`** — 从索引代码库数据生成和管理架构视图。
- **`view/`** — 包含用于渲染架构可视化和分析报告的视图层逻辑的子文件夹。
- **`llm-admin-service.ts`** — LLM 配置命令结构和视图模型的类型定义。
- **`repository-admin-service.ts`** — 仓库工件管理和初始化策略的接口与编排逻辑。
- **`runtime-execution-profile.ts`** — 已解析运行时执行配置文件和命令的类型定义。
- **`runtime-service.types.ts`** — 未来运行时服务能力的占位接口。

## 最重要的实现领域

1. **管线编排** — 检查、修复、同步和发布服务构成了 ArchSpine 操作命令的骨干。它们对扫描、AST 提取、验证和 LLM 修正的协调至关重要。
2. **运行时会话管理** — `runtime-session.ts` 和 `runtime-service.ts` 模块支持可恢复、带检查点的命令执行，这对长时间运行的操作至关重要。
3. **错误恢复与锁管理** — 该层处理所有管线的错误恢复、用量指标记录和线程安全锁管理。
4. **视图生成** — `view-service.ts` 和 `view/` 子文件夹从索引代码库数据生成架构可视化和分析报告。