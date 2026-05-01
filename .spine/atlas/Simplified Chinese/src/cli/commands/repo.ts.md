<!-- spine-content-hash:7cf308e51abca3228e225829a0af22011fdeb2326a8cba6c79607e959c6301c1 -->
# ArchSpine — `repo` 命令路由器

该模块作为 ArchSpine 系统中**仓库级操作的 CLI 命令路由器**。其主要职责是从命令行接收 `repo` 子命令，验证参数，并将执行分派给相应的策略函数。

## 主要职责

- 定义 `ExecuteRepoCommandOptions` 接口，该接口规定了传递给仓库命令执行器的选项结构。
- 将 `repo` 子命令路由到三种策略之一：`check`、`strategy` 或 `help`。
- 验证子命令参数，并在输入无效时调用 `throwCliUsage` 显示使用指南。
- 通过 `parseArtifactStrategy` 协调仓库工件策略的解析与执行。

## 重要不变性

- 该模块必须保持为**薄路由器**——绝不应包含仓库扫描、分析或工件生成的业务逻辑。
- 所有核心逻辑均委托给服务和引擎（例如 `repo/strategy.js`）。

## 不涉及范围

- 实现仓库分析或策略逻辑（委托给 `repo/strategy.js`）。
- 处理配置加载或持久化。
- 直接管理文件 I/O 或管道执行。

## 公开接口

- `ExecuteRepoCommandOptions` — 命令执行选项的接口。
- `executeRepoCommand` — 将子命令路由到其处理程序的主函数。