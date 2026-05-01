<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets","role":"This directory contains the core template definitions and documentation standards for the ArchSpine mirror system.","responsibility":"Collectively, these templates provide a standardized and extensible framework for documenting components, generating structured architecture summaries, enforcing architectural and coding standards, and analyzing the public surface and risk profile of the ArchSpine project, ensuring consistency and completeness across all architectural artifacts for both human readers and AI agents.","children":[{"filePath":"src/assets/templates","role":"This directory contains the core template definitions and documentation standards for the ArchSpine mirror system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.773Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/assets` — 核心模板定义与文档标准

此目录是 ArchSpine 镜像系统中所有模板定义和文档标准的中央存储库。它包含一个子文件夹 `templates`，其中存放了实际的模板文件。

## 结构

- **`templates/`** — 包含 ArchSpine 镜像系统的核心模板定义和文档标准。这是所有模板逻辑所在的主要子模块。

## 关键实现领域

- **模板定义** — `templates` 文件夹定义了用于记录组件、生成结构化架构摘要以及强制执行架构和编码标准的标准化格式。
- **文档标准** — 这些模板确保所有架构工件的一致性和完整性，使其适用于人类读者和 AI 代理。
- **公共表面与风险分析** — 这些模板还支持分析 ArchSpine 项目的公共表面和风险概况。

## 值得注意的子模块

- **组件文档模板** — 用于记录系统中各个组件的模板。
- **架构摘要模板** — 用于生成整体架构结构化摘要的模板。
- **标准执行模板** — 用于在整个项目中强制执行架构和编码标准的模板。
- **公共表面与风险分析模板** — 用于分析公共 API 表面并识别潜在风险的模板。

此目录是确保所有架构文档一致、完整且机器可读的基础，使人类开发者和 AI 代理都能有效地使用 ArchSpine 系统。