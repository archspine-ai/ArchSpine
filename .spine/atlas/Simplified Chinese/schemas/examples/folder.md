<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"schemas/examples","role":"This directory contains the core configuration and rule definitions for the ArchSpine semantic indexing and architecture enforcement system.","responsibility":"Collectively, these files define the project identity, module structure, documentation synchronization state, and architectural dependency rules that govern the ArchSpine system, ensuring consistent indexing, integrity verification, and layer isolation.","children":[{"filePath":"schemas/examples/spine-folder-unit.example.json","role":"Defines the core application module container for the repository indexing pipeline.","fileKind":"config"},{"filePath":"schemas/examples/spine-manifest.example.json","role":"Language index manifest for the ArchSpine documentation atlas","fileKind":"config"},{"filePath":"schemas/examples/spine-project-unit.example.json","role":"Defines the project identity, module structure, and provenance metadata for the ArchSpine semantic indexing system.","fileKind":"config"},{"filePath":"schemas/examples/spine-rule-document.example.json","role":"Architectural dependency rule enforcing layer isolation in the ArchSpine system","fileKind":"config"},{"filePath":"schemas/examples/spine-rule.example.md","role":"Architecture enforcement rule","fileKind":"document"},{"filePath":"schemas/examples/spine-unit.example.json","role":"Authentication entry module for login and logout operations.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.136Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `schemas/examples` – ArchSpine 配置与规则示例目录

该目录存放 ArchSpine 语义索引与架构强制系统的核心配置及规则定义示例。这些文件共同演示了如何定义项目标识、模块结构、文档同步状态以及架构依赖规则，以确保一致的索引、完整性校验和层级隔离。

## 主要子项

- **`spine-folder-unit.example.json`** – 定义仓库索引管线的核心应用模块容器。
- **`spine-manifest.example.json`** – ArchSpine 文档图谱的语言索引清单。
- **`spine-project-unit.example.json`** – 索引系统的项目标识、模块结构和溯源元数据。
- **`spine-rule-document.example.json`** – 强制执行层级隔离的架构依赖规则。
- **`spine-rule.example.md`** – 架构强制规则（Markdown 文档）。
- **`spine-unit.example.json`** – 处理登录/登出操作的身份验证入口模块。

这些示例按功能分组：模块容器（`folder-unit`, `unit`）、项目元数据（`project-unit`）、语言图谱（`manifest`）以及架构规则（`rule-document`, `rule`）。最关键的实现领域包括索引管线（folder-unit）、溯源跟踪（project-unit）以及层级隔离强制（rule-document）。