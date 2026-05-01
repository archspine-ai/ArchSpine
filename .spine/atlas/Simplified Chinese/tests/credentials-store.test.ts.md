<!-- spine-content-hash:caa71c111529ce9669fcbb6fef50c105ce5fb3d954aa1a1c45333c4cc3919d9e -->
# CredentialStore 测试套件

## 角色
CredentialStore 组件的 Vitest 测试套件，验证后端集成和回退文件安全性。

## 主要职责
- 测试 CredentialStore 使用不同后端实现（Memory、WindowsDPAPI、broken）的初始化。
- 验证在不同后端可用性场景下的密钥存储和检索行为。
- 确保回退凭证文件的创建以及根据最近安全修复的 gitignore 安全加固。
- 模拟文件系统操作以隔离测试环境并清理临时目录。

## 不涵盖范围
- 不测试生产环境中的凭证后端（如 WindowsDPAPI）。
- 不涵盖基于网络的凭证存储或远程密钥管理。
- 不测试存储中的并发访问或竞态条件。

## 不变规则
- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：test-file-suffix）。

## 变更意图
- **架构意图：** 为 CredentialStore 组件提供全面的测试覆盖，确保在多种后端实现和回退场景下的正确行为。
- **近期变更意图：** 强化回退凭证文件的 gitignore 安全性，确保回退文件被版本控制正确忽略，防止意外凭证泄露。

## 公开接口
- `describe('CredentialStore')`
- `it('should initialize with Memory backend')`
- `it('should fallback to file when backend is broken')`
- `it('should create gitignore for fallback file')`