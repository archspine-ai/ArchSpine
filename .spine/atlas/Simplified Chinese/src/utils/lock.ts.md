<!-- spine-content-hash:eed04775b7d123e338f9d71f12eca21e0fddb0b62c7dc93aae823e566c85bcdb -->
# ArchSpine 锁工具

## 角色
基础设施工具，为 ArchSpine 系统提供基于文件的互斥锁机制，防止运行时竞态条件。

## 主要职责
- 在 `.spine` 目录下创建并管理锁文件，强制独占访问，防止竞态条件。
- 使用 `crypto.randomUUID` 生成唯一锁令牌，用于所有权标识和验证。
- 通过检查进程存活状态检测并处理过期锁，清理死进程以确保系统健壮性。
- 注册进程终止信号清理处理器，保证锁资源被正确释放。
- 提供 `parseLockPayload` 和 `serializeLockPayload` 函数，用于锁负载数据的序列化和反序列化。

## 重要不变性
- 锁文件始终存储在相对于 `rootDir` 的 `.spine` 目录下。
- 每个锁令牌是由 `crypto.randomUUID` 生成的唯一 UUID。
- 通过进程信号处理器（`SIGINT`、`SIGTERM`、`exit`）保证锁被释放。

## 不涉及范围
- 超出基于文件锁定的进程间通信。
- 跨多台机器的分布式锁管理。
- 基于数据库或网络的锁定机制。

## 公开接口
- `LockManager` 类（构造函数、`acquire`、`release`、`isHeld` 方法）
- `parseLockPayload(content: string): RuntimeLockPayload`
- `serializeLockPayload(payload: RuntimeLockPayload): string`
- `RuntimeLockPayload` 接口

## 架构意图
提供健壮的基于文件的互斥机制，防止 ArchSpine 运行时环境中的并发访问冲突。