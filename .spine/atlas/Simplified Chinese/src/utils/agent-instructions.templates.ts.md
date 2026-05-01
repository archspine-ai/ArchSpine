<!-- spine-content-hash:1c2e89e674a4600c77e598edb5a37268c18e0cefb66ccb2067e0899b77a74a63 -->
# ArchSpine 静态配置模块

本模块集中管理代理指令和仓库文件管理的静态配置字符串，确保 ArchSpine 系统的一致性和易于更新。

## 角色

为 ArchSpine 系统提供代理指令块和仓库忽略模式的静态配置模块。

## 主要职责

- 定义文档中 ArchSpine 代理指令块的起始和结束标记。
- 提供完整的 ArchSpine 代理指令块内容，用于插入 AI 代理提示中。
- 定义搜索忽略模式的路径和内容，以排除生成的 ArchSpine 输出。
- 定义 `.spineignore`、`.gitignore` 和 `.gitattributes` 文件的推荐行，以管理仓库噪音和生成内容。

## 重要不变性

- 导出的常量是不可变的字符串或数组。
- `AGENT_BLOCK_START` 和 `AGENT_BLOCK_END` 标记必须存在于 `ARCHSPINE_AGENT_BLOCK` 内容中。

## 范围外（不负责）

- 忽略文件的动态生成或验证。
- 解析或解释指令块的内容。
- 强制系统中其他部分使用这些常量。

## 最重要的导出行为

该模块导出以下常量，构成公共接口：

- **代理指令标记**：`AGENT_BLOCK_START`、`AGENT_BLOCK_END`、`ARCHSPINE_AGENT_BLOCK`
- **搜索忽略模式**：`SEARCH_IGNORE_PATH`、`SPINEIGNORE_PATH`、`SEARCH_IGNORE_LINES`、`SEARCH_IGNORE_CONTENT`
- **Spineignore 配置**：`SPINEIGNORE_BLOCK_START`、`SPINEIGNORE_BLOCK_END`、`SPINEIGNORE_RECOMMENDED_LINES`
- **Gitignore 配置**：`GITIGNORE_BLOCK_START`、`GITIGNORE_BLOCK_END`、`LOCAL_GITIGNORE_LINES`、`DISTRIBUTABLE_GITIGNORE_LINES`
- **Gitattributes 配置**：`GITATTRIBUTES_BLOCK_START`、`GITATTRIBUTES_BLOCK_END`、`DISTRIBUTABLE_GITATTRIBUTES_LINES`

## 变更意图

架构意图是集中管理代理指令和仓库文件管理的静态配置字符串，以确保一致性和易于更新。最近的更新在 `ARCHSPINE_AGENT_BLOCK` 中加入了 `npx --yes archspine@latest try` 命令以提供只读预览，与“收紧模式处理并添加尝试预览”的提交保持一致。