<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/types","role":"Core data contracts and configuration schema for the ArchSpine mirror system.","responsibility":"Defines the foundational type definitions, configuration interfaces, and versioning constants that establish the data model and public API contract for the entire ArchSpine infrastructure layer, enabling consistent representation of mirrored code units, dependency graphs, language metadata, synchronization manifests, and rule documents. It also provides a stable public entry point for importing all protocol types and defines view artifact contracts for architecture diagrams.","children":[{"filePath":"src/types/protocol","role":"Defines the core data contracts and configuration schema for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/types/protocol.ts","role":"Public protocol facade module providing a stable entry point for importing all ArchSpine protocol types.","fileKind":"source"},{"filePath":"src/types/view.ts","role":"Type definition module establishing the contract for view artifacts in the ArchSpine view generation system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T10:11:06.692Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
`src/types` 目录是 ArchSpine 镜像系统的**核心数据契约与配置架构**，定义了基础类型定义、配置接口和版本常量，为整个基础设施层奠定了数据模型和公开 API 契约。

**重要子项分组**：
- `src/types/protocol` 子文件夹：存放镜像系统的核心数据契约与配置架构。
- `src/types/protocol.ts` 文件：作为稳定的公开外观模块，提供所有 ArchSpine 协议类型的统一导入入口。
- `src/types/view.ts` 文件：定义 ArchSpine 视图生成系统中视图产物的类型契约。

**最重要的实现领域**：
- 镜像代码单元、依赖图、语言元数据、同步清单和规则文档的一致表示。
- 整个 ArchSpine 基础设施层的公开 API 契约。
- 架构图视图产物的类型合同。

**具体子模块**：
- `src/types/protocol` — 核心模块，定义所有关键数据模型（例如代码单元类型、依赖图结构、语言元数据、同步清单、规则文档）。
- `src/types/view.ts` — 独立模块，规定生成视图产物（架构图）的 TypeScript 类型契约。