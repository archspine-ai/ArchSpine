<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"schemas","role":"This directory contains the JSON schema definitions that validate all metadata units, manifests, and rule documents in the ArchSpine mirror system.","responsibility":"Collectively, these schema files define and enforce the structural integrity, data validation rules, and type constraints for every component of the ArchSpine semantic indexing and architecture enforcement system, including project units, folder units, file units, manifests, and governance rules.","children":[{"filePath":"schemas/examples","role":"This directory contains the core configuration and rule definitions for the ArchSpine semantic indexing and architecture enforcement system.","fileKind":"folder"},{"filePath":"schemas/shared.schema.json","role":"Defines reusable type definitions and validation schemas shared across the ArchSpine system.","fileKind":"config"},{"filePath":"schemas/spine-folder-unit.schema.json","role":"Defines the schema for a SpineFolderUnit, a structural node in the ArchSpine mirror system that represents a directory with a specific role and responsibility.","fileKind":"config"},{"filePath":"schemas/spine-manifest.schema.json","role":"Defines the schema for the ArchSpine SpineManifest, a metadata manifest that tracks the synchronization state and indexed file inventory of a mirror repository.","fileKind":"config"},{"filePath":"schemas/spine-project-unit.schema.json","role":"Defines the structural schema for a SpineProjectUnit, which is the fundamental project unit descriptor in the ArchSpine mirror system.","fileKind":"config"},{"filePath":"schemas/spine-rules.schema.json","role":"Defines the schema for individual SpineRule documents within the ArchSpine mirror system, specifying the structure and validation constraints for governance rules.","fileKind":"config"},{"filePath":"schemas/spine-unit.schema.json","role":"Defines the schema for a SpineUnit, the core metadata unit in the ArchSpine mirror system that captures the identity, semantics, structure, and provenance of a source file.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:57.841Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `schemas/` — ArchSpine 模式定义目录

本目录包含所有 JSON 模式文件，这些文件定义并强制实施 ArchSpine 镜像系统中每个组件的结构完整性、数据验证规则和类型约束。这些模式是所有元数据单元、清单和规则文档的权威数据源。

## 主要子项

- **`schemas/examples/`** — 存放用于语义索引和架构强制实施的核心配置与规则定义的子目录。
- **`schemas/shared.schema.json`** — 定义整个系统共享的可复用类型定义和验证模式。
- **`schemas/spine-unit.schema.json`** — 定义核心元数据单元（`SpineUnit`），用于捕获源文件的身份、语义、结构和来源信息。
- **`schemas/spine-folder-unit.schema.json`** — 定义表示具有特定角色和职责的目录的结构节点（`SpineFolderUnit`）。
- **`schemas/spine-project-unit.schema.json`** — 定义基础项目单元描述符（`SpineProjectUnit`）。
- **`schemas/spine-manifest.schema.json`** — 定义元数据清单（`SpineManifest`），用于跟踪镜像仓库的同步状态和已索引文件清单。
- **`schemas/spine-rules.schema.json`** — 定义单个治理规则文档（`SpineRule`）的结构和验证约束。

## 关键实施领域

- **验证与强制实施** — 所有模式共同确保每个元数据单元、清单和规则都符合 ArchSpine 数据模型。
- **类型安全** — `shared.schema.json` 中的共享定义提供可复用类型，减少重复并确保一致性。
- **结构完整性** — 文件夹和项目单元模式定义了目录和项目在镜像系统中的表示方式。
- **治理** — 规则模式支持架构强制策略的定义和验证。