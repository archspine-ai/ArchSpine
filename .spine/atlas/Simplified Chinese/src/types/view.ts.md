<!-- spine-content-hash:aca600d4d77395aa025610ffb030fc19f44416a34a072b474a75214480e41e81 -->
# ArchSpine 视图工件类型模块

本模块定义了 ArchSpine 视图生成系统中所有视图工件的 TypeScript 类型契约，为视图生成器和消费者提供基础接口和类型别名，确保系统一致性。

## 职责

建立视图工件信封及其内容结构的强类型模式，作为视图生成管道的稳定类型基础。

## 核心职责

- 定义视图工件信封及其内容结构的 TypeScript 接口
- 提供视图标识符（`ViewId`、`ViewType`）和视图特定枚举的类型别名
- 建立架构图规范的模式，包括节点、边和摘要卡片
- 定义公共表面视图项和风险热点视图项的结构

## 不涉及范围

- 视图生成逻辑的实现
- 视图工件的序列化或持久化
- 视图数据的运行时验证

## 不变约束

- 所有视图工件数据结构必须符合定义的 TypeScript 接口
- `ViewType` 是 `ViewId` 的别名，确保系统一致性

## 导出接口

以下类型和接口被公开导出：

- `ViewId`、`ViewType`
- `ViewScoreContribution`
- `ViewArtifactEnvelope`
- `PublicSurfaceViewItem`、`RiskHotspotViewItem`
- `ArchDiagramNode`、`ArchDiagramEdge`、`ArchDiagramSummaryCard`、`ArchDiagramSpec`
- `PublicSurfaceKind`、`ArchNodeType`

## 注意事项

本文件是视图生成器拆分为专注模块的重构工作的一部分，作为这些模块的稳定类型基础。注意，多个导出的接口未遵循内部 `I` 前缀命名规范（例如 `ViewScoreContribution` 而非 `IViewScoreContribution`），这是已知的规则违规。