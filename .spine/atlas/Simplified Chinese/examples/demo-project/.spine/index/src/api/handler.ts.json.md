<!-- spine-content-hash:0b09f782a81e9daf3a6f8f01600bcd47f3cd9635fe1def8f6cc326de123a533b -->
# ArchSpine 源文件元数据配置

## 角色
定义 ArchSpine 镜像系统中单个源文件的语义元数据、依赖图和结构骨架。

## 主要职责
- 通过哈希值追踪文件身份和内容完整性
- 声明文件的角色、职责和不变约束
- 记录导入/导出结构和声明的符号
- 映射跨文件的符号依赖边
- 标记规则违规和架构漂移

## 不变约束
- `identity.contentHash` 必须与实际文件内容匹配，以确保一致性
- `semantic.ruleViolations` 数组必须为空，以保持架构状态清洁
- `graph.reverseIndexComplete` 必须为 true，以确保依赖图完全解析

## 负面范围
此配置文件不强制执行运行时行为、不执行代码、也不修改源文件。它纯粹是一个元数据和分析产物。

## 导出的行为
该配置由 ArchSpine 的分析管道消费，用于验证架构规则、检测漂移并提供依赖洞察。关键的外部可见行为包括：
- **完整性验证**：内容哈希确保不会使用过时的元数据。
- **规则执行**：规则违规（例如层隔离错误）会附带严重级别和原因进行标记。
- **依赖分析**：反向索引完整性标志指示依赖图是否已完全解析。
- **漂移检测**：`driftDetected` 标志和 `driftReason` 字段指示与预期架构的偏差。

## 稳定性与风险
此配置文件对于维护整个代码库的架构一致性至关重要。它强制执行层隔离规则，并检测实际代码与预期设计之间的偏差。规则违规（例如层隔离错误）直接表明存在稳定性风险，因为它允许基础设施关注点泄漏到 API 层，可能导致紧密耦合，使系统更难重构或测试。反向索引完整性标志对于准确的依赖分析至关重要；不完整的索引可能导致遗漏依赖循环或错误的变更影响分析。内容哈希确保不会使用过时的元数据，从而防止构建或部署期间出现静默不一致。

## 参数定义
- **schemaVersion**：用于验证此配置文件的模式版本。
- **identity.filePath**：源文件相对于项目根目录的路径。
- **identity.contentHash**：文件内容的 SHA-256 哈希值，用于完整性验证。
- **identity.skeletonHash**：文件结构骨架（导入/导出）的哈希值。
- **identity.semanticHash**：文件语义注释和元数据的哈希值。
- **identity.language**：源文件的编程语言（例如 typescript）。
- **identity.fileKind**：文件的分类（例如 source、test、config）。
- **identity.scope**：文件所属的逻辑范围或模块。
- **semantic.role**：此文件在系统中的功能用途。
- **semantic.responsibilities**：此文件负责的子系统或关注点列表。
- **semantic.outOfScope**：明确列出的不属于此文件范围的关注点。
- **semantic.invariants**：此文件强制执行的约束或安全限制。
- **semantic.changeIntent.architecturalIntent**：此文件的高级架构目标。
- **semantic.changeIntent.recentChangeIntent**：最近一次修改的意图。
- **semantic.publicSurface**：此文件暴露的公共 API 或符号列表。
- **semantic.ruleViolations**：检测到的架构规则违规数组，每条包含 id、严重级别和原因。
- **semantic.driftDetected**：布尔标志，指示文件是否偏离了预期的架构。
- **semantic.driftReason**：如果检测到偏离，则提供解释。
- **skeleton.imports**：导入的模块或符号列表。
- **skeleton.exports**：从此文件导出的符号列表。
- **skeleton.declaredSymbols**：在此文件中声明的符号。
- **skeleton.structuralHints.importCount**：导入语句的数量。
- **skeleton.structuralHints.exportCount**：导出语句的数量。
- **skeleton.structuralHints.isBarrel**：此文件是否为桶文件（重新导出文件）。
- **skeleton.structuralHints.isTypeOnly**：此文件是否仅包含类型定义。
- **graph.dependsOn**：此文件依赖的文件列表。
- **graph.dependedBy**：依赖此文件的文件列表。
- **graph.reverseIndexComplete**：反向依赖索引是否已完全解析。
- **graph.symbolEdges**：符号之间的详细边，包括源、目标、关系和来源。
- **provenance.indexedAt**：此文件上次索引的时间戳。
- **provenance.generatorVersion**：生成此元数据的 ArchSpine 生成器版本。
- **provenance.pipelineStages**：使用的索引管道阶段（例如 ast、fallback）。