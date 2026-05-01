<!-- spine-content-hash:9fc9e62f2bb06e6eef36c15c574e63322c2c430944469eb8473c62749033ece1 -->
# ArchSpine – 基础设施类型定义模块

## 角色
本模块为索引、审计和状态报告领域提供**稳定的数据契约**。它定义了核心 TypeScript 接口，作为数据生产者（索引器、审计器）与消费者（CLI、服务）之间的共享语言。

## 主要职责
- 定义 `FileRecord`、`FileStatusRecord`、`FileCommitRecord` 和 `DriftEvent`——文件元数据、状态追踪、提交关联和审计事件的核心数据结构。
- 定义 `UsageSummaryRow` 和 `UsageTotals`，用于系统使用情况分析。
- 定义 `ViolationRecord`，用于规则违规追踪。
- 定义 `GlobalStatus`——系统整体状态的聚合快照。
- 将这些类型作为**稳定、版本化的契约**暴露，以解耦系统组件。

## 不包含范围
- 不包含运行时逻辑、数据验证或业务规则。
- 不包含服务编排、任务执行或引擎实现。
- 不包含直接数据库访问或持久化操作。

## 不变约束
- 仅导出 TypeScript 接口和类型定义。
- 必须保持为**纯类型契约**——不包含可执行代码或副作用。
- 对这些类型的变更应协调所有消费者，以保持兼容性。

## 公开接口（导出的类型）
- `FileRecord`
- `FileStatusRecord`
- `FileCommitRecord`
- `DriftEvent`
- `UsageSummaryRow`
- `UsageTotals`
- `ViolationRecord`
- `GlobalStatus`

## 变更意图
本模块旨在通过集中定义数据形状来**解耦系统组件**。最近的提交集中在 CLI 模块化和基础设施服务解耦上；本类型定义模块本身未发生变更。