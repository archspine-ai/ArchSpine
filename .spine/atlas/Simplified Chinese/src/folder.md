<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src","role":"The main source code directory containing all functional modules of the ArchSpine mirror system.","responsibility":"Collectively, the src directory houses the complete implementation of the ArchSpine system, including asset templates, AST parsing, CLI interface, core orchestration, scanning engines, infrastructure services, service orchestration, pipeline tasks, type definitions, and utility modules, providing a comprehensive framework for mirroring, analyzing, and documenting software architecture.","children":[{"filePath":"src/assets","role":"This directory contains the core template definitions and documentation standards for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/ast","role":"AST parsing and language discovery layer for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/cli","role":"CLI layer providing user-facing commands, utilities, and initialization logic for the ArchSpine system.","fileKind":"folder"},{"filePath":"src/core","role":"Core L2 aggregation and pipeline orchestration layer for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/engines","role":"Core engine directory for scanning, aggregating, and analyzing architectural data within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/infra","role":"Infrastructure layer providing core services, persistence, and external integrations for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/services","role":"Service orchestration layer that coordinates the core ArchSpine pipelines (check, fix, sync) and runtime session management.","fileKind":"folder"},{"filePath":"src/tasks","role":"Pipeline task implementations for the ArchSpine mirror system's core processing stages.","fileKind":"folder"},{"filePath":"src/types","role":"Defines the core data contracts, configuration schema, and public API types for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/utils","role":"Provides foundational infrastructure and utility modules for file synchronization, path normalization, locking, and CLI presentation within the ArchSpine system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:57:53.358Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 源代码目录（`src`）

`src` 目录是 ArchSpine 镜像系统的核心，包含所有功能模块，共同实现了用于镜像、分析和记录软件架构的完整框架。该目录组织为十个独立的子目录，每个子目录都有特定的职责。

## 关键子模块

- **`src/assets`** – 镜像系统的核心模板定义和文档标准。
- **`src/ast`** – AST 解析和语言发现层，负责理解源代码结构。
- **`src/cli`** – 面向用户的命令行界面，包含命令、工具和初始化逻辑。
- **`src/core`** – L2 聚合和管道编排，是中央协调枢纽。
- **`src/engines`** – 扫描、聚合和分析架构数据。
- **`src/infra`** – 基础设施服务，包括持久化、外部集成和核心服务支持。
- **`src/services`** – 服务编排层，管理主要管道：检查、修复和同步，以及运行时会话管理。
- **`src/tasks`** – 每个核心处理阶段的具体管道任务实现。
- **`src/types`** – 数据契约、配置模式和公共 API 类型定义。
- **`src/utils`** – 用于文件同步、路径规范化、锁定和 CLI 展示的基础工具。

## 实现重点

最关键的区域是 **AST 解析**（`src/ast`）、**核心编排**（`src/core`）和**引擎扫描**（`src/engines`），因为它们构成了镜像和分析管道的骨干。**服务编排**（`src/services`）和**任务实现**（`src/tasks`）对于执行实际工作流同样重要。**类型定义**（`src/types`）确保所有模块之间的一致性，而**基础设施**（`src/infra`）提供必要的后端支持。