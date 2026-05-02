<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"schemas","role":"This directory contains the JSON schema definitions that validate all metadata units, manifests, and rule documents in the ArchSpine mirror system.","responsibility":"Collectively, these schema files define and enforce the structural integrity, data validation rules, and type constraints for every component of the ArchSpine semantic indexing and architecture enforcement system, including project units, folder units, file units, manifests, and governance rules.","children":[{"filePath":"schemas/examples","role":"This directory contains the core configuration and rule definitions for the ArchSpine semantic indexing and architecture enforcement system.","fileKind":"folder"},{"filePath":"schemas/shared.schema.json","role":"Defines reusable type definitions and validation schemas shared across the ArchSpine system.","fileKind":"config"},{"filePath":"schemas/spine-folder-unit.schema.json","role":"Defines the schema for a SpineFolderUnit, a structural node in the ArchSpine mirror system that represents a directory with a specific role and responsibility.","fileKind":"config"},{"filePath":"schemas/spine-manifest.schema.json","role":"Defines the schema for the ArchSpine SpineManifest, a metadata manifest that tracks the synchronization state and indexed file inventory of a mirror repository.","fileKind":"config"},{"filePath":"schemas/spine-project-unit.schema.json","role":"Defines the structural schema for a SpineProjectUnit, which is the fundamental project unit descriptor in the ArchSpine mirror system.","fileKind":"config"},{"filePath":"schemas/spine-rules.schema.json","role":"Defines the schema for individual SpineRule documents within the ArchSpine mirror system, specifying the structure and validation constraints for governance rules.","fileKind":"config"},{"filePath":"schemas/spine-unit.schema.json","role":"Defines the schema for a SpineUnit, the core metadata unit in the ArchSpine mirror system that captures the identity, semantics, structure, and provenance of a source file.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:57.841Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 模式目录

此目录包含定义整个 ArchSpine 镜像系统验证标准的所有 JSON 模式文件。每个元数据单元、清单文件和治理规则文档都必须遵循这些模式，以确保结构完整性、数据验证和类型约束。这些模式强制执行 ArchSpine 语义索引与架构强制系统的各个方面，涵盖项目单元、文件夹单元、文件单元、清单和规则。

## 主要子项

目录由一组具体的模式文件组成，每个文件专用于特定组件：

- **`shared.schema.json`** — 定义系统间共享的可复用类型和验证模式，减少重复并确保一致性。
- **`spine-unit.schema.json`** — 核心 `SpineUnit` 模式，这是捕获源文件身份、语义、结构和来源的基本元数据单元。
- **`spine-folder-unit.schema.json`** — 定义 `SpineFolderUnit`，这是一个代表目录的结构化节点，在镜像层次中扮演特定角色和职责。
- **`spine-project-unit.schema.json`** — 描述顶级项目单元描述符 `SpineProjectUnit`，聚合项目的元数据。
- **`spine-manifest.schema.json`** — 用于 `SpineManifest` 的模式，该清单追踪镜像仓库的同步状态和已索引文件清单。
- **`spine-rules.schema.json`** — 单个 `SpineRule` 文档的模式，提供治理规则的结构和验证约束。
- **`examples/`** — 一个子目录，存放演示模式实际用法的示例配置和规则定义。

## 最重要的实现领域

此目录中的模式在以下方面至关重要：

1. **验证**—所有进入系统的元数据在摄入时都根据这些模式进行验证，确保数据质量并防止损坏。
2. **互操作性**—跨单元和清单模式的共享类型实现了文件、文件夹、项目和规则之间的无缝交叉引用。
3. **治理实施**—规则模式通过定义有效的规则结构直接支持架构强制层。
4. **可扩展性**—共享模式提供了可扩展的基础，可支持未来的单元类型或自定义元数据，而不会破坏现有文档。