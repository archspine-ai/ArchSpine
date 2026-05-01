<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/llm/providers","role":"LLM provider implementations and utilities for generating semantic summaries.","responsibility":"Provides concrete LLM client implementations (Gemini, OpenAI, mock) and supporting utilities for assembling prompts, parsing structured responses, and merging usage data, enabling the ArchSpine mirror system to generate semantic summaries for various file kinds.","children":[{"filePath":"src/infra/llm/providers/gemini.ts","role":"Concrete LLM provider implementation for Google's Gemini API, handling structured summary generation for ArchSpine's mirror system.","fileKind":"source"},{"filePath":"src/infra/llm/providers/mock.ts","role":"Test infrastructure mock LLM client simulating LLM provider responses for unit and integration testing.","fileKind":"source"},{"filePath":"src/infra/llm/providers/openai.ts","role":"OpenAI-compatible LLM provider client implementing the LLMClient interface, with embedded prompt generation orchestration for ArchSpine's semantic analysis pipeline.","fileKind":"source"},{"filePath":"src/infra/llm/providers/utils.ts","role":"Infrastructure utility module providing content assembly, structured response parsing, and usage merging for the ArchSpine mirror system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:39.744Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/llm/providers` — 大语言模型提供商实现

此目录包含 ArchSpine 镜像系统中用于生成语义摘要的具体 LLM 客户端实现及配套工具。它是系统 AI 管道的执行层，将抽象的摘要请求转化为真实的 API 调用，并将返回结果解析为结构化数据。

## 主要子模块

- **`gemini.ts`** — 为 Google Gemini API 实现了 `LLMClient` 接口，负责处理 ArchSpine 所追踪的所有文件类型的结构化摘要生成。
- **`openai.ts`** — 兼容 OpenAI 的客户端，同时内嵌了提示词生成编排逻辑，是语义分析管道中一个自包含的提供商实现。
- **`mock.ts`** — 模拟 LLM 响应的测试替身，用于单元测试和集成测试，避免对外部 API 的依赖。
- **`utils.ts`** — 共享基础设施，负责组装内容提示词、解析 LLM 返回的结构化 JSON 响应，以及合并多次调用中的使用量元数据。

## 关键实现领域

- **提供商抽象**：每个客户端实现统一的 `LLMClient` 接口，使系统可以在不修改上层编排逻辑的前提下切换不同的提供商。
- **提示词组装**：`utils.ts` 中的工具函数构建上下文感知的提示词，包含文件元数据、AST 摘要以及之前的分析结果。
- **响应解析**：从 LLM 的自由文本响应中提取并验证结构化输出（如 JSON 模式），确保下游消费者获得一致的数据。
- **用量追踪**：针对每个文件，合并多次 LLM 调用的令牌计数和成本估算，支持准确的计费和配额管理。