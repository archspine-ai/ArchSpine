---
outline: deep
---

# CLI 命令参考

ArchSpine 命令行界面的完整参考。14 个活跃命令，按功能分组。

**源码：** `src/cli/index.ts`（分发）、`src/cli/help.ts`（帮助文本）、`src/cli/commands/*.ts`（实现）。

## 顶层标志

| 标志                       | 描述               |
| -------------------------- | ------------------ |
| `--version`、`-v`          | 打印版本号并退出   |
| `--help`、`-h`             | 打印通用帮助并退出 |
| `<cmd> --help`、`<cmd> -h` | 打印特定命令的帮助 |

## 退出码

| 码值 | 含义                                 |
| ---- | ------------------------------------ |
| `0`  | 成功                                 |
| `1`  | 命令失败（所有错误默认使用退出码 1） |

退出码由 `ArchSpineError.exitCode` 设置，默认为 `1`。源码：`src/core/errors.ts`。

## 命令参考

### 入门

这些命令在初始化之前即可工作，专为新用户设计。

---

#### `init`

在当前仓库中初始化 ArchSpine。

**用法：**

```bash
spine init [--agent-file <AGENTS.md|CLAUDE.md|GEMINI.md>]
           [--artifact-strategy <local|distributable>]
           [--inject-package-scripts | --no-inject-package-scripts]
```

**标志：**

| 标志                          | 类型   | 必填 | 默认值 | 描述                                                               |
| ----------------------------- | ------ | ---- | ------ | ------------------------------------------------------------------ |
| `--agent-file`                | string | 否   | —      | 要注入的 agent 指令文件（`AGENTS.md`、`CLAUDE.md` 或 `GEMINI.md`） |
| `--artifact-strategy`         | string | 否   | —      | 产物管理策略（`local` 或 `distributable`）                         |
| `--inject-package-scripts`    | —      | 否   | —      | 将基于 `npx` 的辅助脚本注入 `package.json`                         |
| `--no-inject-package-scripts` | —      | 否   | —      | 跳过 `package.json` 脚本注入                                       |

**行为：**

1. 提示选择文档语言。
2. 提示选择规则模板。
3. 提示设置 Git 钩子。
4. 可选提示 LLM 配置。
5. 可选地注入 agent 指令文件（`AGENTS.md`、`CLAUDE.md` 或 `GEMINI.md`）。
6. 可选地将基于 `npx` 的辅助脚本注入 `package.json`。
7. 使用所选设置创建 `.spine/config.json`。

初始化后，运行 `spine sync` 以构建语义索引。

**源码：** `src/cli/commands/init.ts`

---

#### `try`

零配置预览：查看 ArchSpine 能检测到什么，无需 API 密钥或控制平面。

**用法：**

```bash
spine try
```

**标志：** 无（拒绝参数）。

**行为：** 读取仓库以检测 `.spine/` 输入和可分发生成快照是否已存在、发现语言分布情况、对最多三种语言运行示例 AST 提取，并打印明确的后续步骤。不修改仓库状态。

**源码：** `src/cli/commands/try.ts`

---

#### `scan`

预览有效扫描边界或运行快速 AST 扫描。

**用法：**

```bash
spine scan --dry-run
spine scan --quick
```

**标志：**

| 标志        | 类型 | 必填         | 描述                                                                          |
| ----------- | ---- | ------------ | ----------------------------------------------------------------------------- |
| `--dry-run` | —    | 是（使用时） | 预览有效扫描边界和忽略链，不写入任何内容                                      |
| `--quick`   | —    | 是（使用时） | 纯 AST 扫描，无需 LLM。将知识图生成到 `.spine/view/data/knowledge-graph.json` |

两个标志互斥，必须提供其中一个。

**行为：**

- `--dry-run`：从 `.spine/config.json`（或默认值）读取当前 `ScanPolicy`，评估忽略链，计算扫描边界，并打印有效配置。
- `--quick`：仅使用 AST 提取扫描仓库。报告文件计数、语言统计和模块依赖信息。

**源码：** `src/cli/commands/scan.ts`

---

### 日常使用

日常使用的主要工作流命令。

---

#### `sync`

增量同步：从已更改的文件刷新语义索引和视图。

**用法：**

```bash
spine sync [--hook] [--repair-violations] [--retry-failed]
```

**标志：**

| 标志                  | 类型 | 必填 | 默认值 | 描述                                                       |
| --------------------- | ---- | ---- | ------ | ---------------------------------------------------------- |
| `--hook`              | —    | 否   | —      | 适用于 pre-commit 钩子的轻量级索引刷新。跳过语义索引生成   |
| `--repair-violations` | —    | 否   | —      | 修复受保护的生成员。若违规数超出目标范围，则升级为完整构建 |
| `--retry-failed`      | —    | 否   | —      | 从最新同步检查点重新运行失败的摘要或状态提交文件           |

三个标志互斥，一次只能使用一个。

**行为：**

1. 检查有效的语义镜像 baseline。全新状态需要先执行 `spine build`。
2. 检测自上次同步以来的语言分布变化。
3. 通过 `SyncService` 对已更改文件运行增量同步。
4. 在钩子模式下，跳过语义索引生成并打印摘要。
5. 若配置了 agent 文件，刷新 V2 agent 指令块。

**源码：** `src/cli/commands/sync.ts`

---

#### `check`

根据 `.spine/rules/` 中定义的架构规则审计项目。

**用法：**

```bash
spine check
```

**标志：** 无。

**行为：** 从 `.spine/rules/` 加载规则，使用 picomatch glob 模式匹配被跟踪的文件，并按文件和规则分组报告违规。若发现任何违规或验证失败，则以退出码 1 退出。

**注意：** `spine check` 是实验性的。对于架构治理，建议使用 MCP 工具直接读取 `.spine/` 控制平面。

**源码：** `src/cli/commands/check.ts`

---

#### `info`

显示工作区配置、同步状态和协议摘要。

**用法：**

```bash
spine info [--verbose]
```

**标志：**

| 标志        | 类型 | 必填 | 默认值 | 描述                                                |
| ----------- | ---- | ---- | ------ | --------------------------------------------------- |
| `--verbose` | —    | 否   | —      | 显示 LLM 设置的详细运行时解析信息，包括每个值的来源 |

**行为：** 打印工作区配置、同步数据和协议版本的快照。没有 `.spine/` 时，显示可用信息并指出缺少的内容。

**源码：** `src/cli/commands/info.ts`

---

#### `view`

显示、更新或手动生成视图。还提供 Web 仪表板和语义漂移历史。

**用法：**

```bash
spine view <subcommand> [args]
```

**子命令：**

| 子命令     | 参数          | 描述                                                       |
| ---------- | ------------- | ---------------------------------------------------------- |
| `show`     | 无            | 打印视图状态：图层开关、已配置视图、有效视图和可用视图列表 |
| `set`      | 无            | 打开交互式视图选择器提示                                   |
| `enable`   | `<view-id>`   | 启用单个视图 ID                                            |
| `disable`  | `<view-id>`   | 禁用单个视图 ID                                            |
| `describe` | `<view-id>`   | 检查已注册的视图定义                                       |
| `generate` | 无            | 从当前索引手动派生所有已启用的视图                         |
| `serve`    | `[port]`      | 启动 Web 仪表板（默认端口：7899）                          |
| `history`  | `<file-path>` | 查看特定文件的语义漂移历史                                 |

**可用视图 ID**（源码：`src/services/view/view-registry.ts`）：

| 视图 ID                | 标题       | 完整同步 | LLM | 输出文件                                                                             |
| ---------------------- | ---------- | -------- | --- | ------------------------------------------------------------------------------------ |
| `public-surface`       | 公开接口   | 否       | 否  | `public-surface.json`、`public-surface.md`                                           |
| `risk-hotspots`        | 风险热点   | 否       | 否  | `risk-hotspots.json`、`risk-hotspots.md`                                             |
| `architecture-diagram` | 架构图     | 是       | 否  | `architecture-diagram.json`、`architecture-diagram.html`、`architecture-diagram.svg` |
| `project-health`       | 项目健康度 | 否       | 否  | `project-health.md`                                                                  |
| `agent-briefing`       | Agent 简报 | 否       | 否  | `agent-briefing.md`                                                                  |
| `change-impact`        | 变更影响   | 否       | 否  | `change-impact.json`、`change-impact.md`                                             |

**源码：** `src/cli/commands/view.ts`、`src/services/view/view-registry.ts`

---

### MCP 集成

用于将 AI agent 连接到 ArchSpine 控制平面的命令。

---

#### `mcp`

配置或启动 MCP 服务器，用于 IDE 和 agent 集成。

**用法：**

```bash
spine mcp <start|setup>
```

**子命令：**

| 子命令  | 描述                                                        |
| ------- | ----------------------------------------------------------- |
| `start` | 在 STDIO 传输上使用 JSON-RPC 协议启动 MCP 服务器            |
| `setup` | 自动检测并为 Claude Code、Claude Desktop 或 Cursor 配置 MCP |

**行为（setup）：** 检测 IDE 并写入相应的 MCP 配置文件。对于 Claude Code，写入 `.claude/mcp.json` 或 `.mcp.json`。对于 Claude Desktop，写入 `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）或对应平台路径。对于 Cursor，写入 `~/.cursor/mcp.json`。

**行为（start）：** 在 STDIO 上启动 ArchSpine MCP 服务器。服务器为只读，不会写入 `.spine/` 协议产物。

**源码：** `src/cli/commands/mcp.ts`

---

#### `skill`

安装或卸载 ArchSpine Claude Code agent 技能。

**用法：**

```bash
spine skill <install|uninstall>
```

**子命令：**

| 子命令      | 描述                                                        |
| ----------- | ----------------------------------------------------------- |
| `install`   | 将 ArchSpine agent 技能安装到 `~/.claude/skills/archspine/` |
| `uninstall` | 移除 ArchSpine agent 技能                                   |

安装后，Claude Code agent 在进入使用 ArchSpine 的仓库时会自动查阅 `.spine/` 控制平面。

**源码：** `src/cli/commands/skill.ts`

---

### 配置

用于管理设置、规则和生命周期的命令。

---

#### `config`

读取或写入持久化配置值。

**用法：**

```bash
spine config <get|set> <key> [value]
```

**子命令：**

| 子命令 | 参数            | 描述       |
| ------ | --------------- | ---------- |
| `get`  | `<key>`         | 读取配置值 |
| `set`  | `<key> <value>` | 写入配置值 |

**支持的键：**

| 键                       | 类型     | 描述                                         |
| ------------------------ | -------- | -------------------------------------------- |
| `llm.provider`           | string   | LLM 提供商名称（例如 `openai`、`anthropic`） |
| `llm.model`              | string   | 模型名称（例如 `gpt-4o`）                    |
| `llm.baseURL`            | string   | 自定义 API 基础 URL                          |
| `hooks.preCommit`        | boolean  | 启用或禁用 pre-commit 同步                   |
| `hooks.syncMode`         | string   | 钩子同步策略（`hook`）                       |
| `artifacts.strategy`     | string   | 产物分发策略（`local` 或 `distributable`）   |
| `artifacts.viewLayer`    | boolean  | 启用或禁用视图层                             |
| `artifacts.enabledViews` | string[] | 已启用的视图 ID 列表                         |

**源码：** `src/cli/commands/config.ts`

---

#### `llm`

管理全局或项目的 LLM 设置。

**用法：**

```bash
spine llm [--global | --project] <show|setup|set|clear|test>
```

**标志：**

| 标志        | 类型 | 必填 | 默认值 | 描述                                              |
| ----------- | ---- | ---- | ------ | ------------------------------------------------- |
| `--global`  | —    | 否   | 是     | 操作全局配置（`~/.config/archspine/config.json`） |
| `--project` | —    | 否   | —      | 操作项目配置（`.spine/config.json`）              |

**子命令：**

| 子命令  | 描述                                                              |
| ------- | ----------------------------------------------------------------- |
| `show`  | 打印当前 LLM 设置及其解析来源                                     |
| `setup` | 交互式 LLM 设置向导                                               |
| `set`   | 设置特定的 LLM 字段（`provider`、`model`、`base-url`、`api-key`） |
| `clear` | 清除特定的 LLM 字段（`api-key`）                                  |
| `test`  | 测试当前的 LLM 配置                                               |

**示例：**

```bash
spine llm show
spine llm setup
spine llm --project set provider openai
spine llm --global clear api-key
```

**源码：** `src/cli/commands/llm.ts`

---

#### `rules`

将架构规则模板预加载到 `.spine/rules/`。

**用法：**

```bash
spine rules add <template-name>
```

**子命令：**

| 子命令 | 参数              | 描述                                     |
| ------ | ----------------- | ---------------------------------------- |
| `add`  | `<template-name>` | 将预构建的规则模板添加到 `.spine/rules/` |

**可用模板：**

| 模板                    | 描述                           |
| ----------------------- | ------------------------------ |
| `no-core-to-cli`        | 核心模块不能被 CLI 模块导入    |
| `no-cross-layer`        | 严格的层隔离，依赖方向必须单向 |
| `no-circular-deps`      | 循环依赖检测                   |
| `public-surface-stable` | 公共 API 接口必须保持向后兼容  |
| `test-must-exist`       | 每个模块必须有对应的测试文件   |

**示例：**

```bash
spine rules add no-cross-layer
spine rules add no-circular-deps
```

**源码：** `src/cli/commands/rules.ts`

---

#### `remove`

从仓库中移除 `.spine/` 状态和所有 ArchSpine 管理的文件。

**用法：**

```bash
spine remove [--yes]
```

**标志：**

| 标志    | 类型 | 必填 | 默认值 | 描述         |
| ------- | ---- | ---- | ------ | ------------ |
| `--yes` | —    | 否   | —      | 跳过确认提示 |

**行为：** 删除 `.spine/` 目录，从 `.git/hooks/` 中移除 ArchSpine 管理的 Git 钩子块，并清理 agent 指令文件、`.gitignore`、`.gitattributes`、`.spineignore`、`.ignore` 以及 `package.json` 脚本中的管理条目。

**源码：** `src/cli/commands/remove.ts`

---

### 恢复

---

#### `build`

从头完全重建语义镜像 baseline。

**用法：**

```bash
spine build
```

**标志：** 无（拒绝参数）。

**行为：**

1. 使用严格验证和语义优先生成。
2. 从头重建 `.spine/index/`。
3. 使用完整同步（非钩子模式）。

适用于新仓库、重大重构、运行时恢复，或任何需要重建受信 baseline 的场景。日常使用请优先使用 `spine sync`。

**源码：** `src/cli/commands/build.ts`

---

## 已重定向的命令

以下命令曾为顶层命令，现已重定向为子命令。它们仍然作为别名工作，但已从通用帮助输出中隐藏。

| 旧命令          | 新用法                 |
| --------------- | ---------------------- |
| `spine publish` | `spine sync --publish` |
| `spine status`  | `spine info status`    |
| `spine usage`   | `spine info --usage`   |
| `spine hook`    | `spine config hook`    |
| `spine repo`    | `spine config repo`    |
| `spine history` | `spine view history`   |

以下命令已被**删除**，不再可用：

- `spine god` — 已删除
- `spine fix` — 已删除

## 环境变量

| 变量              | 用途                                          |
| ----------------- | --------------------------------------------- |
| `SPINE_PROVIDER`  | 项目配置未设置时的 LLM 提供商回退值           |
| `SPINE_API_KEY`   | LLM 鉴权的 API 密钥                           |
| `SPINE_MODEL`     | 项目配置未设置时的模型回退值                  |
| `SPINE_BASE_URL`  | 项目配置未设置时的基础 URL 回退值             |
| `SPINE_PRECOMMIT` | 覆盖 pre-commit 同步开关（`true` 或 `false`） |
