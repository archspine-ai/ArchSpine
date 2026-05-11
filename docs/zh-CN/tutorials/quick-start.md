# 快速开始

从零到"我的 AI 助手理解我的代码库"，只需不到 5 分钟。

本教程以 ArchSpine 仓库本身作为示例。每个命令的输出与你在此看到的结果一致。

## 前提条件

- **Node.js >= 20** -- ArchSpine 编译为 ESM，需要现代运行时
- **一个 Git 仓库** -- ArchSpine 在任何 Git 托管的项目中均可工作。你不需要已有的 `.spine/` 目录。

## 第一步：尝试（零配置预览）

在安装任何东西之前，先看看 ArchSpine 能从你的仓库中检测到什么。无需 LLM 密钥、无需配置、无副作用。

```bash
npx archspine try
```

该命令运行三项快速检查，全部在本地完成：

1. **采用检查** -- 检测 `.spine/` 是否已存在
2. **语言景观** -- 扫描仓库中受支持的语言
3. **AST 预览** -- 从示例文件中提取导入图和导出接口

**预期输出：**

```
ArchSpine Try -- Zero-Config Preview
====================================

Repository: archspine
ArchSpine adopted: yes

  ArchSpine is already active in this repository.
  .spine/index/ and .spine/view/ are populated and ready for consumption.

--- Language Landscape ---

  typescript: .ts, .tsx
  yaml: .yml, .yaml

--- AST Preview (no API keys required) ---

  typescript (XX source files, .ts, .tsx)
    Sample: src/cli/help.ts
    Imports (X total):
      ...
    Exports (X total):
      ...

--- What This Means ---

  This repo is ready. Connect your agent:
    npx --yes archspine@latest mcp setup
```

如果仓库中还没有 `.spine/`，输出末尾的建议块会提示你运行 `npx archspine init`。

## 第二步：快速扫描

对代码库进行一次快速、零依赖的扫描。这一步**在任何** Git 仓库上都可以运行，甚至无需初始化。

```bash
npx archspine scan --quick
```

快速扫描仅使用 AST 分析（基于正则表达式，无需 LLM），大多数仓库在 30 秒内即可完成。它会发现文件、分类语言并提取模块级结构。

**预期输出：**

```json
{
  "mode": "quick",
  "scannedAt": "2026-05-09T12:00:00.000Z",
  "fileCount": 142,
  "languageStats": {
    ".ts": 98,
    ".tsx": 12,
    ".yml": 18,
    ".json": 14
  },
  "status": "ok"
}
```

快速扫描是一种轻量级的健康检查。你可以任意频繁地运行它——它不产生持久状态。

## 第三步：初始化（引导控制平面）

初始化 `.spine/` 目录。这会创建控制平面结构并引导你完成初始配置。

```bash
npx archspine init
```

交互式向导将引导你完成以下步骤：

1. **语言** -- 选择要索引的语言（从你的仓库自动检测）
2. **Agent 指令** -- 可选地创建 `CLAUDE.md`、`AGENTS.md` 或 `GEMINI.md` 文件
3. **Pre-commit 钩子** -- 可选地安装用于自动同步的钩子
4. **LLM 凭证** -- 可选地设置 LLM 提供商凭证

**创建的内容：**

```
.spine/
  config.json    # 你的持久化配置
  rules/         # 架构治理规则（你编辑这些文件）
  index/         # 语义索引（由 sync 生成）
  view/          # 派生视图（agent 简报、架构图等）
  manifest.json  # 同步状态跟踪
```

初始化后，验证结构：

```bash
ls .spine/
```

## 第四步：LLM 设置（可选）

ArchSpine 在同步期间使用 LLM 生成语义摘要。这一步是**可选的**，因为你可以使用纯扫描模式，但我们建议使用它以获得最丰富的 agent 体验。

```bash
spine llm setup
```

交互式提示让你从八个提供商中选择：**OpenAI**、**DeepSeek**、**OpenRouter**、**Groq**、**Gemini**、**Ollama**、**LM Studio**，或自定义 OpenAI 兼容端点。

想跳过向导直接设置值：

```bash
spine llm --project set provider openai
spine llm --project set model gpt-4o
spine llm --project set api-key sk-...
```

或使用环境变量：

```bash
export SPINE_PROVIDER=openai
export SPINE_MODEL=gpt-4o
export SPINE_API_KEY=sk-...
```

验证连接：

```bash
spine llm test
```

```
  LLM connection verified (provider: openai, model: gpt-4o)
```

如果你更喜欢不需要 API 密钥也不需要网络的本地模型，请参阅[本地 LLM 指南](/how-to/local-llm)。

## 第五步：同步（生成语义索引）

sync 命令扫描你的源文件、提取 AST、调用 LLM（如果已配置），并为每个被跟踪的文件生成结构化摘要。

```bash
spine sync
```

**执行流程：**

1. 扫描器发现仓库中的所有源文件
2. 每个文件经过 AST 提取和摘要（如果配置了 LLM 则包含语义摘要，否则仅结构信息）
3. 摘要以结构化 JSON 形式写入 `.spine/index/`
4. 派生视图：agent 简报、架构图、风险热点等

**预期输出（截断）：**

```
Syncing .spine/ control plane for archspine...

Scanning source files... found XXX files
Resolving delta against manifest...
Files to process: XX (new), XX (changed), XX (unchanged)

[=====>              ] 25% -- src/cli/index.ts done
[==========>         ] 50% -- src/engines/check.ts done
[===============>    ] 75% -- src/services/sync-service.ts done
[====================] 100%

Sync complete.
  * XX new/changed files summarized
  * XX files unchanged (skipped)
  * Views derived: public-surface, risk-hotspots, architecture-diagram,
    project-health, agent-briefing, change-impact
```

首次同步如果配置了 LLM 可能需要几分钟。后续同步是**增量**的，只处理已更改的文件。

## 第六步：MCP（连接你的 Agent）

这是最后一步，也是最关键的一步。ArchSpine 是 **MCP 优先**的——控制平面专为 AI 助手通过模型上下文协议（Model Context Protocol）消费而设计。

```bash
spine mcp setup
```

该命令检测你的环境并写入正确的 MCP 配置，使 `archspine` 服务器可供你的 agent 使用。

**预期输出：**

```
ArchSpine MCP Setup
===================

Resolved command: npx --yes archspine@latest

Writing configurations...
  Claude Code (project): .mcp.json
  Claude Code (global): ~/.claude/mcp.json

Next steps:
  1. Restart your IDE or Claude Desktop for changes to take effect
  2. Verify the connection: look for "archspine" in the MCP server list
  3. Try an MCP tool: ask your agent "what modules are in this project?"
```

重启 agent 会话后，agent 将能够访问 **21 个 MCP 工具**、**4 个资源 URI** 和 **2 个提示词**——全部从控制平面读取，运行时无需额外的 LLM 调用。不再需要将整个源码树塞进提示词里。

如需更深入的 MCP 配置指南，请参阅[将 MCP 连接到你的 Agent](/zh-CN/how-to/mcp-connect)。

## 你现在拥有的成果

| 构件         | 位置                              | 用途                                                                 |
| ------------ | --------------------------------- | -------------------------------------------------------------------- |
| 控制平面配置 | `.spine/config.json`              | 你的设置（LLM 提供商、启用的视图）                                   |
| 架构规则     | `.spine/rules/*.yml`              | 人工编写的治理规则，agent 可以查询                                   |
| 语义索引     | `.spine/index/*.json`             | 每个文件的结构化摘要（每个源文件对应一个 JSON 文件）                 |
| 派生视图     | `.spine/view/data/*.json`         | 预计算：公开接口、风险热点、架构图、项目健康度、agent 简报、变更影响 |
| MCP 服务器   | 21 个工具 + 4 个资源 + 2 个提示词 | STDIO 服务器，完全只读，运行时零 LLM 延迟                            |

## 后续步骤

- **编写你的第一条规则** -- 使用[创建架构规则](/tutorials/first-rules)来在你的架构中强制层级边界
- **深入 MCP 集成** -- 在[将 MCP 连接到你的 Agent](/zh-CN/how-to/mcp-connect) 中了解手动设置、环境变量和故障排除
- **CI 集成** -- 通过[CI 集成](/how-to/ci-integration)在每个 PR 上运行 `spine check`
- **探索完整工具列表** -- 所有 21 个 MCP 工具的参考文档：[MCP 工具参考](/reference/mcp-tools)
