`types` 目录是 ArchSpine 镜像系统的契约中心，提供所有核心类型定义和共享接口，确保整个项目的数据结构保持一致。它定义了镜像单元的数据模型（SpineUnit、SpineIdentity、SpineSemantic、SpineSkeleton、ArchSpine 依赖图、SpineProvenance、SpineFolderUnit、SpineProjectUnit）、项目中央配置模式（SpineConfig）、语言支持元数据（LanguageSnapshot、LanguageSupport、LanguageDelta）、同步清单和 DTO（SpineManifest、SyncBlock、DocRef、FileStatus）、架构规则文档（RuleViolation、Invariant 以及可序列化的规则文档接口）、版本管理（SchemaVersion、版本常量、配置模式版本验证守卫）。

该目录包含七个文件，每个文件专注于不同的职责：

- **`config.ts`** – 声明 `SpineConfig`，系统的根配置对象，指定模式版本、项目元数据、语言区域支持以及可选的 LLM 集成设置。
- **`index-documents.ts`** – 核心数据模型：定义了系统中使用的大部分接口，包括 `SpineUnit`（顶层镜像单元）、标识、语义、骨架、图、溯源、规则违规、变更意图、公开表面、文件夹、项目，以及多种联合类型（SourceLanguage、FileKind、SymbolKind 等）。
- **`languages.ts`** – 语言检测与支持的契约：`LanguageSnapshot`、`LanguageSupport`、`LanguageDelta`。
- **`manifest.ts`** – 同步和清单系统的 DTO：`SpineManifest`、`SyncBlock`、`DocRef`、`FileStatus`。
- **`rules.ts`** – 规则文档的规范结构：字段包括 `schemaVersion`、`ruleId`、`title`、`appliesTo`、`severity`、`enforceable`、`bodyMarkdown`。
- **`versions.ts`** – 集中化的版本定义：`SchemaVersion` 类型、当前包/模式/配置模式的版本常量，以及配置模式兼容性的类型守卫函数。
- **`index.ts`** – 公共桶导出（barrel export），聚合并重新导出上述所有模块，为 types 目录的消费者提供单一的导入入口。

最重要的实现领域是核心数据模型（`index-documents.ts`），它定义了每个镜像单元及其子结构的形状；以及配置契约（`config.ts`），它管理项目级别的设置和 LLM 集成。版本定义（`versions.ts`）确保跨模块的模式兼容性，而清单和规则模块则维护了用于同步和架构强制执行的标准化 DTO。