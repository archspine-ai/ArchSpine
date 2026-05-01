<!-- spine-content-hash:092bd83998d0ce3b7fedecaf90b959688096b7610870ed79eed858053b1c42bc -->
# ArchSpine – 提示外观模块

## 角色
基础设施外观模块，为提示渲染和组合工具提供稳定的公共 API。

## 主要职责
- 公开 `PromptBuilder` 类，用于程序化提示组装
- 为不同架构范围（配置、文档、文件夹、项目）提供聚合提示生成函数
- 导出针对 Markdown 和源代码上下文的专用提示生成器
- 维护稳定的导入边界，将提示组装与策略和预算关注点分离

## 不涉及范围（负面范围）
- 提示策略或预算逻辑
- 服务编排或任务执行
- 引擎运行时关注点

## 不变约束
- 不得导入或重新导出服务、任务或引擎编排模块
- 仅暴露提示渲染和构建器能力
- 调用者应优先使用此公共外观，而非导入深层私有实现路径

## 公开表面（导出符号）
- `PromptBuilder`
- `generateConfigPrompt`
- `generateDocumentPrompt`
- `generateFolderPrompt`
- `generateProjectPrompt`
- `generateMarkdownPrompt`
- `generateSourcePrompt`
- `generateSourceValidationJsonPrompt`

## 架构意图
该模块作为干净的基础设施外观，将提示组装与策略和预算关注点隔离。它符合更广泛的重构工作，旨在建立子系统外观并解决层反转问题。