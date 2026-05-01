<!-- spine-content-hash:70eb227242562de0bfbc74510d67949bb907bb0e34d72d04d7d230fa502590cf -->
# ArchSpine 脊柱索引清单

## 角色
定义 `.spine` 目录的结构索引和元数据，作为 ArchSpine 镜像系统中配置文件和规则文件的清单。

## 主要职责
- 索引和版本化管理 `.spine` 目录内容
- 声明配置文件和规则文件的角色与种类
- 追踪来源元数据，包括索引时间戳和生成器版本

## 不变约束
- `schemaVersion` 必须是有效的语义化版本号字符串
- `directory` 必须为 `.spine`
- `provenance.indexedAt` 必须是有效的 ISO 8601 时间戳
- `provenance.generatorVersion` 必须遵循 `archspine/<semver>` 格式

## 负面范围
此文件不定义任何运行时行为、不强制执行安全策略、也不包含可执行逻辑。它纯粹是一个结构索引。

## 参数定义
- **schemaVersion**：用于验证此清单的架构版本；确保向后兼容性。
- **directory**：此清单描述的目标目录路径；必须为 `.spine`。
- **role**：描述该目录在系统中的功能用途的标签。
- **responsibility**：该目录的高级职责说明。
- **children**：属于此目录的子条目（文件或文件夹）数组，每个条目包含 `filePath`、`role` 和 `fileKind`。
- **provenance**：记录此清单生成时间和方式的元数据块，包括索引时间戳和生成器版本。
- **provenance.indexedAt**：目录最后被索引的 ISO 8601 时间戳。
- **provenance.generatorVersion**：生成此清单的 ArchSpine 生成器的版本标识符。
- **provenance.pipelineStages**：生成过程中应用的处理阶段列表（例如 `ast`、`llm`）。

## 稳定性与风险
此文件是一个结构索引；配置错误（例如 `schemaVersion` 不正确或缺少 `children`）可能导致 ArchSpine 系统无法定位或验证配置文件和规则文件，从而造成镜像不完整或规则执行漏洞。`provenance` 块仅用于信息参考，但应保持准确以支持调试和审计追踪。`directory` 不变性确保清单仅适用于 `.spine` 文件夹，防止作用域扩散。

## 最重要的导出行为
该清单由 ArchSpine 系统消费，用于发现和验证 `.spine` 目录中的所有配置文件和规则文件。它必须存在且结构正确，系统才能正常运行。