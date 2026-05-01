<!-- spine-content-hash:0b29a82af58e08dce738047947abb37345f3b6612b135a84b9798a6387d5098c -->
# ArchSpine 镜像系统配置

## 角色
此配置文件定义了 ArchSpine 镜像系统项目的核心运行参数。它控制本地化设置、LLM 提供商、MCP 上下文模式、钩子、工件以及文件扫描策略。

## 主要职责
- **本地化设置**：支持多语言
- **LLM 提供商**：选择与配置
- **MCP 上下文模式**：控制
- **预提交钩子**与同步模式管理
- **工件存储**配置
- **文件扫描策略**与忽略链管理

## 参数定义
- **schemaVersion**：定义配置模式的版本。必须是有效的语义化版本字符串。
- **project.name**：项目名称，用于标识和日志记录。
- **project.locales**：项目支持的语言列表。必须至少指定一种语言。
- **llm.provider**：指定要使用的 LLM 提供商。当前设置为 'mock' 用于测试。
- **mcp.contextMode**：控制 MCP 上下文模式。'off' 表示禁用上下文注入。
- **hooks.preCommit**：启用或禁用预提交钩子。当前设置为 false。
- **hooks.syncMode**：定义同步模式。'hook' 表示通过钩子触发同步。
- **artifacts**：工件存储的配置。当前为空。
- **scanPolicy.fileSource**：定义要扫描的文件来源。'git-tracked' 表示仅扫描 Git 跟踪的文件。
- **scanPolicy.ignoreChain.inheritGitIgnore**：是否继承 Git 忽略规则。设置为 true。
- **scanPolicy.ignoreChain.projectIgnore**：项目级忽略文件的路径。
- **scanPolicy.ignoreChain.localIgnore**：本地忽略文件的路径。
- **scanPolicy.protocolExclusions**：要从扫描中排除的路径模式列表。
- **scanPolicy.protocolInclusions**：要包含在扫描中的路径模式列表。

## 重要不变性
- `schemaVersion` 必须是有效的语义化版本字符串
- `project.locales` 必须至少包含一种语言
- `llm.provider` 必须是受支持的提供商标识符
- `scanPolicy.fileSource` 必须是允许的来源之一
- `scanPolicy.ignoreChain.inheritGitIgnore` 必须是布尔值
- `protocolExclusions` 和 `protocolInclusions` 必须是路径模式数组

## 稳定性与风险
此配置对系统稳定性至关重要。错误的语言设置可能导致本地化失败。禁用钩子可能导致状态不一致。mock LLM 提供商仅用于测试，不应在生产环境中使用。扫描策略控制哪些文件被处理；配置错误可能导致安全问题或数据丢失。

## 负面范围
此配置不定义运行时行为、业务逻辑或数据处理规则。它纯粹是一个静态配置文件，用于设置镜像系统的运行参数。