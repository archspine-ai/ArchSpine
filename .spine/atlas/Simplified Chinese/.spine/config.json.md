# ArchSpine 配置总结

本配置定义了 ArchSpine 镜像系统的运行边界和默认行为，涵盖扫描策略、工件生成、钩子管理以及代理指令和忽略文件的初始状态控制。

## 关键参数及其作用

### 扫描策略
- **`scanPolicy.fileSource`**：必须设为 `"git-tracked"`，仅扫描版本控制内的文件。其他设置可能导致扫描未跟踪文件或生成文件，带来风险。
- **`scanPolicy.ignoreChain`**：默认继承 `.gitignore` 的排除模式（`inheritGitIgnore: true`），项目专属排除使用 `.spineignore`，本地可覆盖为 `.spineignore.local`。该链确保镜像中不包含不需要的文件。
- **`scanPolicy.protocolExclusions`**：排除了 `.spine/` 目录，但通过 `protocolInclusions` 明确包含了 `.spine/rules/` 和 `.spine/config.json`。请确保这些列表准确无误，避免泄露内部配置或遗漏必需文件。

### MCP 上下文模式
- **`mcp.contextMode`**：必须设为 `"off"` 以禁用 MCP 上下文注入。启用该模式可能引发安全漏洞或意外上下文暴露——这是一项关键安全不变量。

### 钩子
- **`hooks.preCommit`**：设为 `false` 以防止意外自动化。启用预提交钩子可能导致同步循环或阻塞提交。
- **`hooks.syncMode`**：设为 `"hook"`，表示通过钩子触发同步。更改此设置可能导致同步行为异常。

### 工件生成策略
- **`artifacts.strategy`**：必须为 `"distributable"` 以保证一致的、可分发的工件输出。其他策略可能产生非标准结果。
- **`artifacts.experimentalViewLayer`**：当前启用（`true`）以支持新 UI 功能，但可能存在不稳定风险，请留意回归问题。
- **`artifacts.enabledViews`**：选定了 `public-surface`、`risk-hotspots` 和 `architecture-diagram` 视图。增减视图会改变工件内容。

### 初始状态管理
`initState` 中的布尔值指示 ArchSpine 或用户管理哪些配置文件：
- **`agentInstructionsCreatedByArchSpine`**：`false` 表示 `AGENTS.md` 由用户管理，ArchSpine 修改可能覆盖用户内容。
- **`spineIgnoreManaged`、`searchIgnoreManaged`、`gitIgnoreManaged`、`gitAttributesManaged`**：均为 `true`，即 ArchSpine 会管理这些文件。升级时用户编辑可能被覆盖。如需自定义，请将这些布尔值设为 `false` 或使用本地忽略文件。
- **`artifactStrategy`**：必须与 `artifacts.strategy`（`"distributable"`）一致。不一致会导致初始化失败。

## 稳定性与操作风险

- **`mcp.contextMode` 或 `hooks.preCommit` 设置错误**：可能引入安全漏洞或自动化冲突。
- **协议排除/包含列表不匹配**：会导致关键文件被镜像遗漏，或内部目录被暴露。
- **将 `scanPolicy.fileSource` 改为非 `git-tracked`**：会扫描非 Git 文件，可能泄露密码或配置。
- **当 `*Managed` 为 `true` 时编辑被管理的文件**（如 `.gitignore`、`.spineignore`）：ArchSpine 会覆盖这些编辑。请使用本地忽略文件进行自定义。
- **升级安全性取决于 `initState` 设置**：如果你依赖用户管理的文件，请确保相应的 `*Managed` 布尔值为 `false`。

在部署前仔细审查本配置，特别关注排除/包含列表和钩子设置。