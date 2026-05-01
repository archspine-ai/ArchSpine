<!-- spine-content-hash:064d4eda44eb8563be07bd89326f4616c2fae95cbd8759b087fcca6876e8bd06 -->
# ArchSpine – `buildMarkdownOnlyPrompt` 工具

## 角色
这是一个基础设施工具，负责从语义 JSON 输入构建本地化的、仅包含 Markdown 的提示字符串。它是 ArchSpine 系统中用于文档生成的可复用构建块。

## 主要职责
- 使用 `PromptBuilder` 门面组装完整的提示字符串，专门用于文档生成任务。
- 集成来自共享工具的本地化语言指令和 Markdown 段落指导。
- 将提供的语义 JSON 及辅助上下文格式化为提示上下文块。
- 确保最终输出符合指定语言的 Markdown 块标记（例如 `---MARKDOWN:English---`）。

## 关键不变项与职责边界
- **必须**导入 `PromptBuilder` 门面来构建提示；不得使用其他提示构建机制。
- **不得**包含任何业务逻辑或领域特定处理。此工具纯粹是结构性和格式化导向的。
- **必须**输出一个格式正确的、带有 Markdown 块标记的字符串。
- **职责边界**：不负责编排服务或引擎执行、管理身份验证或用户会话、执行数据持久化或查询、以及渲染 UI 组件。

## 最重要的导出行为
主要的公开接口是函数 **`buildMarkdownOnlyPrompt`**。该函数接收语义 JSON 输入，并返回一个格式正确、本地化的 Markdown 字符串。它是从结构化数据生成文档提示的唯一入口点。