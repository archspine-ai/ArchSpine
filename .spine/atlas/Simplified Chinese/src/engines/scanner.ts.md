<!-- spine-content-hash:3826adaa5ad9627b7c63961fcbf9a7025e4b6339c30d1664e20ec9c780baa9da -->
# ArchSpine 扫描引擎

## 角色
核心文件系统扫描引擎，通过分层忽略规则、git diff 集成和可配置的扫描策略来发现、过滤和报告仓库文件。

## 主要职责
- 通过文件系统遍历递归发现仓库根目录下的所有文件。
- 使用 `ignore` 库应用来自 `.gitignore`、`.spineignore` 以及协议特定排除/包含的分层忽略规则。
- 基于 `ScanPolicy` 使用 picomatch 模式对包含和排除进行文件过滤。
- 通过 `ScannerGitClient` 执行 git diff 命令识别变更文件，支持增量扫描。
- 生成结构化的 `ScanResult` 输出，包含 `allFiles` 和 `changedFiles` 数组供下游消费。

## 重要不变性与负面范围
- **不得** 导入 CLI 入口模块（引擎独立性规则）。
- **必须保持** 与服务级编排解耦。
- **必须提供** 可复用的分析逻辑，不依赖表示层。
- **不在范围内：** CLI 参数解析、服务级编排、文件内容分析/转换、超出 git diff 的持久状态管理。

## 公开接口（导出的行为）
- `ScanResult`（接口）
- `defaultScannerGitClient`（从 `scanner-git` 导入）
- `ScannerGitClient`（类型，从 `scanner-git` 导入）
- `ScanPolicy`（从 `scan-policy` 导入）
- `DEFAULT_SCAN_POLICY`（从 `scan-policy` 导入）

## 架构意图
提供一个可复用的引擎级文件扫描模块，通过分层忽略规则和 git diff 集成发现仓库文件，生成结构化结果供下游分析使用。

## 近期变更意图
解决 lint 错误并完成 v1.0 前的流水线修复，确保扫描器接口稳定且可用于生产环境。