<!-- spine-content-hash:b34f13e3370ae92af36b733078030d299045a2f51a2ad7fcbed6c8593fd834f6 -->
# ArchSpine – macOS 凭据后端

## 角色
基础设施外观层，提供针对 macOS 平台的安全凭据持久化存储后端。

## 主要职责
- 定义 `CredentialBackend` 接口，实现跨平台的统一凭据获取、设置和删除操作。
- 使用 macOS 原生安全命令行工具（`security`）实现 `MacOSKeychainBackend`。
- 通过检查 `process.platform` 封装平台可用性检测逻辑。

## 重要不变项与负面范围
- `CredentialBackend` 接口必须保持稳定，以避免破坏消费者。
- `MacOSKeychainBackend` 必须仅在 macOS（darwin 平台）上可用。
- 所有凭据操作必须委托给 macOS 原生安全命令行工具。
- **不涉及：** 跨平台凭据后端（例如 Windows Credential Manager、Linux secret-service）、高级凭据管理编排或缓存逻辑、用户认证或会话管理。

## 最重要的导出/外部可见行为
- `CredentialBackend`（接口）
- `MacOSKeychainBackend`（类）

## 漂移检测
检测到漂移：先前的语义契约描述了一个基于文件的回退后端，但当前源代码仅包含 `MacOSKeychainBackend` 类。基于文件的后端已被移除，表明范围有所缩小。