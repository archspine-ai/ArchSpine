<!-- spine-content-hash:84ddb46c7452a4ec025f9ae4add4430d08f28819e192cb3f475619bd306048f4 -->
# ArchSpine 根配置元数据

## 角色
此文件作为 **ArchSpine 镜像系统的根配置元数据**。它是定义系统身份、跟踪文件完整性、支持语义分析和漂移检测、管理依赖图以及记录变更意图的权威锚点。

## 主要职责
- **系统身份与文件跟踪**：唯一标识配置文件及其在仓库中的位置。
- **语义分析与漂移检测**：提供哈希值和语义元数据，以检测配置是否偏离其预期状态。
- **依赖图管理**：记录正向和反向依赖关系，包括符号级依赖边，以支持构建和分析工作流。
- **变更意图记录**：捕获架构意图和近期变更意图，用于审计和长期理解。

## 重要不变量
- `schemaVersion` 必须为 `"1.0.0"`。
- `identity.contentHash` 和 `identity.semanticHash` 必须是非空的 SHA-256 字符串。
- `identity.filePath` 必须为 `".spine/config.json"`。
- `identity.fileKind` 必须为 `"config"`。
- `identity.scope` 必须为 `".spine"`。
- `provenance.indexedAt` 必须是有效的 ISO 8601 时间戳。
- `provenance.generatorVersion` 必须为 `"archspine/1.0.0"`。

## 负面范围（不涵盖的内容）
此配置未明确排除任何关注点；`outOfScope` 列表为空。但它不负责运行时行为、应用程序逻辑或面向用户的功能。

## 最重要的导出/外部可见行为
- **`driftDetected` 标志**：一个关键的安全机制。如果为 `true` 但没有相应的 `driftReason`，系统状态应被视为潜在不一致。
- **`graph.reverseIndexComplete` 标志**：指示依赖图是否已完全解析。不完整的索引可能导致缺失依赖边，进而导致错误的分析结果。
- **`identity.contentHash` 和 `identity.semanticHash`**：这些哈希值是完整性验证和变更检测的主要手段。过期或不正确的值可能导致级联故障。

## 稳定性与风险
此文件运行时故障风险较低，但对系统完整性和可审计性影响较大。不正确或过期的哈希值可能导致错误的漂移检测或遗漏完整性违规，进而引发依赖解析和变更跟踪的级联故障。不变量强制要求严格遵循模式；任何偏离都会导致系统拒绝该配置。操作员应监控 `driftDetected` 标志，并确保 `reverseIndexComplete` 为 `true`，以获得可靠的依赖分析。