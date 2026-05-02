<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/llm","role":"Core LLM abstraction layer for ArchSpine's mirror system, providing provider-agnostic interfaces, configuration management, and retry logic.","responsibility":"Defines base interfaces (LLMResponse, LLMClient, etc.), implements a factory for provider instantiation, manages global LLM configuration and secrets, provides retry with exponential backoff, resolves runtime settings from multiple sources, and contains concrete provider implementations (Gemini, OpenAI, mock) for generating semantic summaries.","children":[{"filePath":"src/infra/llm/base.ts","role":"TypeScript interface definitions module for LLM client abstractions, response structures, provider configuration, and semantic context tracking within the infrastructure layer.","fileKind":"source"},{"filePath":"src/infra/llm/factory.ts","role":"Infrastructure layer facade factory for instantiating LLM provider clients based on configuration.","fileKind":"source"},{"filePath":"src/infra/llm/global.ts","role":"Infrastructure facade for global LLM configuration file I/O and credential store integration.","fileKind":"source"},{"filePath":"src/infra/llm/providers","role":"LLM provider implementations and utilities for generating semantic summaries.","fileKind":"folder"},{"filePath":"src/infra/llm/retry.ts","role":"Infrastructure utility providing configurable retry logic with exponential backoff for resilient asynchronous operations.","fileKind":"source"},{"filePath":"src/infra/llm/runtime.ts","role":"Infrastructure runtime configuration resolver and LLM provider client factory within the LLM subsystem.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T07:41:45.798Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 大语言模型基础设施层

`src/infra/llm` 目录是 ArchSpine 镜像系统的核心 LLM 抽象层。它提供与提供商无关的接口、集中式配置以及弹性重试逻辑，使应用程序与任何一个大语言模型提供商解耦。

## 主要职责

- **接口契约**：`base.ts` 定义了基本类型，如 `LLMResponse`、`LLMClient` 和提供商配置结构，为所有 LLM 交互建立统一契约。
- **提供商工厂**：`factory.ts` 提供外观模式，根据运行配置实例化具体的提供商客户端，实现在不同 LLM 后端之间无缝切换。
- **全局配置**：`global.ts` 管理全局 LLM 配置文件的 I/O，并与凭证存储集成，集中管理密钥和设置。
- **带退避的重试**：`retry.ts` 实现了可配置的指数退避重试逻辑，用于弹性异步操作，是处理临时 API 故障的关键。
- **运行时解析**：`runtime.ts` 从多个来源（配置文件、环境变量、密钥）解析 LLM 设置，并暴露一个工厂以创建合适的提供商客户端。

## 值得注意的子模块

`providers/` 文件夹包含针对特定 LLM 后端的具体实现：
- **Gemini 提供商**
- **OpenAI 提供商**
- **Mock 提供商**（用于测试和本地开发）

这些实现生成语义摘要，并通过工厂实例化，使 ArchSpine 的 LLM 使用变得模块化和可扩展。

## 重要的实现领域

- **基础接口**（`base.ts`）—— 所有 LLM 操作的基础。
- **重试工具**（`retry.ts`）—— 确保对网络或服务故障的弹性。
- **运行时配置**（`runtime.ts`）—— 动态解析提供商设置。
- **提供商实现**（`providers/`）—— 对生产使用至关重要的实际 API 集成。