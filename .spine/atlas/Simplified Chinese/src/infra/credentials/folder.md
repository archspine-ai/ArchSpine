本目录包含 ArchSpine 镜像系统的跨平台凭据存储基础设施。它支持多种后端（macOS 钥匙串、Linux secret-tool、Windows DPAPI 以及内存存储），用于安全持久化和检索 LLM API 密钥等机密信息。文件分为两个核心子模块：

- `backend.ts` — 定义了 `CredentialBackend` 接口，并实现了各平台专属的后端，同时提供工厂函数 `createDefaultCredentialBackend` 用于自动选择合适后端。
- `store.ts` — 提供工厂函数 `createProjectLLMCredentialStore` 和 `createGlobalLLMCredentialStore`，使用可插拔的后端管理作用域凭据存储，并采用确定性的密钥命名方式。

重点实现领域包括平台检测、密钥验证、条件性警告以及统一接口封装，以屏蔽操作系统特定细节。