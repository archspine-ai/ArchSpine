此目录（`src/infra/llm/`）实现了 **ArchSpine 镜像系统中用于 LLM 客户端抽象、配置管理和弹性调用的基础设施层**。它提供了一套统一的、与提供商无关的方式来与多个 LLM 后端交互，同时处理配置注入、凭据管理和网络弹性。

其核心子模块分为五个模块和一个提供商子目录：

- **核心接口**（`base.ts`）——定义了 `LLMClient`、`LLMResponse`、`UsageInfo`、`ProviderConfig` 和 `PreviousSemanticContext` 等契约。这些抽象使系统的其余部分能够以统一方式操作任何提供商。
- **客户端工厂**（`factory.ts`）——一个静态工厂（`LLMFactory`），根据提供商名称（OpenAI、DeepSeek、OpenRouter、Groq、Gemini、Mock）实例化对应的客户端实现。它处理名称归一化和提供商特有的构造逻辑。
- **全局配置**（`global.ts`）——负责读写位于平台全局目录（`XDG_CONFIG_HOME` 或 `~/.config`）下的 JSON 配置文件。同时，通过 `GlobalLLMSecrets` 封装 `CredentialStore`，实现 API 密钥的安全管理。
- **重试逻辑**（`retry.ts`）——`withRetry` 实现了带指数退避和抖动的重试机制，针对瞬态网络错误（如 `ECONNRESET`、`ETIMEDOUT`）进行重试。这是系统弹性的关键组件。
- **运行时解析**（`runtime.ts`）——合并来自项目配置、全局配置、环境变量和运行时覆盖的 LLM 设置，然后调用工厂生成可直接使用的客户端。同时验证所需设置（如 API 密钥）是否存在于给定的命令上下文中。
- **提供商实现**（`providers/` 子目录）——包含 **Gemini**、**OpenAI**（及其变体）以及用于测试的 **Mock** 提供商的具体客户端。每个实现都实现了 `LLMClient` 接口，包括提示词构建、API 通信、响应解析和用量汇总。

最重要的实现区域是：
- `base.ts` 中的**接口定义**，因为它们是所有提供商必须遵循的契约。
- **运行时解析**和**工厂**模块，共同将提供商选择与系统其他部分解耦。
- **重试逻辑**，确保系统能从瞬态故障中恢复，而不会将错误向上传播。