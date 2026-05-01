<!-- spine-content-hash:14ea2fb427d9d05ed2c4c88281e16eaf35384bde93e7ce55df5b622d7b517fe2 -->
# GeminiClient — ArchSpine LLM 提供者

## 角色
Google Gemini API 的具体 LLM 提供者实现，负责为 ArchSpine 镜像系统生成结构化语义摘要。

## 主要职责
- 实现 `LLMClient` 接口，为配置、文档、源代码、文件夹和项目文件类型生成语义摘要。
- 使用 ArchSpine 提示引擎（`generateConfigPrompt`、`generateDocumentPrompt` 等）格式化提示，根据每个 `FileKind` 选择适当的模板。
- 向 Gemini API 发送请求，支持可配置的模型、生成策略和超时设置。
- 通过 `withRetry` 工具应用重试逻辑，增强对临时故障的鲁棒性。
- 使用 `parseMarkdownBlocks` 和 `parseStructuredResponse` 等工具函数解析和结构化 LLM 响应。

## 重要不变性
- 必须完全遵守所有支持文件类型的 `LLMClient` 接口契约。
- 必须使用 `infra` 中提供的提示工具，以确保各提供者之间的一致性。
- 不得吸收服务或任务编排的关注点（由 `infra-facade-imports` 规则强制执行）。

## 范围外
- 高级任务编排或引擎工作流（委托给服务处理）。
- API 密钥存储或轮换（由配置处理）。
- 在提供的提示工具之外实现自定义提示模板。

## 公开接口
- `GeminiClient` 类（实现 `LLMClient`）

## 架构意图
为 Gemini API 集成提供一个稳定、可配置的 LLM 提供者外观，将供应商特定细节与核心摘要生成逻辑隔离。最近的更改侧重于通过重试逻辑和错误处理改进来增强客户端稳定性。