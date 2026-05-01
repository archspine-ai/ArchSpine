<!-- spine-content-hash:0a61eb606355f9f438f29e3c095b034fc1d70ffee5127bf71fb77f9e8cd70fce -->
# ArchSpine – 仓库制品管理与初始化策略

## 角色
基础设施模块，定义仓库制品管理和初始化策略的接口与编排逻辑。

## 主要职责
- 定义仓库策略检查、应用、规则模板安装、代理指令同步、受管文件操作和包脚本注入的结果接口。
- 使用导入的工具函数，编排对受管仓库文件（如 `.gitattributes`、`.gitignore`）与预期模板的验证。
- 通过导入的同步函数，协调将 ArchSpine 特定配置文件和代理指令同步到目标仓库。
- 提供基于 `Config` 配置确定和应用制品策略（如可分发 vs. 初始化）的逻辑。

## 重要不变项与负面范围
- **不变项：** 依赖 `Config` 进行制品策略配置；依赖工具模块进行文件同步和块管理；仅导出策略结果的接口定义，不导出具体实现。
- **负面范围：** 不涉及直接文件系统 I/O（委托给导入的工具）、视图特定渲染或 UI 逻辑、HTTP 请求处理或 API 端点、底层 Git 操作。

## 最重要的导出/外部可见行为
该模块暴露以下公共接口：
- `RepositoryStrategyCheckResult`
- `RepositoryStrategyApplyResult`
- `RuleTemplateInstallResult`
- `AgentInstructionsSyncResult`
- `ManagedRepositoryFilesResult`
- `InjectPackageScriptsResult`

这些接口定义了所有策略相关操作的契约，确保策略定义与具体文件操作之间的分离。