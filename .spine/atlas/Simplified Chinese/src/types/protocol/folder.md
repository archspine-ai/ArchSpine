<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/types/protocol","role":"Defines the core data contracts and configuration schema for the ArchSpine mirror system.","responsibility":"Provides the foundational type definitions, configuration interfaces, and versioning constants that establish the data model and public API contract for the entire ArchSpine infrastructure layer, enabling consistent representation of mirrored code units, dependency graphs, language metadata, synchronization manifests, and rule documents.","children":[{"filePath":"src/types/protocol/config.ts","role":"TypeScript interface defining the central configuration schema for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/types/protocol/index-documents.ts","role":"Core TypeScript type definitions module for the ArchSpine mirror system's data model, defining all interfaces and types for the complete mirror data structure including unit, identity, semantic, skeleton, graph, provenance, folder, and project representations.","fileKind":"source"},{"filePath":"src/types/protocol/index.ts","role":"Public API facade (barrel export) for the infrastructure subsystem, aggregating and re-exporting all infra-layer modules.","fileKind":"source"},{"filePath":"src/types/protocol/languages.ts","role":"TypeScript type definition module defining the data contracts for language support metadata within the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/types/protocol/manifest.ts","role":"Core TypeScript module defining shared data transfer object (DTO) interfaces for the ArchSpine synchronization and manifest system.","fileKind":"source"},{"filePath":"src/types/protocol/rules.ts","role":"TypeScript interface defining the canonical data structure for an ArchSpine rule document within the rule engine's domain model.","fileKind":"source"},{"filePath":"src/types/protocol/versions.ts","role":"Centralized version definition module for ArchSpine schema and package versioning.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.564Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/types/protocol` — ArchSpine 核心数据契约

此目录定义了整个 ArchSpine 镜像系统的基础数据契约和配置模式。它建立了每个其他子系统所依赖的类型级 API，确保镜像代码单元、依赖图、语言元数据、同步清单和规则文档的一致表示。

## 重要子模块

- **`config.ts`** — 镜像系统的中央配置模式接口。
- **`index-documents.ts`** — 核心类型定义模块，涵盖完整的镜像数据结构：单元、身份、语义、骨架、图、来源、文件夹和项目表示。
- **`index.ts`** — 公共 API 桶导出，聚合并重新导出所有基础设施层模块。
- **`languages.ts`** — 语言支持元数据的数据契约。
- **`manifest.ts`** — 同步和清单系统的共享 DTO 接口。
- **`rules.ts`** — ArchSpine 规则文档的规范数据结构。
- **`versions.ts`** — 集中式模式和包版本定义。

## 关键实现领域

- **数据模型基础** — `index-documents.ts` 是最关键的文件，定义了支撑所有镜像操作的完整类型层次结构。
- **配置模式** — `config.ts` 提供了系统配置的单一真实来源。
- **同步契约** — `manifest.ts` 和 `versions.ts` 共同定义了镜像如何版本化和同步。
- **规则引擎集成** — `rules.ts` 将类型系统与规则评估引擎连接起来。
- **语言支持** — `languages.ts` 通过定义语言元数据契约实现多语言镜像。