<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets","role":"This directory contains the core template definitions and documentation standards for the ArchSpine mirror system.","responsibility":"Collectively, these templates provide a standardized and extensible framework for documenting components, generating structured architecture summaries, enforcing architectural and coding standards, and analyzing the public surface and risk profile of the ArchSpine project, ensuring consistency and completeness across all architectural artifacts for both human readers and AI agents.","children":[{"filePath":"src/assets/templates","role":"This directory contains the core template definitions and documentation standards for the ArchSpine mirror system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.773Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/assets` —— 模板定义与文档框架

`src/assets` 目录是 ArchSpine 镜像系统的核心知识基础。它包含了权威的模板定义和文档标准，这些标准控制着架构产物的创建、验证和使用方式。

## 重要子目录

- **`templates/`** —— 这是主要子模块。它存放了可复用的模板文件，定义了以下内容的结构：
  - 组件文档
  - 结构化架构摘要（适用于人类读者与 AI 代理）
  - 架构与编码规范强制执行
  - 公共表面与风险分析报告

这些模板共同确保了 ArchSpine 生成的每一个产物都保持一致、完整且可机器读取。该目录是 ArchSpine 文档约定的唯一真实来源，并且被后续所有流水线阶段所引用。