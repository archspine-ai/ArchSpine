<!-- spine-content-hash:f0d70ca6d346612da6e4c70f044934103521cc1582fb5c4209daffe8f2fa6e63 -->
# SpineFolderUnit 架构

## 角色
定义 **SpineFolderUnit** 的架构，SpineFolderUnit 是 ArchSpine 镜像系统中的一个结构节点，代表具有特定角色和职责的目录。

## 主要职责
- 验证 ArchSpine 项目树中文件夹级别单元的结构
- 强制执行必需的元数据字段（`schemaVersion`、`directory`、`role`、`responsibility`、`children`、`provenance`）
- 定义文件夹单元内子文件条目的形状和约束
- 跟踪溯源元数据，包括索引时间戳、生成器版本和流水线阶段

## 不变约束
- 对象**不得**包含超出明确定义之外的额外属性
- 所有六个必填字段必须存在：`schemaVersion`、`directory`、`role`、`responsibility`、`children`、`provenance`
- 每个子条目必须包含 `filePath`、`role` 和 `fileKind`
- 溯源信息必须包含 `indexedAt`、`generatorVersion` 和 `pipelineStages`

## 参数定义
- **schemaVersion**：指定用于验证的架构版本，确保不同版本之间的兼容性。
- **directory**：该单元所代表的目录在项目范围内的相对路径。
- **role**：描述此文件夹单元在系统中功能角色的非空字符串。
- **responsibility**：描述此文件夹单元职责或目的的非空字符串。
- **children**：子文件条目数组，每个条目包含 `filePath`、`role` 和 `fileKind`，用于定义属于此文件夹单元的文件。
- **provenance**：包含关于此单元何时以及如何被索引的元数据对象，包括 `indexedAt` 时间戳、`generatorVersion` 和 `pipelineStages` 数组。

## 稳定性与风险
此架构对文件夹单元实施严格的结构验证。如果文件夹单元验证失败（例如缺少必填字段或包含额外属性），整个单元可能被拒绝，从而可能破坏镜像树。溯源追踪确保了可审计性，但增加了对准确时间戳和版本数据的依赖。配置错误的子条目可能导致系统中出现孤立或错误分类的文件。

## 负面范围（不在范围内）
- 此架构未明确定义任何不在范围内的项目。

## 导出的 / 外部可见行为
- 该架构用于在文件夹单元添加到 ArchSpine 镜像树之前对其进行验证。
- 验证失败会导致整个文件夹单元被拒绝。
- 溯源数据是必需的，以确保可审计性和可追溯性。