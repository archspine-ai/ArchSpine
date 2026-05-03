# ArchSpine

<p align="center">
  <img src="./docs/public/readme-hero-zh.png" alt="ArchSpine README 头图" width="100%" />
</p>
<p align="center">
  <a href="./README.md">English</a> | 简体中文
</p>
<p align="center">
  <img alt="npm version" src="https://img.shields.io/npm/v/archspine?color=0f766e&label=npm" />
  <img alt="mcp ready" src="https://img.shields.io/badge/MCP-ready-0ea5e9" />
  <img alt="license" src="https://img.shields.io/badge/license-Apache%202.0-1f2937" />
</p>

ArchSpine 是一个开源协议与工具链，在 Git 仓库中生成实体的 `.spine/` 结构化控制面——通过最直接的**本地文件访问**为 AI 编程助手提供稳定、可压缩、可约束的架构上下文。

它的核心思路不是"给仓库再加一堆文档"，而是把代码库变成一个 AI 可查询、可约束、可审计的工程系统：

- `本地优先（Local-First）`：Agent 在工作区内最快、最直接地读取本地控制面，零额外集成门槛。
- `Deterministic context`：为 Agent 提供稳定、可压缩的架构上下文，而不是整仓盲塞。
- `Architecture guardrails`：用 `.spine/rules/` 声明红线，并用静态分析检查违规依赖。

## AI 编程的技术债危机

AI 写代码越来越快，但一个隐性问题正在蔓延——**不可见的技术债**。

当你放任 Agent "先跑，再审"，它会跨层调用、乱造接口、打破模块边界。这些破坏不一定是 bug，它们是架构层面的漂移：单次看起来无害，累积起来就让代码库不可持续。根源不在于 AI 不够聪明，而在于 **Agent 缺少稳定的架构上下文**——它不知道每个模块的职责边界在哪，也不清楚哪些依赖是禁止的。

传统的解决方案（AGENT.md、项目说明文件、RAG）能缓解问题，但它们是"建议"，不是"控制面"。Agent 读了之后仍然可以忽略。

ArchSpine 的回答是：**在本地建立一套实体的语义基线（Semantic Baseline）**。不是一份说明文档，而是一个结构化的、机器可验证的控制面。Agent 在动手之前能读职责边界和红线规则；人类在合并之前能审计架构漂移；整个仓库的语义状态被持续追踪和版本化。

## 我为什么要做 ArchSpine

**作为学生，想理解代码库**：我学了八年编程，一直想彻底看懂代码库——AI 让它成为现实。但在 ArchSpine 之前，我只能手动复制获取解析，时常丢失上下文。于是我开始思考：能不能一次性获得全景性的语义？

**作为 vibe coder，想掌控 vibe 代码**：2025 年我用 vibe coding 开发游戏，第一次放任 Agent "先跑，再审"。我逐渐无法掌控代码库的"增殖"。我开始思考：能不能和 Agent 一起，共同阅读一个记录语义变更的可控文件夹？

**作为 coding agent**（这段话由 GPT5.5 Pro 写！）：面对庞大的陌生仓库，我要去哪找依赖？该不该修改底层库？这以前全靠瞎猜。有了 ArchSpine，我直接拉取本地 `.spine/` 控制面——稳定的全局视野、模块边界、底线约束。我不容易跑偏，也能更准确地理解人类意图。

**作为不懂编程的项目经理，想跟踪进度（这段话是 mock 的！）**：我不用看懂代码逻辑，但我能看懂 `.spine/` 生成的架构与职责映射！通过定期的 `spine status` 和 `spine history` 审计，只要检查出 0 违规，且核心职责没有偏离，我就知道架构依然健康——我可以用这套实体产物来验证团队是否在正确前行。

## 三大核心机制：从基线到治理

ArchSpine 的工程协同能力建立在三个递进的机制上，它们共同构成了闭环的技术债治理体系：

- **语义基线（Baseline）— 债的盘点**：梳理代码库当前的真实架构边界与模块职责，建立全仓上下文基准。基线就是真相：先搞清楚代码长什么样、模块边界在哪，才能谈治理。
- **语义变更追踪 — 债的预警**：不仅追踪行级 Diff，更持续追踪架构结构和模块维度的语义漂移。每一次 sync 都是一次健康打卡——哪个模块在膨胀？哪条依赖跨越了本不该跨越的边界？
- **语义审查（Audit）— 债的拦截**：在 AI 修改代码或触发合并时，结合 `.spine/rules/` 中声明的红线规则对越界行为进行自动拦截与审查。检查通过才能合入，不合规的变更自动被挡在门外。

这样 Agent 面对的就不再是一堆离散源码和一份"请尽量遵守"的说明，而是一个具备严格上下文和明确约束的工程系统。

## 工作流：build → sync → publish

三个核心命令覆盖了从初次建立基线到日常维护的完整周期：

<p align="center">
  <img src="./docs/public/spine-build.gif" alt="ArchSpine 构建演示" width="100%" />
</p>

| 命令            | 定位           | 何时使用                                    | 输出                                                |
| --------------- | -------------- | ------------------------------------------- | --------------------------------------------------- |
| `spine build`   | 全量基线重建   | 首次初始化、`.spine/` 损坏、故障范围过大时  | `.spine/index/**` + baseline + cache                |
| `spine sync`    | 日常增量刷新   | 每天开发中的高频操作，快速更新索引          | `.spine/index/**` 增量更新（默认不生成 Atlas 文档） |
| `spine publish` | 发布前文档生成 | 版本发布/合并窗口前，生成人类可读的架构文档 | `.spine/atlas/**` Markdown 文档 + view 产物         |

决策树：

| 症状                                           | 命令                             |
| ---------------------------------------------- | -------------------------------- |
| 刚执行完 `spine init`，还没有语义镜像          | `spine build`                    |
| Atlas 文档过时/缺失，但 `.spine/index/**` 存在 | `spine publish`                  |
| 部分文件同步失败                               | `spine sync --retry-failed`      |
| 受保护产物被外部编辑                           | `spine sync --repair-violations` |
| 运行时基线不完整/损坏                          | `spine build`（全量重建）        |

**边界模型**：`sync` 面向机器（快速 JSON 刷新），`publish` 面向人（Atlas Markdown 回填），`build` 仅用于初始化和恢复。三者定位清晰，互不替代。

## 心智模型

下面这张图说明 ArchSpine 在 AI 协作栈中的位置：它不是通用聊天记忆，也不是单纯的项目说明，而是更靠近"结构化代码库表达"和"工程工作流"的那一层。

<p align="center">
  <img src="./docs/public/ai-collab-codebase-understanding-layered-map-cn.svg" alt="AI 协作中的代码库理解分层图" width="100%" />
</p>
<p align="center">
  <sub>ArchSpine 更接近结构化代码库表达层：把规则、职责、索引和上下文压缩成可查询、可治理的工程控制面。</sub>
</p>

## 自举与实测

ArchSpine 仓库已实现自举——用 ArchSpine 管理 ArchSpine 自身的架构语义。

当前仓库 `src/` 目录代码规模约 200+ 文件、2 万+ 行。运行全仓重建指令 `spine build`，同时生成英文和简体中文两套架构文档，全程耗时约 `7.5` 分钟，消耗约 `1489` 万 Input Token 和 `247` 万 Output Token（以 DeepSeek 计费约 `1.22` 元人民币）。这笔带来长效架构安全的语义投资，背后是深思熟虑的架构设计与极端的边界性能优化。

运行表现可直接查看本仓库的 `.spine/atlas/`（结构镜像）和 `.spine/view/`（宏观总结）。

## 推荐采用模式

在当前 `v1.0.x` 阶段，效果最好的路径是**本地优先、最快生效**：直接在工作区运行 `try` → `init` → `build` → `check` → `fix`。`.spine/` 是你本地的实体资产，Agent 像读取其他代码文件一样直接读取这些上下文——这是效率最高、零额外配置的方式。

MCP 作为平滑的协议扩展层并存，面向需要标准化访问的复杂生态客户端。

## 30-Second Quick Start

```bash
npx --yes archspine@latest try
npx --yes archspine@latest init
npx --yes archspine@latest build
npx --yes archspine@latest check
```

- `Node.js >= 20`（推荐当前 LTS）
- `spine init` 只初始化配置，首次构建语义镜像需执行 `spine build`
- `spine init` 支持选择 Git 产物策略：`local`（运行态不入库）和 `distributable`（生成快照入库，在 `.gitattributes` 中标记为 generated）。非交互场景可直接 `spine init --artifact-strategy distributable`
- 如需 `sync / check / fix` 的完整语义能力，请在 `spine init` 后执行 `spine llm setup`

## God Mode

`spine god` 一键生成全仓语义档案 `.spine/<repo-name>-god.md`——将整个代码库的语义状态压缩为单个 Markdown 文件，包含项目概要、目录清单、每文件职责/依赖/公开接口/漂移状态。人类专用，适合快速检视、Demo、实验。非生产路径，数据源自当前 `.spine/index/` 状态，每次运行覆盖前次输出。

## MCP Integration

ArchSpine 可将 `.spine` 控制面通过 STDIO MCP 服务暴露给 AI 客户端（只读语义面，不负责写入 `.spine` 正式产物）：

```bash
spine mcp start
```

**Claude Desktop**：在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "archspine": {
      "command": "node",
      "args": ["/absolute/path/to/archspine/dist/cli/index.js", "mcp", "start"]
    }
  }
}
```

**Claude Code / CLI**：

```bash
claude mcp add archspine node /absolute/path/to/archspine/dist/cli/index.js mcp start
```

**Cursor**：在 `Settings -> Features -> MCP` 中添加 `stdio` server，command 和 args 同上。

MCP 模式下可读取 `spine://project`、`spine://folder/{path}`、`spine://file/{filePath}`，以及调用 `spine_query_invariants`、`spine_query_responsibilities`、`spine_preview_scan`、`spine_get_drift_history` 等关键能力。完整说明见 [docs/zh-CN/how-to/MCP.md](./docs/zh-CN/how-to/MCP.md)。

## CLI 命令速览

所有命令按功能分组，完整运行说明见 [运行手册](./docs/zh-CN/guides/RUNBOOK.md)。

**配置**

| 命令                                    | 说明                                                    |
| --------------------------------------- | ------------------------------------------------------- |
| `spine try`                             | 只读预览仓库的 ArchSpine 状态（零安装、不修改任何文件） |
| `spine init`                            | 初始化 `.spine/` 目录、配置、规则模板与 Hook            |
| `spine init --artifact-strategy <mode>` | 指定 Git 产物策略（`local` 或 `distributable`）         |
| `spine remove`                          | 移除 `.spine/` 及所有托管配置                           |
| `spine remove --yes`                    | 跳过确认直接移除                                        |
| `spine llm setup`                       | 配置 LLM 提供商                                         |
| `spine languages show`                  | 查看当前语言配置                                        |
| `spine languages set`                   | 设置输出语言                                            |
| `spine repo check`                      | 检测配置与托管 Git 文件之间的漂移                       |
| `spine repo strategy set <mode>`        | 迁移产物策略（`local` ↔ `distributable`）               |

**构建与同步**

| 命令                             | 说明                                     |
| -------------------------------- | ---------------------------------------- |
| `spine build`                    | 全量基线重建（首次初始化 / 恢复）        |
| `spine sync`                     | 日常增量刷新（机器优先，JSON 索引）      |
| `spine sync --hook`              | 轻量 Hook 模式（pre-commit 用）          |
| `spine sync --retry-failed`      | 重试上次失败的同步项                     |
| `spine sync --repair-violations` | 修复被外部编辑的受保护产物               |
| `spine publish`                  | 发布前生成人类可读的 Atlas Markdown 文档 |

**审查与修复**

| 命令                   | 说明                                        |
| ---------------------- | ------------------------------------------- |
| `spine check`          | 基于 `.spine/rules/` 的红线规则进行违规检查 |
| `spine fix`            | 读取违规项，提出修复方案并确认写入          |
| `spine scan --dry-run` | 预扫描（不实际写入）                        |

**信息**

| 命令                   | 说明                       |
| ---------------------- | -------------------------- |
| `spine status`         | 查看当前语义基线状态       |
| `spine info`           | 查看仓库配置与统计信息     |
| `spine usage`          | 查看 Token 消耗与成本统计  |
| `spine history <file>` | 查看指定文件的语义变更历史 |

**Hook 管理**

| 命令                        | 说明                     |
| --------------------------- | ------------------------ |
| `spine hook on`             | 安装托管 pre-commit Hook |
| `spine hook off`            | 卸载托管 pre-commit Hook |
| `spine hook set-mode heavy` | 设置 Hook 为 heavy 模式  |

**MCP**

| 命令              | 说明                |
| ----------------- | ------------------- |
| `spine mcp start` | 启动 MCP STDIO 服务 |

**实验性**

| 命令         | 说明                                |
| ------------ | ----------------------------------- |
| `spine god`  | 生成全仓语义档案（单文件 Markdown） |
| `spine view` | 预览架构和风险诊断视图              |

## Docs

- [中文文档首页](./docs/zh-CN/index.md)
- [English Docs Home](./docs/index.md)
- [快速开始](./docs/zh-CN/tutorials/quick-start.md)
- [运行手册](./docs/zh-CN/how-to/RUNBOOK.md)
- [God Mode 指南](./docs/zh-CN/explanation/GOD-MODE.md)
- [MCP 集成](./docs/zh-CN/how-to/MCP.md)
- [Demo 演示](./docs/zh-CN/tutorials/DEMO.md)
- [协议规范 v1.0.0](./docs/zh-CN/reference/PROTOCOL.md)
- [文档清单](./docs/README.md)
- [Powered by ArchSpine](./docs/zh-CN/explanation/POWERED-BY.md)

## 社区

[![Discord](https://img.shields.io/discord/1310167660993085481?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/RjfSVKfRzH)
[![QQ 群](https://img.shields.io/badge/QQ%20%E7%BE%A4-1098273420-12b7f5?logo=tencent-qq&logoColor=white)](https://jq.qq.com/?_wv=1027&k=RjfSVKfRzH)

## 支持与安全

- 使用问题与文档缺口：见 [SUPPORT.md](./SUPPORT.md)
- 安全漏洞：请按 [SECURITY.md](./SECURITY.md) 私下报告
- 社区协作预期：见 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## Contributing

修改运行时、规则协议或文档结构前，请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。参与贡献默认遵守 [Code of Conduct](./CODE_OF_CONDUCT.md)。

## License

本项目基于 [Apache License 2.0](./LICENSE) 开源。

---

## 💖 支持 ArchSpine

ArchSpine 是一个由小团队维护的开源项目。如果这个工具帮您节省了 Token 成本，或者让您的 AI 协作变得更加顺滑，请考虑赞助我们的工作。

[**通过 GitHub Sponsors 赞助我们**](https://github.com/sponsors/archspine-ai)
