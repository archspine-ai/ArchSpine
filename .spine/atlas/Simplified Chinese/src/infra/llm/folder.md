`src/infra/llm` 目录构成了 ArchSpine 镜像系统中大型语言模型（LLM）客户端抽象、配置与执行的基础设施层。其主要职责是提供与多个 LLM 提供商交互的统一接口，通过一致性的错误处理和配置合并，为不同文件类型生成语义摘要。

该目录按以下几个关键领域进行逻辑分组：

- **接口定义（`base.ts`）**：定义了核心 TypeScript 接口，包括 `LLMClient`（与提供商无关的抽象）、`LLMResponse`（结构化 JSON 和本地化 Markdown 输出）、`UsageInfo`（令牌消耗指标）、`ProviderConfig`（每个提供商的配置）以及 `PreviousSemanticContext`（用于跨文件版本的语义漂移检测）。这些接口是所有 LLM 交互的契约。

- **全局配置与凭证管理（`global.ts`）**：管理存储在 `XDG_CONFIG_HOME` 或 `~/.config` 下的全局 JSON 配置文件（`GlobalLLMConfig`），负责读取、写入和清理配置。同时通过 `GlobalLLMSecrets` 封装凭证存储（`CredentialStore`）以实现安全的 API 密钥管理，并导出 `getGlobalArchSpineDir` 以解析配置目录位置。

- **重试逻辑（`retry.ts`）**：实现了可配置的 `withRetry` 函数，该函数使用指数退避和抖动机制对异步操作进行重试，仅对通过 `isRetryableError` 识别出的瞬时错误（如网络重置、超时、套接字错误）进行重试。

- **工厂模式（`factory.ts`）**：提供静态工厂方法（`LLMFactory`），用于实例化支持的 LLM 提供商客户端（OpenAI、DeepSeek、OpenRouter、Groq、Gemini 以及用于测试的 Mock 客户端）。该工厂对提供商名称进行标准化处理（不区分大小写），并对不支持的提供商抛出描述性错误。

- **运行时解析（`runtime.ts`）**：通过合并项目配置、全局配置、环境变量和运行时覆盖项（具有明确的优先级顺序）来解析 LLM 设置（提供商、模型、基础 URL、API 密钥）。同时解析并验证 LLM 模式、提示策略层级和验证策略，然后通过 `LLMFactory` 创建提供商客户端。

- **具体提供商实现（`providers/`）**：包含实际的 LLM 客户端实现（Gemini、OpenAI 以及用于测试的 Mock 客户端），以及用于解析结构化响应、组装提示词和汇总使用信息的共享工具函数。该子目录承载了特定于提供商的逻辑，从而使基础设施的其他部分保持与提供商无关。

最重要的实现领域是统一的 `LLMClient` 接口（确保跨提供商的一致性）、`runtime.ts` 中的配置合并逻辑（决定哪些设置具有更高优先级）以及重试机制（为瞬时故障提供韧性）。工厂和具体实现共同确保了添加新的 LLM 提供商只需新增客户端实现和工厂分支即可。