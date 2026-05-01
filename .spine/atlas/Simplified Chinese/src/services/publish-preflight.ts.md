<!-- spine-content-hash:1f24e34f6ba205d2f3b5670c2bb8c3acbb229213653137aef3a502ca59cac792 -->
# ArchSpine 发布验证门面

## 角色
基础设施层的验证门面，用于断言发布操作的运行时条件，包括基线检查、快照就绪状态和本地策略警告。

## 主要职责
- 在发布前验证 `.spine` 目录和必需的 `manifest.json` 文件是否存在。
- 检查活动的运行时锁文件并验证其负载完整性，如果无效则抛出 `ArchSpineError`。
- 确保索引目录及其子结构（`atlas`、`rules`）存在以保证快照就绪。
- 通过检查运行时配置并发出控制台警告，提醒用户是否从本地策略发布。
- 如果任何基线或快照条件失败，则使用适当的错误代码抛出 `ArchSpineError`。

## 不涉及范围
- 不执行实际的发布操作或文件复制。
- 不处理网络或远程存储操作。
- 不管理用户身份验证或授权。
- 不实现任何用户界面或超出控制台警告的用户交互。

## 不变约束
- 所有断言函数在失败时必须抛出带有特定 `ErrorCodes` 的 `ArchSpineError`。
- 在任何发布操作进行之前，`.spine` 目录必须存在。
- 锁文件必须可解析且包含有效负载。
- 索引目录及其子目录（`atlas`、`rules`）必须存在以保证快照就绪。

## 公开接口
- `assertPublishRuntimeBaseline(rootDir: string): void`
- `assertPublishSnapshotReady(rootDir: string): void`
- `warnIfPublishingFromLocalStrategy(rootDir: string, runtimeIO?: RuntimeIO): void`