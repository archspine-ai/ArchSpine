<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/rules","role":"This directory contains architectural governance and naming convention rule definitions for the ArchSpine project.","responsibility":"Collectively, these files define and enforce the structural constraints and naming standards that ensure consistency, maintainability, and proper dependency isolation across the entire ArchSpine monorepo.","children":[{"filePath":"examples/rules/layered-architecture.yml","role":"Architectural governance rule definition","fileKind":"document"},{"filePath":"examples/rules/naming-conventions.yml","role":"Defines naming conventions to ensure codebase consistency across a large monorepo.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:51.870Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `examples/rules` — 架构治理与命名规范规则

此目录定义了整个 ArchSpine 单体仓库的结构约束和命名标准，以确保一致性、可维护性和正确的依赖隔离。它包含两个具体的规则定义文件：

- **`layered-architecture.yml`** — 定义架构治理规则，规定各层之间的交互方式，确保依赖隔离，防止循环依赖或禁止的依赖关系。
- **`naming-conventions.yml`** — 建立命名规范，以维护大型单体仓库中代码库的一致性，涵盖文件名、模块名及其他标识符。

这些规则是项目架构标准的权威来源，用于自动化验证和执行。