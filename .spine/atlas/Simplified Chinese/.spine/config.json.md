<!-- spine-content-hash:ab521e4ea6b96d6baae6c5d153f73f33715847aa23b8fd72a9e914d5f3ed8e76 -->
# ArchSpine 配置文件摘要

## 角色
ArchSpine 项目镜像系统的核心配置文件，定义项目元数据、LLM/MCP 设置、钩子行为、产物策略、扫描策略和初始化状态。

## 主要职责
- 注册项目元数据和受支持的语言
- 控制 LLM 和 MCP 上下文模式行为
- 配置预提交钩子和同步模式
- 定义产物生成策略和视图层启用
- 建立文件扫描策略，包括忽略链和协议排除/包含规则
- 管理代理指令、忽略文件和 git 属性的初始化状态

## 重要不变性
- `schemaVersion` 必须为 `'1.0.0'` 以确保兼容性
- `project.locales` 必须至少包含 `'English'` 和 `'Simplified Chinese'`
- `mcp.contextMode` 必须为 `'off'` 以避免上下文干扰
- `hooks.preCommit` 必须为 `false` 以防止自动提交
- `artifacts.strategy` 必须为 `'distributable'`
- `scanPolicy.fileSource` 必须为 `'git-tracked'`
- `scanPolicy.ignoreChain.inheritGitIgnore` 必须为 `true`
- `scanPolicy.protocolExclusions` 必须包含 `'.spine/'`
- `scanPolicy.protocolInclusions` 必须包含 `'.spine/rules/'` 和 `'.spine/config.json'`
- `initState.artifactStrategy` 必须与 `artifacts.strategy` 一致

## 负面范围（不在范围内）
- 未明确定义任何不在范围内的项目。

## 最重要的导出/外部可见行为
- 配置强制执行严格的扫描策略，仅处理 git 跟踪的文件，确保可预测且安全的文件分析。
- 忽略链继承 `.gitignore` 规则，并添加项目级（`.spineignore`）和本地（`.spineignore.local`）忽略文件，提供分层排除控制。
- 协议排除规则防止扫描 `.spine/` 目录本身，而包含规则确保始终扫描关键配置文件（`config.json` 和 `rules/`）。
- 产物生成使用 `'distributable'` 策略，生成适合共享的可移植输出。
- MCP 上下文模式已禁用（`'off'`），防止意外上下文注入干扰系统行为。
- 预提交钩子已禁用，避免自动提交导致仓库不稳定。
- 初始化状态仔细跟踪哪些文件由 ArchSpine 管理或创建，哪些由用户创建，防止意外覆盖用户创建的文件。

## 稳定性和风险
此配置文件对系统稳定性至关重要。扫描策略确保仅扫描 git 跟踪的文件，并采用强大的忽略链，继承 `.gitignore` 并添加项目级和本地忽略。协议排除规则防止扫描 `.spine/` 目录本身，而包含规则确保始终扫描关键配置文件。产物策略设置为 `'distributable'`，适合安全共享。MCP 上下文模式已禁用，降低了意外上下文注入的风险。预提交钩子已禁用，防止自动提交可能导致的仓库不稳定。初始化状态仔细管理哪些文件由 ArchSpine 创建，哪些由用户创建，避免覆盖。总体而言，此配置促进了稳定、可预测的镜像系统，数据丢失或损坏的风险极低。