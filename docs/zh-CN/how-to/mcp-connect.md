# MCP 连接指南

ArchSpine 通过**模型上下文协议（Model Context Protocol，MCP）**在 STDIO 上暴露 `.spine/` 控制平面。本指南涵盖了将你的 AI agent 连接到 ArchSpine 所需的全部内容——无论你使用 Claude Desktop、Claude Code 还是 Cursor。

## MCP 简介

MCP 是一个开放协议，让 AI agent 能够发现并调用工具、读取资源以及从服务器获取提示词。ArchSpine 通过 STDIO 运行一个 MCP 服务器，暴露完整的 `.spine/` 控制平面：语义索引、依赖图、架构规则、派生视图等。

MCP 服务器是对 `spine sync` 已经计算好的数据的**透传**。它在运行时不做任何 LLM 调用。

## 前提条件

- Node.js >= 20
- 已初始化 `.spine/` 的仓库（已完成 `spine init`）
- 如需使用完整工具集：至少运行过一次 `spine sync`

## 快速配置

最快的连接方式是使用自动检测命令：

```bash
spine mcp setup
```

该命令扫描你的系统，查找支持的 MCP 客户端，检测哪些已经配置了 ArchSpine，并为所有目标写入正确的设置。

**它能检测和配置的内容：**

| MCP 客户端                | 配置文件                                                          |
| ------------------------- | ----------------------------------------------------------------- |
| Claude Code（项目级）     | 仓库根目录下的 `.mcp.json`                                        |
| Claude Code（全局）       | `~/.claude/mcp.json`                                              |
| Claude Desktop（macOS）   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop（Windows） | `%APPDATA%\Claude\claude_desktop_config.json`                     |
| Cursor                    | `~/.cursor/mcp.json`                                              |

**预期输出：**

```
ArchSpine MCP Setup
===================

Resolved command: npx --yes archspine@latest

Already configured:
  ✅ Claude Code (global) (~/.claude/mcp.json)

Available targets:
  ✅ (already configured) Claude Code (project)
  ✅ (already configured) Claude Code (global)
  📝 (will update) Claude Desktop
  🆕 (new file) Cursor

Writing configurations...
  ✅ Claude Code (project): .mcp.json
  ✅ Claude Code (global): ~/.claude/mcp.json
  ✅ Claude Desktop: ~/Library/Application Support/Claude/claude_desktop_config.json
  ✅ Cursor: ~/.cursor/mcp.json

Next steps:
  1. Restart your IDE or Claude Desktop for changes to take effect
  2. Verify the connection: look for "archspine" in the MCP server list
  3. Try an MCP tool: ask your agent "what modules are in this project?"
```

该命令从不会覆盖配置文件中已有的 MCP 服务器——它只会添加或更新 `archspine` 条目。

## 手动配置

如果自动检测不适用于你的设置，请手动添加配置。所有客户端使用相同的入口点：`spine mcp start`。

### Claude Code

支持两种配置位置。推荐使用**项目级**配置（仓库根目录下的 `.mcp.json`），便于团队共享：

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"]
    }
  }
}
```

对于适用于所有仓库的**全局**配置，编辑 `~/.claude/mcp.json`：

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"]
    }
  }
}
```

### Claude Desktop

编辑桌面配置文件。**macOS** 系统：

`~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows** 系统：

`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"]
    }
  }
}
```

### Cursor

编辑 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"]
    }
  }
}
```

### 传递环境变量

如果你的 LLM 提供商使用环境变量（API 密钥、模型名称），将它们添加到 `env` 块中：

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"],
      "env": {
        "SPINE_PROVIDER": "openai",
        "SPINE_MODEL": "gpt-4o",
        "SPINE_API_KEY": "sk-..."
      }
    }
  }
}
```

### 配置后重新加载

| 客户端         | 重新加载方式                                           |
| -------------- | ------------------------------------------------------ |
| Claude Code    | 启动新会话或运行 `/mcp reload`                         |
| Claude Desktop | 重启应用程序                                           |
| Cursor         | 重新加载窗口（`Cmd+Shift+P` 然后选择 "Reload Window"） |

## 能力概览

ArchSpine MCP 服务器暴露三个能力组：

- **21 个工具** -- 查询控制平面以获取上下文、分析和治理信息
- **4 个资源 URI** -- 从语义索引和视图中读取结构化数据
- **2 个提示词** -- 为修改代码的 agent 提供引导模板

所有工具均为只读。工具执行期间不做任何 LLM 调用。

## 工具分类

21 个 MCP 工具分为五个逻辑类别。完整规范含参数说明请参阅 [MCP 工具参考](../reference/mcp-tools.md)。

| 类别       | 工具                                                                                                                                  | 用途                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **查询**   | `spine_query_graph`、`spine_get_diagnostics`、`spine_match_semantic`、`spine_query_invariants`、`spine_query_responsibilities`        | 搜索知识图、按语义关键词查找模块、查询架构规则     |
| **上下文** | `spine_get_file_context`、`spine_get_module_context`、`spine_get_change_impact`、`spine_get_drift_history`、`spine_get_semantic_diff` | 获取文件或模块的完整治理上下文、分析变更影响       |
| **状态**   | `spine_get_sync_status`、`spine_get_baseline_status`、`spine_get_violations_summary`、`spine_get_config`、`spine_preview_scan`        | 检查 .spine/ 数据是否最新、查看活跃违规、检查配置  |
| **视图**   | `spine_get_view_data`、`spine_list_resource_templates`                                                                                | 读取预计算视图（public-surface、risk-hotspots 等） |
| **操作**   | `spine_run_scan`、`spine_run_sync`、`spine_check_operation`                                                                           | 触发扫描、运行增量同步、或验证操作是否符合规则     |

## 资源 URI

服务器暴露四个资源 URI 模板。Agent 可以通过标准的 `resources/read` MCP 方法读取它们。

| URI 模板                   | 内容                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `spine://project`          | 完整的项目级架构概览和模块分解                                                                                                                                     |
| `spine://folder/{dirPath}` | 特定目录内的架构和文件职责（例如 `spine://folder/src/services`）                                                                                                   |
| `spine://file/{filePath}`  | 单个文件的语义契约、架构不变量和结构骨架（例如 `spine://file/src/cli/index.ts`）                                                                                   |
| `spine://view/{viewType}`  | 任何已启用视图类型的预计算视图数据。支持的视图类型：`public-surface`、`risk-hotspots`、`architecture-diagram`、`project-health`、`agent-briefing`、`change-impact` |

对于文件夹和文件资源，服务器会剥离冗长的内部数据（溯源记录、声明的符号列表）以减少 token 消耗——这一特性称为 **Agent 上下文膨胀防护**。

## MCP 提示词

提示词是可复用的模板，用于引导 agent 的行为。服务器提供两个：

### architectural_context

当你需要了解一个文件的角色、依赖和约束后再进行修改时使用此提示词。接受一个必填参数：

```
architectural_context(filePath: "src/services/sync-service.ts")
```

该提示词指示 agent 按顺序调用三个工具：`spine_get_file_context`、`spine_get_change_impact`、`spine_check_operation`，然后再修改文件。

### pre_write_checklist

在创建、修改或删除文件之前使用此提示词。它根据操作类型生成一个安全检查清单：

| 参数           | 必填 | 描述                                                    |
| -------------- | ---- | ------------------------------------------------------- |
| `filePath`     | 是   | 要检查的相对文件路径                                    |
| `operation`    | 是   | 操作类型：`read`、`write`、`delete`、`rename`、`import` |
| `importTarget` | 否   | 当 `operation` 为 `import` 时必填；被导入的文件路径     |

该提示词生成一个多步骤检查清单，在执行操作前验证架构合规性。

## 上下文门控

MCPContextGate 控制 agent 如何发现代码库。你在 `.spine/config.json` 的 `mcp.contextMode` 下进行配置。三种模式可用：

| 模式            | 行为                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `off`           | 无限制。Agent 无需预置即可读取任何资源或调用任何工具。                                                                                                                         |
| `project-first` | Agent 必须先读取 `spine://project`，之后才能访问文件夹或文件资源。这确保它们在深入细节之前理解项目拓扑。                                                                       |
| `search-first`  | Agent 必须先调用搜索工具（`spine_query_responsibilities`、`spine_query_invariants` 或 `spine_preview_scan`），之后才能访问文件夹或文件资源。这鼓励有针对性的查询而非盲目遍历。 |

默认值为 `project-first`。修改方式：

```bash
spine config set mcp.contextMode search-first
```

## 验证连接

配置完成后，在新的 agent 会话中验证连接。

**检查服务器启动：**

```bash
spine mcp start
```

预期输出到 stderr：

```
ArchSpine MCP Server started on STDIO
```

按 `Ctrl+C` 停止。你的 MCP 客户端会自动启动同一进程。

**测试工具发现：**

向你的 agent 提问：

> _"列出 ArchSpine 可用的 MCP 工具。"_

Agent 应列出全部 21 个工具。如果看不到，请检查 MCP 客户端的连接日志。

**测试资源读取：**

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"spine://project"}}' | spine mcp start
```

或者直接问你的 agent：

> _"这个项目的架构拓扑是怎样的？"_

**测试提示词：**

> _"为 src/cli/index.ts 运行 pre_write_checklist 提示词，操作类型为 write。"_

Agent 应返回安全检查清单。

## 故障排除

### "spine: command not found"

MCP 客户端无法解析 `spine` 二进制文件。使用完整路径或 `npx`：

```json
{
  "command": "npx",
  "args": ["--yes", "archspine@latest", "mcp", "start"]
}
```

### ".spine is missing" 错误

仓库尚未初始化。运行：

```bash
spine init
spine sync
```

然后重启 MCP 连接。

### Agent 不使用工具

Agent 可能需要一点提示。安装 ArchSpine Claude Code 技能：

```bash
spine skill install
```

这会将 agent 指令写入 `~/.claude/skills/archspine/`，告诉你的 agent 在进入仓库时查阅控制平面。

### 工具返回"unknown"错误

MCP 服务器版本可能与 .spine/ 索引不同步。运行：

```bash
spine sync
```
