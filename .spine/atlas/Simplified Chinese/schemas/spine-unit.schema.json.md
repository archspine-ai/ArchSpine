<!-- spine-content-hash:396c8e5abd2d840178756713348a22b0a81c4d29975806420f650b1aa274bb15 -->
# SpineUnit 架构 – ArchSpine 镜像系统

## 角色
定义 **SpineUnit** 的架构，SpineUnit 是 ArchSpine 镜像系统中的核心元数据单元，用于捕获源文件的身份、语义、结构和来源信息，作为每个被追踪文件的规范元数据记录。

## 主要职责
- 对所有 SpineUnit JSON 文档进行**架构验证**
- **强制执行必填字段**和文件元数据的结构约束
- **定义身份字段**：`filePath`、`contentHash`、`language`、`fileKind`、`scope`
- **定义语义字段**：`role`、`responsibilities`、`outOfScope`、`invariants`、`changeIntent`、`publicSurface`
- **支持简单字符串不变约束**和带有可执行性标志的结构化不变约束对象

## 重要不变约束与否定范围
- 每个 SpineUnit 文档**必须**包含所有必需的顶级属性：`schemaVersion`、`identity`、`semantic`、`skeleton`、`graph`、`provenance`
- `identity` 对象**必须**包含 `filePath`、`contentHash`、`language`、`fileKind` 和 `scope`
- `semantic` 对象**必须**包含 `role`、`responsibilities`、`outOfScope`、`invariants`、`changeIntent` 和 `publicSurface`
- **不允许**架构中明确定义之外的任何额外属性（`additionalProperties: false`）
- 不变约束对象**必须**包含 `id`（短横线命名法）、`description` 和 `enforceable` 布尔值
- 此架构**不定义**运行时行为、存储后端或文件系统交互——它纯粹是元数据文档的验证契约

## 最重要的导出行为
该架构导出一个**严格的验证契约**，每个 SpineUnit 文档都必须满足。它确保镜像系统中的所有文件都拥有完整的身份和语义元数据，从而支持整个项目的一致索引、变更检测和架构分析。

## 稳定性与风险
- 严格的结构验证对系统稳定性至关重要
- 必填字段保证每个文件拥有完整的元数据
- 带有可执行性标志的 `invariants` 字段提供了定义和验证安全限制的机制
- `additionalProperties: false` 约束防止意外字段导致配置漂移
- 通过 `$ref` 引用共享定义促进了系统间的一致性，但也依赖于共享架构的正确维护
- `changeIntent` 字段（实际使用中可为空）有助于维护架构决策和变更理由的可追溯性，对系统的长期可维护性非常重要