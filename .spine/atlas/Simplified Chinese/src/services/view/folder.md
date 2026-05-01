<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/services/view","role":"View layer for generating and rendering architectural visualizations and analysis reports.","responsibility":"Provides a unified subsystem for defining, generating, scoring, and rendering architectural views (such as architecture diagrams, risk hotspots, and public surface analysis) from indexed project metadata, with support for LLM-based specification generation and markdown report output.","children":[{"filePath":"src/services/view/arch-diagram-renderer.ts","role":"Pure rendering utility that transforms architectural diagram specifications into SVG markup.","fileKind":"source"},{"filePath":"src/services/view/architecture-diagram-view.ts","role":"ArchSpine view derivation service for generating and rendering interactive architecture diagrams from project metadata using LLM-based specification generation.","fileKind":"source"},{"filePath":"src/services/view/common.ts","role":"Pure utility module providing scoring and path suppression functions for the view layer.","fileKind":"source"},{"filePath":"src/services/view/index-loader.ts","role":"Infrastructure module that loads and caches indexed Spine units from the .spine/index directory for view layer consumption, particularly architecture diagram generation.","fileKind":"source"},{"filePath":"src/services/view/index.ts","role":"Public facade module for the view subsystem, centralizing exports for view-specific runtime and rendering components within the MCP (Model Context Protocol) resource layer.","fileKind":"source"},{"filePath":"src/services/view/public-surface-view.ts","role":"View generation scoring engine that ranks source files by their likelihood of being public API surface.","fileKind":"source"},{"filePath":"src/services/view/risk-hotspots-view.ts","role":"Pure view generator function that calculates architectural risk hotspots from indexed code units.","fileKind":"source"},{"filePath":"src/services/view/types.ts","role":"TypeScript interface defining a metadata wrapper for SpineUnit with line count, used by infrastructure components for index reading.","fileKind":"source"},{"filePath":"src/services/view/view-registry.ts","role":"Central registry and type definition module for architectural visualization views within the ArchSpine system.","fileKind":"source"},{"filePath":"src/services/view/view-renderer.ts","role":"View service module that renders architectural view artifacts (risk hotspots, CLI entries, MCP entries, module entries, public surface) into formatted markdown reports using filesystem-loaded templates.","fileKind":"source"},{"filePath":"src/services/view/view-runtime.ts","role":"Configuration resolution module for the experimental view layer and enabled views within the ArchSpine system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.695Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 视图层（`src/services/view/`）

视图层是 ArchSpine 的呈现子系统。它消费已索引的项目元数据，生成架构可视化图、分析报告和交互式图表。该目录包含所有负责定义、生成、评分和渲染架构视图的模块。

## 核心架构

该子系统围绕三个主要职责组织：

1. **视图定义与注册** – `view-registry.ts` 作为所有可用架构视图（架构图、风险热点、公共表面分析、CLI 条目、MCP 条目、模块条目）的中央目录。`view-runtime.ts` 解析运行时启用哪些视图的配置。

2. **视图生成与评分** – 各个生成器产生视图特定的数据：
   - `architecture-diagram-view.ts` 使用基于 LLM 的规范生成，从项目元数据创建交互式架构图。
   - `risk-hotspots-view.ts` 通过分析已索引代码单元的耦合度、复杂度和不稳定性，计算架构风险热点。
   - `public-surface-view.ts` 使用评分引擎对源文件按成为公共 API 表面的可能性进行排序。

3. **渲染与输出** – `view-renderer.ts` 使用文件系统加载的模板，将生成的视图工件转换为格式化的 Markdown 报告。`arch-diagram-renderer.ts` 是一个纯工具，将图表规范转换为 SVG 标记。

## 支持基础设施

- `index-loader.ts` 从 `.spine/index` 加载并缓存已索引的 Spine 单元，供视图生成器消费。
- `common.ts` 提供共享的评分工具和路径抑制函数。
- `types.ts` 定义跨层使用的元数据包装器（例如 `SpineUnitWithLineCount`）。
- `index.ts` 是公共外观，集中导出 MCP 资源层的组件。

## 关键实现领域

- **LLM 集成**：架构图视图（`architecture-diagram-view.ts`）是 LLM 规范生成的主要消费者，使其成为最依赖 AI 的组件。
- **风险分析**：`risk-hotspots-view.ts` 实现了核心架构风险评分算法，对识别问题模块至关重要。
- **基于模板的渲染**：`view-renderer.ts` 使用文件系统模板进行 Markdown 输出，支持可定制的报告格式。
- **注册表模式**：`view-registry.ts` 实现了一种类似插件的架构，视图在其中动态注册和发现。