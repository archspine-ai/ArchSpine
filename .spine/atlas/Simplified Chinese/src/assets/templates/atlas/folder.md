<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/atlas","role":"This directory contains the core template definitions for documenting components, documents, folders, projects, and sources within the ArchSpine mirror system.","responsibility":"Collectively, these templates provide a standardized and extensible documentation framework that ensures consistency, clarity, and completeness across all architectural artifacts in the ArchSpine mirror system, serving both human readers and AI agents.","children":[{"filePath":"src/assets/templates/atlas/config.md","role":"Template for documenting a component or module within the ArchSpine mirror system, providing a standardized structure for describing its purpose, parameters, stability, and risks.","fileKind":"document"},{"filePath":"src/assets/templates/atlas/document.md","role":"Template for documenting the narrative purpose, audience, and key insights of a project document within the ArchSpine mirror system","fileKind":"document"},{"filePath":"src/assets/templates/atlas/folder.md","role":"To define the architectural role, responsibilities, and boundaries of a specific component or subsystem within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/assets/templates/atlas/project.md","role":"System vision and module orchestration document for the ArchSpine mirror architecture","fileKind":"document"},{"filePath":"src/assets/templates/atlas/source.md","role":"Defines the narrative purpose and architectural role of a document within the ArchSpine mirror system.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.171Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/assets/templates/atlas` — ArchSpine 镜像系统的模板定义

此目录包含核心模板定义，用于标准化 ArchSpine 镜像系统中架构工件的文档记录方式。每个模板强制规定了描述组件、文档、文件夹、项目和源文件的一致结构，确保人类读者和 AI 代理都能可靠地理解和处理架构知识。

## 主要子文件

- **`config.md`** — 用于记录组件或模块的模板。提供描述用途、参数、稳定性和风险的标准结构。
- **`document.md`** — 用于记录项目文档的叙述目的、受众和关键见解的模板。
- **`folder.md`** — 定义特定组件或子系统的架构角色、职责和边界。
- **`project.md`** — ArchSpine 镜像架构的系统愿景和模块编排文档。
- **`source.md`** — 定义镜像系统中文档的叙述目的和架构角色。

## 关键实现领域

最重要的实现领域包括：

- **组件文档**（`config.md`）——确保每个模块都有清晰的用途、参数列表、稳定性指标和风险评估。
- **项目编排**（`project.md`）——提供高层愿景和模块协调，将整个镜像系统紧密连接。
- **文件夹与子系统边界**（`folder.md`）——为每个子系统定义清晰的架构边界和职责。
- **文档叙述**（`document.md` 和 `source.md`）——标准化文档描述其受众、用途和关键见解的方式。

这些模板共同构成了 ArchSpine 文档框架的骨干，支持一致、完整且机器可读的架构记录。