<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates","role":"This directory contains the core template definitions and documentation standards for the ArchSpine mirror system.","responsibility":"Collectively, these templates provide a standardized and extensible framework for documenting components, generating structured architecture summaries, enforcing architectural and coding standards, and analyzing the public surface and risk profile of the ArchSpine project, ensuring consistency and completeness across all architectural artifacts for both human readers and AI agents.","children":[{"filePath":"src/assets/templates/atlas","role":"This directory contains the core template definitions for documenting components, documents, folders, projects, and sources within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/assets/templates/prompts","role":"This directory contains the prompt template engine and schema definitions for generating structured architecture summaries.","fileKind":"folder"},{"filePath":"src/assets/templates/rules","role":"This directory defines the architectural and coding standards for the ArchSpine project.","fileKind":"folder"},{"filePath":"src/assets/templates/view","role":"This directory contains analysis and documentation files that describe the public surface and risk profile of the ArchSpine project.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:48.206Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/assets/templates` — 核心模板定义与文档标准

此目录是 ArchSpine 镜像系统的结构基础。它包含了所有规范的模板定义、提示引擎、编码规则以及表面分析文档，确保每个架构产物在人类和 AI 代理面前都保持一致性、完整性和机器可读性。

## 重要子目录

- **`atlas/`** — 包含用于记录组件、文档、文件夹、项目和来源的核心模板定义。这是描述镜像中任何实体的基础模式所在。
- **`prompts/`** — 存放提示模板引擎及其模式定义。该子模块通过向 AI 代理提供上下文感知的提示，驱动结构化架构摘要的生成。
- **`rules/`** — 定义 ArchSpine 项目强制执行的架构和编码标准。这些规则规定了代码的编写、结构和验证方式。
- **`view/`** — 提供描述项目公共表面和风险概况的分析与文档文件。这是面向人类和 AI 消费者的主要输出层。

## 最重要的实现领域

- **模板可扩展性** — `atlas/` 子模块必须保持足够的灵活性，以便在不破坏现有模式的前提下容纳新的实体类型。
- **提示引擎可靠性** — `prompts/` 引擎必须生成确定性的、格式良好的摘要，使人类和 AI 代理都能可靠地解析。
- **规则执行** — `rules/` 子模块应与实际代码库保持同步，防止文档标准与实际实践之间出现偏差。
- **表面分析准确性** — `view/` 文档必须准确反映当前的公共 API 表面和风险状况，需要随着项目的发展定期更新。