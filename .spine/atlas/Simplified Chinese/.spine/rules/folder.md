<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".spine/rules","role":"This directory contains the architectural and coding standard rulebooks that govern the structure and conventions of the ArchSpine project.","responsibility":"Collectively, these files define and enforce the layered module architecture, import boundaries, naming conventions, and coding standards for the entire ArchSpine monorepo, ensuring consistency and maintainability across all contributions.","children":[{"filePath":".spine/rules/layered-architecture.yml","role":"Architectural constraint rulebook for the ArchSpine project's layered module structure","fileKind":"document"},{"filePath":".spine/rules/naming-conventions.yml","role":"Defines naming conventions and coding standards for the ArchSpine monorepo codebase.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.132Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
`.spine/rules` 目录包含了定义 ArchSpine 项目核心规范的架构与编码标准手册。这些手册规定了整个单体仓库中的分层模块结构、导入边界、命名约定以及通用编码实践，是一致性与可维护性的唯一权威来源。

该目录包含两个关键文件：
- **layered-architecture.yml** — 强制实施项目的分层模块架构，规定了模块如何分组、跨层依赖如何允许以及存在哪些层级（例如领域层、应用层、基础设施层）。
- **naming-conventions.yml** — 定义了文件、类、函数、变量等代码元素的命名模式；同时设定了编码标准，如大小写规则、缩写规范以及术语选择。

这两份文件共同确保所有贡献遵循统一的结构，使代码库可预测且更易导航。最重要的实施领域是严格的层级隔离规则与一致的命名指南，它们共同减少了意外耦合，提升了代码可读性。