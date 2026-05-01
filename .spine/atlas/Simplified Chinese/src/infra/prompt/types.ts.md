<!-- spine-content-hash:f19dabf5a8daf22fb88ee6f2aca010e7b885fb697dccbd27c07bf3e24fdf3128 -->
# ArchSpine – 提示类型模块

## 角色
ArchSpine 提示生成与响应格式化协议的类型定义模块。

## 主要职责
- 定义 `PromptResponseMode` 类型，指定提示响应的允许输出格式：仅 JSON 或 JSON 与 Markdown。
- 定义 `MarkdownPromptInput` 接口，为生成 Markdown 文档提示提供结构化输入，包括标识符、文件类型、语义 JSON、语言列表以及可选的辅助上下文。
- 通过关联协议中的文件类型并指定所需的本地化语言，编码提示生成的契约。

## 重要不变性
- `MarkdownPromptInput.fileKind` 字段必须是协议中有效的 `FileKind` 或字面量 `'project'`。
- `PromptResponseMode` 类型是两个字符串字面量的联合，未经所有消费者更新不得扩展。

## 不涉及范围
- 提示生成的逻辑或实现。
- Markdown 渲染或格式化。
- 任何运行时行为或副作用。

## 公开接口
- `PromptResponseMode`
- `MarkdownPromptInput`