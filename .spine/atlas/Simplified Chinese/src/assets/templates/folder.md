<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates","role":"This directory contains the core template definitions and documentation standards for the ArchSpine mirror system.","responsibility":"Collectively, these templates provide a standardized and extensible framework for documenting components, generating structured architecture summaries, enforcing architectural and coding standards, and analyzing the public surface and risk profile of the ArchSpine project, ensuring consistency and completeness across all architectural artifacts for both human readers and AI agents.","children":[{"filePath":"src/assets/templates/atlas","role":"This directory contains the core template definitions for documenting components, documents, folders, projects, and sources within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/assets/templates/prompts","role":"This directory contains the prompt template engine and schema definitions for generating structured architecture summaries.","fileKind":"folder"},{"filePath":"src/assets/templates/rules","role":"This directory defines the architectural and coding standards for the ArchSpine project.","fileKind":"folder"},{"filePath":"src/assets/templates/view","role":"This directory contains analysis and documentation files that describe the public surface and risk profile of the ArchSpine project.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:48.206Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# src/assets/templates — 模板定义与文档标准

此目录是 ArchSpine 文档系统的核心，保存了所有基本模板定义和标准化框架，确保每个架构产物（无论是面向人类读者还是 AI 代理）都完整、一致且可扩展。

子目录按逻辑分为四个文件夹，各覆盖关键实现领域：

- **atlas** – 用于记录组件、文档、文件夹、项目和来源的核心模板定义。这是整个镜像系统中每份文档的基础。
- **prompts** – 提示模板引擎及其模式定义。在这里生成结构化的架构摘要，使 AI 代理能够输出一致的结果。
- **rules** – 在整个 ArchSpine 项目中强制实施的架构与编码标准。这些模板定义了添加任何代码或架构时的“规则”。
- **view** – 描述项目公共表面与风险概况的分析与文档文件。此文件夹捕获系统如何暴露以及边界或漏洞所在。

最重要的实现领域是 **atlas** 和 **prompts** 文件夹，因为它们直接决定了知识的表示方式以及 AI 代理如何与该表示进行交互。**rules** 文件夹对于长期维持代码质量和一致性同样关键。

具体子模块举例：在 `atlas` 中，你会找到针对每个实体类型（组件、文档、文件夹、项目、来源）的独立模板定义。在 `prompts` 中，模式定义与提示模板引擎协同工作，生成结构化摘要。`rules` 文件夹可能包含编码约定、架构强制和审查标准等子文件。最后，`view` 包含表面分析文档和风险档案，对安全与设计评审至关重要。