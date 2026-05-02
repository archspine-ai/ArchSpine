<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/credentials","role":"Platform-specific credential storage and secure secret management infrastructure.","responsibility":"Provides a unified credential storage system with platform-specific backends (e.g., macOS Keychain) and secure file-based fallback, enabling safe persistence and retrieval of API keys and secrets across different environments.","children":[{"filePath":"src/infra/credentials/backend.ts","role":"Infrastructure facade providing a platform-specific credential storage backend for secure secret persistence on macOS.","fileKind":"source"},{"filePath":"src/infra/credentials/store.ts","role":"Infrastructure module providing secure credential storage with pluggable backends and file-based fallback safety.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.098Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
## 凭证存储基础设施（`src/infra/credentials`）

该目录实现了 ArchSpine “镜像”系统中与平台相关的凭证存储层。它提供了一个统一接口，用于安全持久化密钥（如 API 密钥），支持原生操作系统的钥匙串（macOS）和安全文件回退。模块旨在抽象平台差异，同时保持强安全保证。

### 主要子模块

- **`backend.ts`** — 基础设施外观，负责选择并初始化适当的凭证存储后端。目前提供专用的 macOS 钥匙串后端用于原生机密持久化。

- **`store.ts`** — 核心存储模块，实现可插拔后端架构。处理机密生命周期操作（读/写/删除），并包含文件加密回退机制，以确保在无法使用原生钥匙串的环境（如 CI）中安全存储秘密。

### 关键实现领域

- 在 macOS 上使用系统钥匙串进行安全机密存储。
- 为非 macOS 平台或 CI 环境提供加密文件备份。
- 后端抽象设计支持未来扩展（例如 Windows 凭据管理器、Linux secret-service）。
- 错误处理与安全默认值，防止意外泄露秘密。

```json
{
  "localized": {
    "Simplified Chinese": "该目录提供与平台相关的凭证存储和安全秘钥管理基础设施。包含 macOS 钥匙串后端（`backend.ts`）和带文件回退的可插拔存储模块（`store.ts`）。"
  }
}
```