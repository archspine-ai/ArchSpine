<!-- spine-content-hash:63c4c5a2ae3383e9bd251bbffb55bbd8f9e045e0bcff65e4ffdadfe307b323de -->
# ViewRenderer 单元测试（Vitest）

本文件包含一个基于 Vitest 的单元测试套件，用于验证 `ViewRenderer` 服务能否将架构视图数据确定性地转换为格式化的 Markdown 报告。测试覆盖两种特定视图类型：**风险热点** 和 **公共表面**。

## 主要职责

- 使用包含 `RiskHotspotViewItem` 条目的模拟 `ViewArtifactEnvelope` 数据，测试 `ViewRenderer.renderRiskHotspots` 方法。
- 使用包含 `PublicSurfaceViewItem` 条目的模拟 `ViewArtifactEnvelope` 数据，测试 `ViewRenderer.renderPublicSurface` 方法。
- 验证渲染后的 Markdown 输出是否包含预期的摘要文本和表格标题。
- 通过断言特定的正则表达式模式来确保表格结构的确定性，包括行数和格式。

## 关键不变性

- 测试套件使用 **Vitest** 测试框架。
- 依赖协议类型中的 `CURRENT_SCHEMA_VERSION` 常量。
- 所有测试必须产生确定性的 Markdown 输出。

## 不涉及范围

- 不测试风险热点和公共表面之外的其他视图类型。
- 不测试底层数据生成或收集过程。
- 不进行与外部系统或实时数据源的集成测试。

## 最重要的导出或外部可见行为

- `describe` 和 `it` 块定义了测试结构。
- `expect` 断言用于验证输出正确性。
- `ViewRenderer.renderRiskHotspots` 和 `ViewRenderer.renderPublicSurface` 是主要测试方法。
- `createEnvelope` 是一个辅助函数，用于构建模拟数据信封。