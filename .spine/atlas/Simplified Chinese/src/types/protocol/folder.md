此目录定义了 ArchSpine 镜像系统的核心数据结构和类型契约。各个子模块按功能职责划分如下：

- **配置模式**（`config.ts`）：声明 `SpineConfig` 接口，包含模式版本、项目元数据（name、locales）以及可选的 LLM 集成配置（provider、model、baseURL、mode）。该模块还导出了 `MCPContextMode` 类型。
- **完整镜像数据模型**（`index-documents.ts`）：系统的主干，定义了表示镜像代码单元的所有主要接口：`SpineUnit`、`SpineIdentity`、`SpineSemantic`、`SpineSkeleton`、`SkeletonImport`、`SkeletonExport`、`DeclaredSymbol`、`StructuralHints`、`ArchSpine`、`FileDependencyEdge`、`SymbolDependencyEdge`、`EdgeProvenance`、`SpineProvenance`、`SpineFolderUnit`、`FolderChild`、`SpineProjectUnit`、`ProjectModule`，以及规则检查结果（`RuleViolation`、`Invariant`）、变更追踪（`ChangeIntent`）和公共表面文档（`PublicSurfaceEntry`）。同时定义了 `SourceLanguage`、`FileKind`、`SymbolKind`、`DependencyRelation`、`SymbolRelation` 和 `PipelineStage` 等联合类型。
- **语言支持元数据**（`languages.ts`）：提供 `LanguageSnapshot`（全部检测语言的状态）、`LanguageSupport`（单一语言的可用性和元数据）及 `LanguageDelta`（两个语言状态之间的变化）的契约。
- **同步与清单 DTO**（`manifest.ts`）：定义同步状态（`SyncBlock`）、本地化文档引用（`DocRef`）、文件状态（`FileStatus`）以及项目根清单（`SpineManifest`）的接口。
- **规则文档模式**（`rules.ts`）：规定规则定义的规范结构，包括 `schemaVersion`、`ruleId`、`title`、`summary`、`appliesTo`、`severity`、`enforceable`、`rationale` 和 `bodyMarkdown` 属性。
- **版本定义**（`versions.ts`）：集中管理模式和包版本，提供 `SchemaVersion` 类型别名、当前版本常量、生成器版本字符串，以及用于验证配置模式版本兼容性的类型守卫函数。
- **公共 API 外观**（`index.ts`）：桶导出文件，重新导出上述所有模块，为其他子系统提供单一引用入口。

最关键的实施领域包括：核心数据模型（`index-documents.ts`），它为所有镜像操作奠定结构基础；配置模式（`config.ts`），确保系统级别的一致性；以及版本管理模块（`versions.ts`），在 ArchSpine 管线的演进中强制模式兼容性。