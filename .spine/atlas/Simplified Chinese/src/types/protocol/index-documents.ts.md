<!-- spine-content-hash:10753b796a194dcb8736c0958b658f70205bd844d32aa0e150ec1e80bdd91ccf -->
# ArchSpine 类型定义模块

## 角色
ArchSpine 镜像系统数据模型的核心 TypeScript 类型定义模块，定义了完整的镜像数据结构的所有接口和类型，包括单元、身份、语义、骨架、图、来源、文件夹和项目表示。

## 职责
- 定义 `SpineUnit` 接口作为表示镜像代码单元的顶层数据结构，由身份、语义、骨架、图和来源子结构组成。
- 定义 `SpineIdentity` 接口，捕获代码单元的身份信息，包括文件路径、内容哈希、语言、文件种类和作用域。
- 定义 `SpineSemantic` 接口，用于代码单元的语义分析结果。
- 定义 `RuleViolation` 和 `Invariant` 接口，用于架构规则检查结果。
- 定义 `ChangeIntent` 接口，用于跟踪代码变更背后的意图。
- 定义 `PublicSurfaceEntry` 接口，用于记录模块的公共 API 表面。
- 定义 `SpineSkeleton`、`SkeletonImport`、`SkeletonExport`、`DeclaredSymbol` 和 `StructuralHints` 接口，用于表示代码单元的结构骨架。
- 定义 `ArchSpine`、`FileDependencyEdge`、`SymbolDependencyEdge` 和 `EdgeProvenance` 接口，用于表示代码单元之间的依赖关系图。
- 定义 `SpineProvenance` 接口，用于跟踪代码单元的来源和处理历史。
- 定义 `SpineFolderUnit`、`FolderChild`、`SpineProjectUnit` 和 `ProjectModule` 接口，用于表示文件夹和项目级别的镜像结构。
- 定义 `SourceLanguage`、`FileKind`、`SymbolKind`、`DependencyRelation`、`SymbolRelation` 和 `PipelineStage` 联合类型，用于枚举整个数据模型中的有效值。
- 从 `./versions.js` 导入 `SchemaVersion` 类型，用于 `SpineUnit` 的 `schemaVersion` 字段。

## 不涉及范围
- 任何已定义接口或类型的实现逻辑或运行时行为。
- 构造这些类型实例的验证或解析逻辑。
- 数据模型的序列化或反序列化。
- 生成或消费镜像数据结构的业务逻辑。

## 不变规则
- 所有接口名称必须以字符 `I` 开头（接口前缀规则）。（注意：当前文件违反了此规则——所有 16 个接口均缺少 `I` 前缀。）

## 公开表面
该模块导出以下类型和接口：
- `SpineUnit`、`SpineIdentity`、`SpineSemantic`、`RuleViolation`、`Invariant`、`ChangeIntent`、`PublicSurfaceEntry`
- `SpineSkeleton`、`SkeletonImport`、`SkeletonExport`、`DeclaredSymbol`、`StructuralHints`
- `ArchSpine`、`FileDependencyEdge`、`SymbolDependencyEdge`、`EdgeProvenance`
- `SpineProvenance`、`SpineFolderUnit`、`FolderChild`、`SpineProjectUnit`、`ProjectModule`
- `SourceLanguage`、`FileKind`、`SymbolKind`、`DependencyRelation`、`SymbolRelation`、`PipelineStage`

## 值得注意的问题
- **接口前缀违规**：所有 16 个接口均未遵循 `I` 前缀约定（例如，应为 `ISpineUnit` 而非 `SpineUnit`）。
- **检测到漂移**：该模块现已成为整个 ArchSpine 数据模型的全面类型定义文件，远超最初限定的顶层接口范围。