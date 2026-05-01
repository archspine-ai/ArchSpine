<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"schemas/examples","role":"This directory contains the core configuration and rule definitions for the ArchSpine semantic indexing and architecture enforcement system.","responsibility":"Collectively, these files define the project identity, module structure, documentation synchronization state, and architectural dependency rules that govern the ArchSpine system, ensuring consistent indexing, integrity verification, and layer isolation.","children":[{"filePath":"schemas/examples/spine-folder-unit.example.json","role":"Defines the core application module container for the repository indexing pipeline.","fileKind":"config"},{"filePath":"schemas/examples/spine-manifest.example.json","role":"Language index manifest for the ArchSpine documentation atlas","fileKind":"config"},{"filePath":"schemas/examples/spine-project-unit.example.json","role":"Defines the project identity, module structure, and provenance metadata for the ArchSpine semantic indexing system.","fileKind":"config"},{"filePath":"schemas/examples/spine-rule-document.example.json","role":"Architectural dependency rule enforcing layer isolation in the ArchSpine system","fileKind":"config"},{"filePath":"schemas/examples/spine-rule.example.md","role":"Architecture enforcement rule","fileKind":"document"},{"filePath":"schemas/examples/spine-unit.example.json","role":"Authentication entry module for login and logout operations.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.136Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine – `schemas/examples` 目录摘要

本目录包含 ArchSpine 语义索引与架构强制系统的**示例配置和规则文件**。它作为参考集，展示了如何定义项目标识、模块结构、文档同步状态以及架构依赖规则。

## 主要子文件

- **`spine-project-unit.example.json`** – 定义 ArchSpine 系统的项目标识、模块结构和来源元数据。
- **`spine-folder-unit.example.json`** – 定义仓库索引管线的核心应用模块容器。
- **`spine-unit.example.json`** – 一个认证入口模块示例，用于登录和注销操作。
- **`spine-manifest.example.json`** – ArchSpine 文档图谱的语言索引清单。
- **`spine-rule-document.example.json`** – 强制层隔离的架构依赖规则。
- **`spine-rule.example.md`** – 描述架构强制规则的 Markdown 文档。

## 实现领域

- **项目标识与模块结构** – `spine-project-unit.example.json` 和 `spine-folder-unit.example.json` 定义系统如何标识自身并组织模块。
- **文档同步** – `spine-manifest.example.json` 跟踪文档图谱的语言索引清单。
- **架构强制** – `spine-rule-document.example.json` 和 `spine-rule.example.md` 定义依赖规则和层隔离策略。
- **认证模块** – `spine-unit.example.json` 提供了一个具体的认证入口模块示例。

这些示例共同说明了 ArchSpine 如何在项目中强制实现一致的索引、完整性验证和层隔离。