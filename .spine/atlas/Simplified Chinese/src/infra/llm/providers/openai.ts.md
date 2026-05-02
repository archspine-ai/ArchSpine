<!-- spine-content-hash:92e8d378bb0d2ed1663f84a423962d192b7822771ca56f60cae220ffb012056d -->
# OpenAICompatibleClient

该文件实现了 `LLMClient` 接口，作为 OpenAI 兼容的提供者客户端。其主要职责是通过可配置的参数（API 端点、模型、API 密钥、超时等，来自 ProviderConfig）初始化 OpenAI SDK 客户端，并为每种文件类型（源代码、文档、配置、文件夹、项目、Markdown）生成语义摘要。然而，它违反了**基础架构门面**设计规则，吸收了本应由专门编排层处理的编排逻辑（提示生成、响应解析、策略编排）。

**主要职责：**
- 根据 `ProviderConfig` 初始化 OpenAI 客户端。
- 使用导入的提示生成器（如 `generateSourcePrompt`、`generateConfigPrompt` 等）构建每种文件类型的结构化提示。
- 调用聊天完成 API，并将响应通过工具函数解析为结构化的 JSON 和 Markdown 块。
- 合并多次调用的令牌使用信息，用于聚合报告。
- 使用导入的 `buildSupportingContext` 工具构建辅助上下文（如先前的语义信息）。

**重要不变性及负面范围：**
- 大模型提供者客户端应为轻量传输门面，仅暴露单一的 `generate(prompt)` 方法。该文件导入了提示生成和响应解析工具，这些应属于编排层。
- 文件类型特定的内容准备（将文件类型映射到提示）和策略编排不在该模块的范围内。
- 应优先使用公开的基础架关门面，而非直接从深层私有实现路径导入。

**检测到漂移：** 是。文件头明确指出该文件已超越纯大模型客户端的接口，嵌入了编排关注点。语义分析确认了此模式。

**公开表面：**
- `class OpenAICompatibleClient implements LLMClient`

**规则违例：**
- `infra-facade-imports`（警告）：从编排域导入，违反了基础架构模块不得吸收编排关注点的规则。

**架构意图：** 目标架构为清晰的分层设计，提供者为传输门面，提示生成和响应解析提取到共享编排层。该文件当前违反了这一意图。