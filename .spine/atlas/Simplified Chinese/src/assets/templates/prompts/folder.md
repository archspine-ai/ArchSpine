<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/prompts","role":"This directory contains the prompt template engine and schema definitions for generating structured architecture summaries.","responsibility":"Provides the core prompt construction utilities, JSON schema templates, and example data used by the ArchSpine summarization pipeline to generate structured architecture diagrams and semantic summaries from project and folder information.","children":[{"filePath":"src/assets/templates/prompts/arch-diagram.ts","role":"LLM prompt template for generating structured JSON architecture diagram specifications from project and folder summaries.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/blocks.ts","role":"Pure utility functions for rendering structured text blocks, primarily used in LLM prompt construction within ArchSpine.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/examples.ts","role":"Static content module providing few-shot examples for semantic role description generation.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/index.ts","role":"Public API facade aggregating and re-exporting prompt template schemas, rendering blocks, and example data.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/schemas.ts","role":"Schema definition module providing JSON templates for ArchSpine semantic summary units.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:42.794Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# 提示词目录

此目录包含用于在 ArchSpine 系统中生成结构化架构摘要的提示词模板引擎和模式定义。它提供了核心的提示词构建工具、JSON 模式模板以及示例数据，这些被 ArchSpine 摘要生成管道用于从项目和文件夹信息中生成结构化的架构图和语义摘要。

## 主要子模块

- **arch-diagram.ts** – 用于从项目和文件夹摘要生成结构化 JSON 架构图规范的 LLM 提示词模板。
- **blocks.ts** – 用于渲染结构化文本块的纯工具函数，主要用于 ArchSpine 中的 LLM 提示词构建。
- **examples.ts** – 提供用于语义角色描述生成的少样本示例的静态内容模块。
- **index.ts** – 聚合并重新导出提示词模板模式、渲染块和示例数据的公共 API 外观。
- **schemas.ts** – 为 ArchSpine 语义摘要单元提供 JSON 模板的模式定义模块。

## 关键实现领域

最重要的实现领域是提示词模板引擎（arch-diagram.ts）、块渲染工具（blocks.ts）和模式定义（schemas.ts）。这三个模块构成了提示词构建管道的核心，支持生成结构化的架构图和语义摘要。