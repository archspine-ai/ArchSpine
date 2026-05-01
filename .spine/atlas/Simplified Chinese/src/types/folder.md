<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/types","role":"Defines the core data contracts, configuration schema, and public API types for the ArchSpine mirror system.","responsibility":"Provides the foundational type definitions, configuration interfaces, versioning constants, and view artifact schemas that establish the data model and public API contract for the entire ArchSpine infrastructure layer, enabling consistent representation of mirrored code units, dependency graphs, language metadata, synchronization manifests, rule documents, and architecture diagram specifications.","children":[{"filePath":"src/types/protocol","role":"Defines the core data contracts and configuration schema for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/types/protocol.ts","role":"Public protocol facade module providing a stable entry point for importing all ArchSpine protocol types.","fileKind":"source"},{"filePath":"src/types/view.ts","role":"Type definition module establishing the contract for view artifacts in the ArchSpine view generation system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T07:20:47.026Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/types` — 核心数据契约与公共 API 类型

此目录定义了 ArchSpine 镜像基础设施的基础类型系统。它建立了数据模型、配置模式、版本常量以及视图工件契约，这些契约规定了整个系统中镜像代码单元、依赖关系图、语言元数据、同步清单、规则文档和架构图规范的表示方式。

## 重要子项

- **`src/types/protocol/`** — 包含镜像协议核心数据契约和配置模式的子文件夹。代码单元、依赖关系图、语言元数据、同步清单和规则文档的主要类型定义均位于此处。
- **`src/types/protocol.ts`** — 公共外观模块，重新导出 `protocol/` 子文件夹中的所有协议类型，为消费者提供单一稳定的入口点。
- **`src/types/view.ts`** — 定义 ArchSpine 视图生成系统生成的视图工件的契约，包括架构图规范和其他视觉表示。

## 关键实现领域

- **数据契约** — `protocol/` 子文件夹包含最关键的类型定义，包括代码单元、依赖关系图、语言元数据、同步清单和规则文档的接口。
- **配置模式** — 系统配置的类型定义，确保整个基础设施层的一致验证和序列化。
- **版本常量** — 共享版本标识符，协调不同 ArchSpine 组件之间的兼容性。
- **视图工件模式** — `view.ts` 模块定义了生成的图表和视觉输出的结构方式，使下游渲染工具能够可靠地使用它们。