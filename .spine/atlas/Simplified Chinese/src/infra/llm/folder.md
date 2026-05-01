<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/llm","role":"Core LLM infrastructure layer providing client abstractions, configuration management, and resilient execution for semantic generation.","responsibility":"Defines provider-agnostic LLM client interfaces and response structures, implements factory and runtime configuration resolution for instantiating provider clients, manages global LLM configuration file I/O and credential storage, and provides retry utilities with exponential backoff for resilient async operations.","children":[{"filePath":"src/infra/llm/base.ts","role":"TypeScript interface definitions module for LLM client abstractions, response structures, provider configuration, and semantic context tracking within the infrastructure layer.","fileKind":"source"},{"filePath":"src/infra/llm/factory.ts","role":"Infrastructure layer facade factory for instantiating LLM provider clients based on configuration.","fileKind":"source"},{"filePath":"src/infra/llm/global.ts","role":"Infrastructure facade for global LLM configuration file I/O and credential store integration.","fileKind":"source"},{"filePath":"src/infra/llm/providers","role":"LLM provider implementations and utilities for generating semantic summaries.","fileKind":"folder"},{"filePath":"src/infra/llm/retry.ts","role":"Infrastructure utility providing configurable retry logic with exponential backoff for resilient asynchronous operations.","fileKind":"source"},{"filePath":"src/infra/llm/runtime.ts","role":"Infrastructure runtime configuration resolver and LLM provider client factory within the LLM subsystem.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.784Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/llm` — 核心 LLM 基础设施

此目录是 ArchSpine 语义生成层的核心支柱。它提供与具体提供商无关的客户端抽象、配置管理以及所有 LLM 交互的弹性执行模式。

## 关键组件

- **`base.ts`** — 定义 LLM 客户端抽象、响应结构、提供商配置和语义上下文追踪的 TypeScript 接口。这是所有提供商必须实现的契约。
- **`factory.ts`** — 一个外观工厂，根据配置实例化 LLM 提供商客户端，将提供商选择与客户端使用解耦。
- **`global.ts`** — 管理全局 LLM 配置文件的 I/O 和凭据存储集成，处理持久化设置和密钥。
- **`runtime.ts`** — 解析运行时配置，并在 LLM 子系统内充当提供商客户端工厂，桥接配置与实例化。
- **`retry.ts`** — 提供带有指数退避的可配置重试逻辑，用于弹性异步操作，确保对瞬时故障的鲁棒性。
- **`providers/`** — 包含特定提供商的实现和用于生成语义摘要的工具。此子文件夹是具体提供商适配器（例如 OpenAI、Anthropic 等）的存放位置。

## 实现重点

最关键的区域是 `base.ts` 中的接口契约（定义了系统的 LLM 抽象边界）和 `retry.ts` 中的重试工具（确保操作弹性）。`providers/` 子文件夹是添加新提供商集成的地方，使其成为 LLM 子系统的主要扩展点。