# ArchSpine 配置摘要

该配置文件为 ArchSpine 镜像系统设置基础参数。它决定了系统如何标识项目、哪个 LLM 引擎用于文档生成、MCP 上下文如何管理、预提交钩子是否启用，以及最重要的——哪些文件会被扫描和索引。扫描策略控制整个数据管道，因此此文件对准确和安全的索引至关重要。

## 关键参数

### 项目元数据
- **schemaVersion**：`1.0.0` – 必须为有效的语义版本。  
- **project.name**：`archspine-demo` – 在 ArchSpine 中标识项目，用于工件命名和遥测。  
- **project.locales**：`["English", "Simplified Chinese"]` – 多语言文档生成的活动语言列表。每个语言需在系统中注册。

### LLM 提供者
- **llm.provider**：`mock` – 选择语言模型后端。`mock` 是安全的测试提供者；切换为真实提供者（例如 `openai`）会将提示发送到外部。

### MCP 上下文模式
- **mcp.contextMode**：`off` – 控制模型上下文协议（MCP）集成。`off` 表示不共享外部上下文；`on` 启用共享。若未正确认证便启用，可能泄露内部上下文。

### 预提交钩子与同步模式
- **hooks.preCommit**：`false` – 若为 `true`，ArchSpine 在每次提交前运行检查。禁用（`false`）会降低安全性但加快提交速度。  
- **hooks.syncMode**：`hook` – 控制同步方式：通过 git 钩子（`hook`）或自动（`auto`）。

### 扫描策略
- **scanPolicy.fileSource**：`git-tracked` – 仅扫描版本控制文件。`filesystem` 会扫描磁盘上所有文件，可能意外索引无关目录。  
- **scanPolicy.ignoreChain**：  
  - `inheritGitIgnore: true` – 继承仓库 `.gitignore` 中的模式。  
  - `projectIgnore: ".spineignore"` – 应用项目级别的忽略规则（来自 `.spineignore`）。  
  - `localIgnore: ".spineignore.local"` – 允许通过 `.spineignore.local` 进行本地覆盖。  
  缺少任一文件可能导致扫描大量无关目录或遗漏重要排除项。  
- **protocolExclusions**：`[".spine/"]` – 始终排除在索引之外的路径。此处排除了整个 `.spine/` 目录，以避免索引内部工件。  
- **protocolInclusions**：`[".spine/rules/", ".spine/config.json"]` – 即使被忽略规则排除也始终包含的路径。这确保 `.spine/` 内的特定文件仍被索引。

## 稳定性与风险

- **索引不完整**：扫描策略配置错误（例如遗漏协议包含项）会导致索引不完整，造成规则执行缺失或视图陈旧。  
- **敏感数据泄露**：使用真实 LLM 提供者且提示不可信时，可能会将敏感代码暴露给外部服务。  
- **安全门移除**：禁用预提交钩子（当前配置 `hooks.preCommit: false`）移除了提交违规的安全检查。  
- **MCP 泄漏**：在未正确认证的情况下启用 MCP 上下文模式，可能将内部上下文泄露给外部服务。  
- **忽略链维护**：忽略链必须仔细维护；缺少 `.spineignore` 文件将默认无项目级忽略，可能导致扫描大量无关目录。协议排除与包含项不可重叠，否则会破坏扫描器。  
- **规则冲突**：协议排除与包含项不得重叠。本配置中排除了 `.spine/`，但包含了 `.spine/rules/` 和 `.spine/config.json`，这是正确的，因为包含项位于排除路径之下并优先生效。

当前配置属于安全的测试导向设置：使用模拟 LLM、禁用 MCP 上下文、跳过预提交检查、仅扫描 git 跟踪文件，并依赖分层忽略链。操作员在投入生产或启用真实 LLM 提供者前，应仔细审查并调整这些值。