<!-- spine-content-hash:ab10d0fb9dbfac90cea76c35d4c1f5eaaaa23db1476b9caaaa1d1dba0970008a -->
# ArchSpine 初始化命令 — 源码摘要

## 角色
用于初始化 ArchSpine 环境、配置和仓库结构的 CLI 命令编排器。

## 主要职责
- 解析 CLI 参数，包括代理文件规范 (`--agent-file`)、产物策略 (`--artifact-strategy`) 和包脚本注入 (`--inject-package-scripts`)。
- 通过 Config 服务管理文档的语言配置选择与持久化。
- 通过 `runRepositoryBootstrap` 函数编排仓库引导，以设置 `.spine` 目录结构。
- 通过 `runRuntimeBootstrap` 函数编排运行时引导，以初始化运行时状态并提示初始同步。

## 重要不变性与负面范围
- 必须保持为轻量 CLI 适配器，将所有管道和持久化工作委托给服务或引导模块。
- 不得吸收会导致运行时行为在 CLI 外部不可复用的逻辑。
- 属于服务、核心、引擎或基础设施的管道或持久化逻辑不在范围内。
- 超出委托给引导函数范围之外的直接文件系统或数据库操作不在范围内。

## 最重要的导出/外部可见行为
- `parseInitAgentFileArg` — 解析 `--agent-file` 参数。
- `parseInitArtifactStrategyArg` — 解析 `--artifact-strategy` 参数。
- `parseInitInjectPackageScriptsArg` — 解析 `--inject-package-scripts` 参数。
- `parseInitLanguageArg` — 解析语言配置参数。
- `runInit` — 编排完整初始化流程的主入口点。