<!-- spine-content-hash:e8ace2ca53cb3649d745b222eeb22c4cd0853a9f47cf4be7d0af2f46c72625ed -->
# ArchSpine 同步工具模块

## 角色
提供文件级别同步和移除操作的实用模块，用于管理仓库配置文件中 ArchSpine 代理指令块和配置段。

## 主要职责
- 定义同步状态类型（`AgentInstructionsSyncStatus`、`PackageScriptStatus`、`SearchIgnoreSyncStatus`、`SpineIgnoreSyncStatus`、`GitIgnoreSyncStatus`、`GitAttributesSyncStatus`），用于跟踪各种配置文件中 ArchSpine 块的同步结果。
- 定义移除状态类型（`AgentInstructionsRemovalStatus`、`SearchIgnoreRemovalStatus`、`SpineIgnoreRemovalStatus`、`GitIgnoreRemovalStatus`、`GitAttributesRemovalStatus`、`PackageScriptRemovalStatus`），用于跟踪块移除操作。
- 提供文件 I/O 工具，用于在 `.gitignore`、`.gitattributes`、`package.json` 脚本、`spineignore` 和搜索忽略文件中插入、更新或移除由 START/END 标记界定的块。
- 通过基于正则表达式的块模式匹配，读取、修改和写入配置文件，维护 ArchSpine 特定配置段的完整性。

## 重要不变性与范围限制
- 所有块操作使用模板中定义的一致 START/END 标记。
- 文件修改保留有界块之外的现有内容。
- 移除操作会在块删除后清理多余的空行。
- 模板内容定义委托给 `agent-instructions.templates.js`。
- 跨多个文件的高级同步编排操作不在本模块范围内。
- 不包含 CLI 命令处理或用户交互逻辑。

## 最重要的导出行为
该模块导出以下表示同步和移除操作结果的状态类型：
- **同步状态**：`AgentInstructionsSyncStatus`、`PackageScriptStatus`、`SearchIgnoreSyncStatus`、`SpineIgnoreSyncStatus`、`GitIgnoreSyncStatus`、`GitAttributesSyncStatus`
- **移除状态**：`AgentInstructionsRemovalStatus`、`SearchIgnoreRemovalStatus`、`SpineIgnoreRemovalStatus`、`GitIgnoreRemovalStatus`、`GitAttributesRemovalStatus`、`PackageScriptRemovalStatus`

这些类型供消费者使用，以了解文件级操作的结果，而无需直接检查文件内容。