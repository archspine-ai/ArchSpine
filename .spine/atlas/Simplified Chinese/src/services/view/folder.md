此目录包含 **ArchSpine 的视图子系统**，负责架构可视化视图的生成、渲染与管理。它实现了从加载索引代码单元到生成最终 HTML 或 Markdown 输出的完整流水线。

### 关键组件组及职责

- **视图生成与验证**  
  `architecture-diagram-view.ts` 通过 LLM 生成架构图规范：加载项目和文件夹单元、构建提示词、调用 LLM 客户端，并将结果验证为 `ArchDiagramSpec` 结构。`risk-hotspots-view.ts` 基于扇入、扇出、跨边界边等因子计算复合风险评分，排序后输出前 12 个热点。`public-surface-view.ts` 使用多因子评分算法对源文件按公共 API 表面概率进行排名。

- **渲染**  
  `arch-diagram-renderer.ts` 是纯 SVG 渲染工具，将架构图规范转换为带样式的 SVG 标记，并管理节点顺序与图层布局。`view-renderer.ts` 将多种视图工件（风险热点、CLI 条目、MCP 条目、公共表面）渲染为格式化的 Markdown 报告，使用从文件系统加载的模板。

- **注册与配置**  
  `view-registry.ts` 定义了 `ViewDefinition` 接口和标准 `VIEW_DEFINITIONS` 数组，支持按 ID 的 O(1) 查找和默认启用的视图列表。`view-runtime.ts` 从项目配置或环境变量中解析实验性视图层标志和已启用的视图 ID 列表。

- **数据加载与工具**  
  `index-loader.ts` 从 `.spine/index` 目录加载并缓存已索引的 `SpineUnit` JSON 文件，进行验证并限制用于图表生成的文件夹数量。`common.ts` 提供评分辅助函数（置信度计算、路径抑制检测）以及跨边界分析工具。

### 最重要的实现领域

- **LLM 驱动的图表生成** 及结构化输出验证，在 `architecture-diagram-view.ts` 中实现。
- **SVG 渲染管线**（`arch-diagram-renderer.ts`），包含节点类型样式和布局顺序。
- **评分引擎**：风险热点（`risk-hotspots-view.ts`）和公共表面（`public-surface-view.ts`），均采用多因子算法和路径过滤。
- **中央视图注册表**（`view-registry.ts`），定义所有支持的视图及其元数据。
- **基于模板的 Markdown 渲染**（`view-renderer.ts`），生成可读的报告。

该子系统设计为模块化：每个视图生成器自包含，注册表将视图定义与运行时激活解耦。`index.ts` 门面将输出集中导出，供 MCP 资源消费者使用。