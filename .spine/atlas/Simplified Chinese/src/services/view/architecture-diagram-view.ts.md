<!-- spine-content-hash:db0ec1c2e54c8c2276fb1af7f12a266f430a8dfc7fbe96d5beba72cc5e4b022d -->
# ArchSpine 视图推导服务

## 角色
ArchSpine 视图推导服务，负责基于项目元数据，利用 LLM 生成规范，进而生成并渲染交互式架构图。

## 主要职责
- 通过 `ViewIndexLoader` 从视图索引加载项目和文件夹单元，以获取架构上下文。
- 使用预定义的 `generateArchitectureDiagramPrompt` 模板构建 LLM 提示，请求生成架构图规范。
- 调用文本生成 LLM 客户端，生成结构化的 `ArchDiagramSpec` JSON。
- 通过内部验证逻辑，检查生成的规范是否包含必要字段、节点类型以及结构完整性。
- 使用 `ArchitectureDiagramRenderer` 将验证通过的规范渲染为 HTML。
- 通过 `OutputManager` 保存渲染后的 HTML 和视图数据，确保持久化。

## 不涉及范围
- 不直接管理 LLM 客户端的配置或认证。
- 不处理底层图形渲染或 SVG 生成。
- 不提供用于图表交互的用户界面组件。

## 不变约束
- 必须依赖文本生成 LLM 客户端来生成图表规范。
- 必须依赖 `ViewIndexLoader` 获取架构上下文。
- 输出必须通过 `OutputManager` 的 `saveView` 和 `saveViewHtml` 方法保存。

## 导出接口
- `deriveArchitectureDiagramView` 函数