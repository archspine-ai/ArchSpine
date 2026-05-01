<!-- spine-content-hash:176f7429f3101af5df6c06ab093d1502114f2ff5824dd8482b082174eef3e2d1 -->
# ArchSpine 视图渲染器

## 角色
视图渲染器是一个服务模块，负责将架构视图工件（风险热点、CLI 条目、MCP 条目、模块条目、公共表面数据）转换为格式化的 Markdown 报告。它从文件系统加载模板并应用它们，以生成一致且可读的文档输出。

## 主要职责
- 根据模板名称从磁盘加载并缓存 Markdown 模板。
- 渲染风险热点视图，包括严重性评分、详情格式化和 Markdown 转义。
- 渲染 CLI 命令条目视图，包含命令描述和元数据。
- 渲染 MCP（模型上下文协议）服务器条目视图，包含工具和资源列表。
- 渲染模块条目视图，显示入口点、种类、符号、置信度和摘要。
- 转义 Markdown 内联符号以防止意外格式化。
- 格式化置信度和种类以便在 Markdown 输出中显示。

## 重要不变性
- 模块使用文件系统（`fs`、`path`）从磁盘加载和缓存模板。
- 输出始终是经过适当转义的有效 Markdown。
- 所有渲染方法都是静态类方法，每种视图工件类型对应一个方法。
- 依赖于从 `../../types/view.js` 导入的集中式视图类型。

## 不涉及范围
- 不获取或生成视图工件数据——依赖导入的类型。
- 不通过 HTTP 或其他协议提供 Markdown 服务。
- 不将渲染输出持久化到数据库或外部系统。
- 不验证输入数据模式，仅进行基本的渲染处理。

## 公开接口
- `ViewRenderer` 类
- `ViewRenderer.renderRiskHotspots`
- `ViewRenderer.renderCLIEntries`
- `ViewRenderer.renderMCPEntries`
- `ViewRenderer.renderModuleEntries`
- `ViewRenderer.renderPublicSurface`