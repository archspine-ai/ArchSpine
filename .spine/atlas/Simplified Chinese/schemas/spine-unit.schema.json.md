# ArchSpine SpineUnit 配置摘要

本 schema 定义了 ArchSpine 镜像系统中 SpineUnit 的结构与约束。每个 SpineUnit 捕获代码单元的标识、语义角色、不变量、变更意图和对外接口。

## 此配置控制的内容

- **代码单元标识追踪：** 强制要求 `filePath`、`contentHash`、`language`、`fileKind` 和 `scope` 等字段，以唯一标识和追踪源文件。
- **语义元数据管理：** 要求提供 `role`、`responsibilities` 列表、明确的 `outOfScope` 边界、`invariants`、`changeIntent` 和 `publicSurface`，以记录单元的目的和契约。
- **不变量强制执行：** 每个不变量条目必须包含 `id`、`description` 和 `enforceable` 标志，支持自动规则验证。
- **变更意图记录：** 记录架构意图和近期变更原因，便于审计。
- **公共 API 接口文档：** 明确的符号名和描述，用于接口稳定性监控。

## 关键参数理解

| 参数 | 重要性 |
|------|--------|
| `schemaVersion` | 锁定 schema 版本，确保向前兼容。 |
| `identity.filePath` | 仓库相对路径，用于追踪；必填。 |
| `identity.contentHash` | 文件内容的加密哈希值，用于完整性检查和变更检测。 |
| `identity.skeletonHash` | 骨架（结构签名）的哈希值，用于变更检测。 |
| `identity.semanticHash` | 语义元数据的哈希值，无需全面重解析即可检测语义漂移。 |
| `identity.language` | 编程语言标识，支持语言特定分析。 |
| `identity.fileKind` | 文件分类（源码、测试、配置等），便于过滤。 |
| `identity.scope` | 命名空间或模块作用域，解决命名冲突。 |
| `semantic.role` | 单元功能的高级描述，用于架构推理。 |
| `semantic.responsibilities` | 职责列表，辅助依赖分析。 |
| `semantic.outOfScope` | 明确声明单元不做什么，防止范围蔓延。 |
| `semantic.invariants` | 可强制执行约束，对安全性和正确性保证至关重要。 |
| `semantic.changeIntent` | 记录架构意图和变更原因。 |
| `semantic.publicSurface` | 明确的 API 接口（符号名与描述），用于接口契约和稳定性监控。 |

## 操作风险与稳定性考虑

- **遗留文件校验失败：** 所有 SpineUnit 必须包含所需的顶级字段和标识字段。遗留文件如果不包含所需字段，在升级前会校验失败。
- **哈希耦合：** `contentHash`、`skeletonHash` 或 `semanticHash` 的哈希逻辑变更需要全系统协调迁移。
- **过度约束的不变量：** 不变量可能过于严格，拒绝合法的边界情况。请仔细审查不变量描述和 enforceability。
- **禁止额外属性：** schema 在顶级和嵌套对象中禁止额外属性，防止静默添加导致下游工具出错。
- **结构完整性：** 严格遵循此 schema 可稳定元数据层，防止架构腐烂。

该 schema 强制所有 SpineUnit 的结构完整性。通过要求必填字段并禁止额外属性，防止静默添加导致下游工具出错。不变量系统支持自动执行业务规则（如“每个公开函数必须有文档注释”）。总体而言，严格遵循此 schema 可稳定元数据层，防止架构腐烂。