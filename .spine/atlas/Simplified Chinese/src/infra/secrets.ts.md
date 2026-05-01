<!-- spine-content-hash:4e514f4760428ca2e6633c67bf8d4fdf9d208595a7f2b653f0fbc101a7f954e8 -->
# ArchSpine – 密钥模块

## 角色
用于安全 LLM 凭据检索和管理的基础设施外观。

## 主要职责
- 为底层 LLM 凭据存储提供简化的公共接口。
- 使用项目根目录和可选后端初始化凭据存储。
- 从凭据存储中检索存储的 LLM API 密钥。
- 管理凭据存储实例的生命周期（包括设置、清除、检查存在性以及查询来源/后端）。

## 重要不变性与否定范围
- 必须保持为凭据存储实现的薄外观。
- 不得假设或硬编码特定的后端实现。
- 必须为消费者提供稳定的 API 以检索和管理 LLM 凭据。
- **不涉及：** 编排更高级别的服务或引擎工作流、直接与外部 LLM API 交互、处理用户认证或会话管理、提供加密/解密算法（委托给后端）。

## 公共表面（导出/外部可见）
- `Secrets` 类
- `Secrets.constructor(rootDir: string, backend?: CredentialBackend)`
- `Secrets.getLLMApiKey(): string | undefined`
- `Secrets.setLLMApiKey(key: string): void`
- `Secrets.clearLLMApiKey(): void`
- `Secrets.hasLLMApiKey(): boolean`
- `Secrets.getSource(): CredentialSource`
- `Secrets.getBackendName(): string`