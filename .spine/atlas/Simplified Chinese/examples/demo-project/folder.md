<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project","role":"This directory aggregates the core configuration and rule definitions that govern the ArchSpine mirror system's behavior and structure.","responsibility":"Collectively, the components in this directory define system-level configuration parameters, establish structural guidelines for the .spine directory, enforce architectural rules and conventions for the mirror system, manage synchronization, indexing, validation, routing, and access control of mirrored data across distributed nodes, and define logical and functional layers including configuration management and interface abstraction to ensure consistency, fault tolerance, and a cohesive, extensible system architecture.","children":[{"filePath":"examples/demo-project/.spine","role":"This directory aggregates the core configuration and rule definitions that govern the ArchSpine mirror system's behavior and structure.","fileKind":"folder"},{"filePath":"examples/demo-project/demo.gif","role":"Project narrative and architectural overview for the ArchSpine mirror system","fileKind":"document"},{"filePath":"examples/demo-project/src","role":"This directory aggregates the application's core layers: API, domain, and infrastructure.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T07:20:47.846Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 演示项目

此目录完整展示了 ArchSpine 镜像系统的各项能力。它包含三个主要组件，共同说明系统的配置、文档和实现方式。

## 目录结构

- **`.spine/`** – 核心配置和规则定义，用于管理 ArchSpine 镜像系统的行为和结构。该文件夹定义了系统级配置参数，建立了结构指南，强制执行架构规则，并管理跨分布式节点的同步、索引、验证、路由和访问控制。

- **`demo.gif`** – 视觉叙事和架构概览，展示镜像系统的运行方式和设计原则。

- **`src/`** – 应用程序的实现层，按 API、领域和基础设施组件组织。此目录展示了镜像系统逻辑和功能层在代码中的具体实现。

## 关键实现领域

此演示项目最重要的方面包括：

1. **配置管理** – `.spine` 目录包含驱动镜像系统行为的完整配置框架，包括同步策略、索引规则和验证模式。

2. **接口抽象** – `src/` 目录展示了系统的逻辑层如何抽象为清晰的 API 边界、领域模型和基础设施实现。

3. **分布式架构** – 配置和源代码共同说明了 ArchSpine 如何处理跨分布式节点的镜像数据路由和访问控制，确保一致性和容错性。

## 重要子模块

- **`.spine/config/`** – 系统级配置参数和结构指南
- **`.spine/rules/`** – 镜像系统的架构规则和约定
- **`src/api/`** – 外部交互的 API 层
- **`src/domain/`** – 核心领域逻辑和业务规则
- **`src/infrastructure/`** – 持久化、网络和系统服务的基础设施实现