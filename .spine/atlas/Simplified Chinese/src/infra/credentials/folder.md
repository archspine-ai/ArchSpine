<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/credentials","role":"Platform-specific credential storage and secure secret management infrastructure.","responsibility":"Provides a unified credential storage system with platform-specific backends (e.g., macOS Keychain) and secure file-based fallback, enabling safe persistence and retrieval of API keys and secrets across different environments.","children":[{"filePath":"src/infra/credentials/backend.ts","role":"Infrastructure facade providing a platform-specific credential storage backend for secure secret persistence on macOS.","fileKind":"source"},{"filePath":"src/infra/credentials/store.ts","role":"Infrastructure module providing secure credential storage with pluggable backends and file-based fallback safety.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.098Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# 凭据基础设施（`src/infra/credentials/`）

该目录为 ArchSpine 提供平台特定的凭据存储和安全密钥管理基础设施。其职责是提供一个统一的凭据存储系统，支持多种后端，包括 macOS 钥匙串等平台原生解决方案，以及安全的基于文件的回退机制。这确保了在不同环境中 API 密钥和机密的安全持久化和检索。

该目录包含两个核心实现文件：

- **`backend.ts`** – 一个基础设施外观，提供平台特定的凭据存储后端，针对 macOS 上的安全密钥持久化进行了优化。
- **`store.ts`** – 一个基础设施模块，实现具有可插拔后端和基于文件的回退安全层的安全凭据存储。

这里最重要的实现领域是平台后端的抽象层和回退安全逻辑，它们共同保证了无论底层操作系统如何，凭据都能保持可访问和安全。