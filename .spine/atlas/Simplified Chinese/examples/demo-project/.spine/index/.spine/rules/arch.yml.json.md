<!-- spine-content-hash:cc278d7381ae066fefc5dca92ad109d6e4ef8cdd4eff6f2daeacfedf63ebaddc -->
# ArchSpine 架构规则定义

## 角色
此文件为 ArchSpine 镜像系统中的 `.spine/rules` 目录定义架构规则和约束。它提供用于规则文件索引和漂移检测的元数据。

## 主要职责
- 为 `.spine/rules` 目录定义架构规则和约束
- 提供用于规则文件索引和漂移检测的元数据

## 不变量
- 文件必须位于 `.spine/rules/arch.yml`
- 内容哈希和语义哈希必须与实际文件内容一致
- 语言字段设置为 `'unsupported'`，表示不进行特定语言处理

## 负面范围
此文件没有定义实际规则（不变量为空，没有架构意图）。它充当占位符或模板。`'unsupported'` 语言字段表示不会进行特定语言处理。

## 外部可见行为
- 漂移检测标志为 `false`，意味着系统当前认为此文件与其预期状态一致
- 反向索引标记为不完整，可能导致依赖分析不完整

## 稳定性和风险
主要风险在于，如果没有定义不变量或架构意图，此文件无法提供实际的架构规则执行，可能导致结构漂移未被检测到。不完整的反向索引可能导致依赖分析不完整。

## 参数定义

| 参数 | 描述 |
|------|------|
| `schemaVersion` | 定义此配置文件所使用的模式版本 |
| `identity.filePath` | 指定仓库中的确切文件路径 |
| `identity.contentHash` | 文件内容的 SHA-256 哈希值，用于完整性验证 |
| `identity.semanticHash` | 代表文件内容语义含义的哈希值 |
| `identity.language` | 指示编程语言；`'unsupported'` 表示不进行特定语言处理 |
| `identity.fileKind` | 描述文件类型（例如：文档、代码） |
| `identity.scope` | 定义此规则适用的目录范围 |
| `semantic.role` | 描述此配置的功能用途 |
| `semantic.responsibilities` | 列出受这些设置控制的子系统或领域 |
| `semantic.outOfScope` | 明确列出此配置不涵盖的项目 |
| `semantic.invariants` | 必须维护的强制性约束或安全限制 |
| `semantic.changeIntent.architecturalIntent` | 记录变更的预期架构目的 |
| `semantic.changeIntent.recentChangeIntent` | 记录最近一次变更的原因 |
| `semantic.publicSurface` | 列出公开暴露的接口或 API |
| `semantic.ruleViolations` | 记录检测到的任何架构规则违规 |
| `semantic.driftDetected` | 布尔标志，指示是否检测到与预期状态的偏离 |
| `semantic.driftReason` | 如果检测到偏离，解释其原因 |
| `skeleton.imports` | 列出导入的依赖项 |
| `skeleton.exports` | 列出导出的符号或模块 |
| `skeleton.declaredSymbols` | 列出此文件中声明的符号 |
| `skeleton.structuralHints.importCount` | 用于结构分析的导入数量 |
| `skeleton.structuralHints.exportCount` | 用于结构分析的导出数量 |
| `skeleton.structuralHints.isBarrel` | 指示此文件是否为桶（重新导出）模块 |
| `skeleton.structuralHints.isTypeOnly` | 指示此文件是否仅包含类型定义 |
| `graph.dependsOn` | 列出此配置所依赖的文件 |
| `graph.dependedBy` | 列出依赖此配置的文件 |
| `graph.reverseIndexComplete` | 指示反向依赖索引是否已完全构建 |
| `graph.symbolEdges` | 跟踪符号级别的依赖关系 |
| `provenance.indexedAt` | 此文件上次被索引的时间戳 |
| `provenance.generatorVersion` | 生成此元数据的 ArchSpine 工具版本 |
| `provenance.pipelineStages` | 应用于此文件的处理流水线阶段 |