<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".spine/rules","role":"This directory contains the architectural and coding standard rulebooks that govern the structure and conventions of the ArchSpine project.","responsibility":"Collectively, these files define and enforce the layered module architecture, import boundaries, naming conventions, and coding standards for the entire ArchSpine monorepo, ensuring consistency and maintainability across all contributions.","children":[{"filePath":".spine/rules/layered-architecture.yml","role":"Architectural constraint rulebook for the ArchSpine project's layered module structure","fileKind":"document"},{"filePath":".spine/rules/naming-conventions.yml","role":"Defines naming conventions and coding standards for the ArchSpine monorepo codebase.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.132Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `.spine/rules` — 架构与编码标准规则手册

此目录包含两份基础规则手册，它们共同定义了 ArchSpine 项目的整体结构与约定。这两份文件规定了分层模块架构、导入边界、命名约定以及编码标准，确保整个单体仓库的一致性与可维护性。

## 主要子文件

- **`layered-architecture.yml`** — 架构约束规则手册，强制执行项目的分层模块结构，包括依赖方向与模块边界。
- **`naming-conventions.yml`** — 定义整个 ArchSpine 代码库的命名约定与编码标准，涵盖文件、类、函数和变量。

## 关键实施领域

这些规则所约束的最关键实施领域包括：

- **分层模块架构** — 严格规定各层之间的依赖方向（例如：表示层 → 应用层 → 领域层 → 基础设施层）。
- **导入边界** — 防止跨层违规，确保模块仅从允许的层导入。
- **命名约定** — 统一整个单体仓库的标识符，提升可读性与工具支持。
- **编码标准** — 为所有贡献建立一致的格式、文档与风格指南。