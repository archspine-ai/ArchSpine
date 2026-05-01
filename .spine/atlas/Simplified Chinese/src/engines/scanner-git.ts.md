<!-- spine-content-hash:b268f44939fb5af3dc6825c30d4a420f514a9a633a1b32bdd31315b2f85df904 -->
# ArchSpine – Git 客户端工具

**角色：** 为扫描器模块提供可复用的 Git 命令执行客户端引擎工具。

**主要职责：**
- 定义 `ScannerGitClient` 接口，用于同步执行 Git 命令。
- 提供默认实现，委托给 `child_process.execFileSync`。

**不包含：**
- 编排扫描器工作流或服务级逻辑。
- 处理 Git 仓库状态管理或更高级的分析。
- 提供异步 Git 命令执行。

**不变约束：**
- 必须保持与 CLI 入口和展示层解耦。
- 必须导出同步的 Git 客户端接口供引擎使用。

**公开接口：**
- `ScannerGitClient` 接口
- `defaultScannerGitClient` 常量

**架构意图：** 为引擎模块提供解耦、可复用的 Git 客户端接口，使其能够执行 Git 命令而无需依赖编排层。此文件作为稳定的工具模块，支持扫描器引擎。