<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/prompts","role":"This directory contains the prompt template engine and schema definitions for generating structured architecture summaries.","responsibility":"Provides the core prompt construction utilities, JSON schema templates, and example data used by the ArchSpine summarization pipeline to generate structured architecture diagrams and semantic summaries from project and folder information.","children":[{"filePath":"src/assets/templates/prompts/arch-diagram.ts","role":"LLM prompt template for generating structured JSON architecture diagram specifications from project and folder summaries.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/blocks.ts","role":"Pure utility functions for rendering structured text blocks, primarily used in LLM prompt construction within ArchSpine.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/examples.ts","role":"Static content module providing few-shot examples for semantic role description generation.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/index.ts","role":"Public API facade aggregating and re-exporting prompt template schemas, rendering blocks, and example data.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/schemas.ts","role":"Schema definition module providing JSON templates for ArchSpine semantic summary units.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:42.794Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
---MARKDOWN:Simplified Chinese---
# prompts/ – 提示模板引擎

`src/assets/templates/prompts/` 目录存放了 ArchSpine 文档管线中的核心提示构建系统。它定义了 JSON 模式模板、渲染工具以及示例数据，供 LLM 摘要引擎使用，以从项目或文件夹信息生成结构化的架构图和语义摘要。

## 主要子模块

- **schemas.ts** – 提供 ArchSpine 语义摘要单元的 JSON 模板定义，是生成结构化架构输出的基础。
- **arch-diagram.ts** – 包含面向 LLM 的提示模板，用于从汇总信息生成结构化的 JSON 架构图。
- **blocks.ts** – 提供纯函数形式的文本块渲染工具，主要用于提示组装阶段。
- **examples.ts** – 提供少样本示例，用于指导语义角色描述的生成。
- **index.ts** – 作为公开 API 门面，汇总并重新导出所有模式、渲染块和示例数据。

## 关键实现领域

最关键的部分是 `schemas.ts`（定义输出结构）、`arch-diagram.ts`（驱动 LLM 交互）和 `blocks.ts`（格式化输入）之间的协作。它们共同构成了提示模板引擎，确保生成一致且机器可读的架构摘要。