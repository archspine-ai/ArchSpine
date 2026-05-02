<!-- spine-content-hash:5463c8025269c0a38b5c17ddad379077ad69a33a6bfce1ff5cdafef5b15ce5b9 -->
# `fix` CLI 命令适配器

## 角色

本文件作为 `fix` 操作的 CLI 命令适配器，通过薄接口将执行委托给运行时服务的修复子系统门面，确保命令层保持轻量且不包含领域逻辑。

## 关键职责

- 定义 `ExecuteFixCommandOptions` 接口，用于依赖注入 `RuntimeService`。
- 记录关于 `spine fix` 功能生成性质的实验性警告。
- 解析命令行参数以确定 `skipConfirmation` 和 `dryRun` 标志。
- 使用解析的配置调用 `runtimeService.getFixService()` 并触发修复运行。
- 如果修复运行报告残留架构违规，则抛出带有 `CliCommandFailed` 代码的 `ArchSpineError`。

## 重要不变项与职责边界

- 必须保持薄适配器模式；不吸收流水线、持久化或领域逻辑。
- 直接修复算法实现或编排严格委托给 `RuntimeService`。

## 公开表面

- `executeFixCommand`（主要入口点）
- `ExecuteFixCommandOptions`（接口）