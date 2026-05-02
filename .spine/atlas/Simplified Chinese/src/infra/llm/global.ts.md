<!-- spine-content-hash:5f0629dd8e76ded0baa7a0254046a017f7ace2b0f135413170e4f887e8102bdb -->
该文件是全局LLM配置文件I/O与凭据存储集成的基础设施外观层。它定义了`GlobalLLMConfigShape`接口，用于结构化提供商配置（provider、model、baseURL、mode、prompt tier、validate policy）。`GlobalLLMConfig`类负责在平台合适的全局目录（XDG_CONFIG_HOME或~/.config）中读取、写入和修剪JSON配置文件。`GlobalLLMSecrets`类通过`createGlobalLLMCredentialStore`包装`CredentialStore`抽象，以安全地管理LLM API密钥。它导出了`getGlobalArchSpineDir`工具函数，用于解析全局ArchSpine配置目录。此外，它还从prompt-policy模块重新导出了`LLMMode`、`PromptPolicyTier`和`ValidatePolicy`的类型定义。

**关键不变性**：`GlobalLLMConfigShape`接口必须对所有消费者保持稳定。密钥委托给CredentialStore，绝不直接管理。配置文件路径基于XDG_CONFIG_HOME或操作系统主目录确定。

**超出范围**：该模块不处理按项目或按用户的覆盖解析，不执行LLM推理或编排，也不验证超出通用形状的提供商特定模式。

**公共表面**：`getGlobalArchSpineDir`、`GlobalLLMConfig`、`GlobalLLMSecrets`、`GlobalLLMConfigShape`、`LLMMode`、`PromptPolicyTier`、`ValidatePolicy`。