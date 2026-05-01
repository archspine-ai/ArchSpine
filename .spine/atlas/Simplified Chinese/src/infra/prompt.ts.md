<!-- spine-content-hash:232164bc0057389311d7bc59dd991b7413c339341b6da08a2039187526f09f2b -->
# ArchSpine – 提示生成外观模块

## 角色
本模块是提示生成功能的**公共外观模块**，为外部消费者提供稳定的导入接口，同时将其与内部提示实现细节隔离。

## 主要职责
- 为提示生成组件提供稳定的公共 API。
- 重新导出 `PromptBuilder` 用于构建提示。
- 重新导出针对配置、文档、文件夹、项目、Markdown、源代码和源代码验证 JSON 的专用提示生成器。
- 保护外部消费者免受内部提示模块重构和演进的影响。

## 不包含范围
- 提示渲染逻辑或实现细节。
- 任何服务、任务或引擎编排关注点。
- 与外部 API 或数据源的直接交互。

## 不变约束
- 只能从 `src/infra/prompt/*` 内部模块重新导出。
- 不得导入或重新导出服务、任务或引擎编排关注点。
- 必须保持纯重新导出的外观模式，不添加新逻辑。

## 公共接口
- `PromptBuilder`
- `generateConfigPrompt`
- `generateDocumentPrompt`
- `generateFolderPrompt`
- `generateProjectPrompt`
- `generateMarkdownPrompt`
- `generateSourcePrompt`
- `generateSourceValidationJsonPrompt`

## 架构意图
建立稳定的提示生成公共外观，将外部消费者与内部提示模块的演进解耦。