<!-- spine-content-hash:d456cb2f632dcd4d26569c0497d0f3f6dc614bb709d46ae2ec26f43c5a3b026c -->
# ArchSpine 全局 LLM 配置与密钥外观层

## 角色
全局 LLM 配置文件 I/O 与凭据存储集成的基础设施外观层。

## 主要职责
- 定义 `GlobalLLMConfigShape` 接口，用于结构化 LLM 提供商配置，包括 provider、model、baseURL、mode、prompt tier 和 validate policy。
- 实现 `GlobalLLMConfig` 类，在平台合适的全局目录（XDG_CONFIG_HOME 或 ~/.config）中读取、写入和修剪 JSON 配置文件。
- 实现 `GlobalLLMSecrets` 类，通过 `createGlobalLLMCredentialStore` 包装 `CredentialStore` 以安全地管理 LLM API 密钥。
- 导出 `getGlobalArchSpineDir` 工具函数，用于解析全局 ArchSpine 配置目录。
- 从 prompt-policy 模块重新导出 `LLMMode`、`PromptPolicyTier` 和 `ValidatePolicy` 的类型定义。

## 重要不变性
- `GlobalLLMConfigShape` 必须保持为所有 LLM 配置消费者提供稳定接口。
- `GlobalLLMSecrets` 必须将凭据存储委托给 `CredentialStore` 抽象，而不是直接管理密钥。
- 配置文件路径必须基于 XDG_CONFIG_HOME 或操作系统主目录确定。

## 负面范围（不涉及）
- 不处理按项目或按用户的覆盖解析。
- 不执行 LLM 推理或编排。
- 不验证超出通用形状的提供商特定配置模式。

## 公开接口
- `getGlobalArchSpineDir`
- `GlobalLLMConfig`
- `GlobalLLMSecrets`
- `GlobalLLMConfigShape`
- `LLMMode`
- `PromptPolicyTier`
- `ValidatePolicy`