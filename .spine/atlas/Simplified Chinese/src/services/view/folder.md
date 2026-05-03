## ArchSpine 视图生成与渲染子系统

此目录包含 ArchSpine 架构可视化与分析视图的生成与渲染子系统。它负责使用基于大型语言模型（LLM）的规范生成、评分算法和 Markdown 模板，生成、验证、持久化并渲染多种架构视图（如架构图、风险热点、公共表面等），同时管理视图注册表和运行时配置。

### 显著子模块及分组方式

- **渲染与图表生成**  
  - `arch-diagram-renderer.ts` – 纯渲染工具，将 `ArchDiagramSpec` 转换为 SVG 标记。它为每种节点类型（前端、后端、数据库等）定义视觉样式（填充、描边），按预设顺序排列图层，计算节点位置以避免重叠，并对标签进行 HTML 转义以确保安全。  
  - `architecture-diagram-view.ts` – 视图编排服务，负责架构图的生成、验证与持久化。它通过 `ViewIndexLoader` 加载项目和文件夹单元，构造 LLM 提示，解析并验证 LLM 响应为 `ArchDiagramSpec`，使用 `ArchitectureDiagramRenderer` 将其渲染为 HTML，并分别保存 HTML 和原始规范。

- **评分与风险分析**  
  - `public-surface-view.ts` – 排序引擎，根据多种因子（语义公开声明、导出数量、内部消费者、重导出放大）对源文件进行评分，识别最可能为公共 API 表面的文件。它应用特定表面类型（CLI、MCP、配置、路由）的加成和纯类型文件的扣分。  
  - `risk-hotspots-view.ts` – 风险热点生成函数。它通过分析扇入、扇出、跨边界边、公共表面暴露、语义漂移、规则违规、文件大小和相邻测试，为每个索引单元计算复合风险分数，并返回排名前 12 的热点条目。  
  - `common.ts` – 纯工具模块，提供分数求和、置信度计算、路径抑制（基于正则匹配测试、示例、文档等目录）、边界提取和跨边界边计数功能。

- **数据加载与缓存**  
  - `index-loader.ts` – 从 `.spine/index` 目录加载并缓存 `SpineFolderUnit` 和 `SpineProjectUnit` JSON 文件。它验证 JSON 是否符合 `SpineUnit` 架构，对格式错误文件发出警告，并限制文件夹数量以保持图表清晰。

- **注册表与配置**  
  - `view-registry.ts` – 中央注册表，定义 `ViewDefinition` 元数据（ID、标题、描述、启用状态、要求、输出）。提供 `VIEW_DEFINITIONS` 数组、`VIEW_DEFINITION_MAP`、类型守卫 `isViewId()` 以及 `getViewDefinition()`、`getDefaultEnabledViewIds()`、`normalizeViewIds()` 等辅助函数。  
  - `view-runtime.ts` – 从项目配置、环境变量或默认值解析实验性视图层和已启用视图的配置，并过滤未知视图 ID。

- **Markdown 渲染与输出**  
  - `view-renderer.ts` – 将视图产物（风险热点、CLI 条目、MCP 条目、模块条目、公共表面）使用从文件系统加载的模板渲染为格式化的 Markdown 报告。它处理严重性评分、详情格式、Markdown 转义和置信度显示。

- **公共入口**  
  - `index.ts` – 聚合并重新导出所有公共模块，为 MCP 客户端和外部调用者提供稳定的导入接口。

### 最重要的实现领域

- **基于 LLM 的规范生成**，用于架构图，并带有严格的验证和回退处理。  
- **多因子评分引擎**，用于公共表面检测和风险热点排序，支持可配置的阈值和加成项。  
- **视图注册表与配置解析**，控制哪些视图处于激活状态以及它们的默认启用方式。  
- **Markdown 渲染流水线**，按需加载模板并对内容进行转义，确保输出安全。  
- **层隔离**，将纯工具（评分、渲染）与编排逻辑（视图生成器、索引加载器）分离，使系统保持可测试性和模块化。