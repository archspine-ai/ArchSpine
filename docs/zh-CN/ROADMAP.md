# ArchSpine 路线图

> 面向 AI 时代的 Git 原生架构智能——一个开放协议和工具链，在每个仓库中构建 `.spine/` 控制面。

## 已交付能力（v1.0.0）

### 核心管线

- **语义索引** — AST 提取 + LLM 摘要，为每个被追踪文件生成 `.spine/index/*.json`，包含角色、职责、不变量和依赖边。
- **双语文档** — 英文 + 简体中文语义描述在单次 LLM 调用中生成，markdown 输出可本地化。
- **增量/全量同步** — 基于文件变更检测和内容哈希缓存；全量重建会刷新整个控制面。
- **中断恢复** — 基于检查点的断点续传，长时间同步在网络故障后可以从断点恢复。

### 架构治理

- **规则引擎** — `.spine/rules/*.yml`（YAML）中基于 glob 的架构规则。规则定义分层边界、依赖约束和受保护输出目录。
- **自动检查** — `spine check` 对比规则验证代码库，输出带严重级别标注的违规。
- **受保护输出** — 标记为受保护的目录任何非授权写入都会被阻止，违规在同步摘要中展示。

### 知识图谱

- **模块级图** — `buildGraph()` 将每个文件的依赖边聚合为模块拓扑，包含 fanIn/fanOut/violationCount 指标，写入 `.spine/view/knowledge-graph.json`。

### 诊断引擎

- **循环依赖检测** — 基于 DFS 的环查找器，识别含完整路径链和环 ID 的循环依赖。
- **死代码启发式分析** — 零入度分析标记无入边模块，附置信度级别。
- **枢纽模块检测** — 基于 P95 百分位 fanIn 排名，标识架构瓶颈点。
- 所有诊断结果写入 `.spine/view/diagnostics/{cycles,dead-code,hubs}.json`。

### MCP 工具（21 个）

| 工具                            | 描述                                       |
| ------------------------------- | ------------------------------------------ |
| `spine_query_invariants`        | 按 ID 或文件查询架构不变量                 |
| `spine_query_responsibilities`  | 按角色/职责关键词搜索模块                  |
| `spine_match_semantic`          | 语义搜索：按关键词查找模块                 |
| `spine_query_graph`             | 按 from/to/type/compliant/layer 查询模块图 |
| `spine_get_module_context`      | 完整模块档案：依赖 + 违规 + 诊断           |
| `spine_get_file_context`        | 单个文件的完整治理上下文                   |
| `spine_get_change_impact`       | 给定文件的影响半径（BFS）                  |
| `spine_get_drift_history`       | 查看文件的语义漂移事件                     |
| `spine_get_sync_status`         | 检查控制面是否过期                         |
| `spine_get_baseline_status`     | 基线健康和发布就绪状态                     |
| `spine_get_violations_summary`  | 违规摘要                                   |
| `spine_get_diagnostics`         | 获取环/死代码/枢纽报告                     |
| `spine_get_config`              | 读取配置值                                 |
| `spine_get_view_data`           | 读取生成的视图数据（JSON）                 |
| `spine_list_resource_templates` | 列出可用的 `spine://` 资源                 |
| `spine_preview_scan`            | 预览将要索引的文件                         |
| `spine_run_scan`                | 直接从 MCP 触发扫描                        |
| `spine_run_sync`                | 直接从 MCP 触发增量同步                    |
| `spine_get_semantic_diff`       | 对比两个文件的架构层面差异                 |
| `spine_check_operation`         | 验证文件操作是否安全                       |

### 视图（6 个）

| 视图                 | 输出                                         | 描述                                            |
| -------------------- | -------------------------------------------- | ----------------------------------------------- |
| public-surface       | `.spine/view/public-surface.json`            | 公共 API 接口面：CLI、MCP、配置、路由、导出模块 |
| risk-hotspots        | `.spine/view/risk-hotspots.json`             | 带可加性评分因子的风险排名                      |
| architecture-diagram | `.spine/view/pages/architecture-diagram.svg` | 确定性分层 SVG 图，合规边标灰/违规边标红        |
| agent-briefing       | `.spine/view/pages/agent-briefing.md`        | AI Agent 的 6 段项目档案                        |
| project-health       | `.spine/view/pages/project-health.md`        | 5 段健康报告：拓扑、环、死代码、枢纽、违规      |
| SPINE.md             | `.spine/SPINE.md`                            | Agent 发现 `.spine/` 的入口自述文件             |

### Agent 分发

- **Claude Code Skill** — `spine skill install` 安装技能文件，引导 agent 读取 `.spine/` 并使用 MCP 工具。每天每仓库最多提醒一次。
- **Agent 指令注入** — `spine init` / `spine sync` 向 `AGENTS.md` / `CLAUDE.md` 注入 V2 briefing 块，仅在 `.spine/` 存在时激活。

### CI 集成

- GitHub Actions 模板（`.github/workflows/spine-sync.yml.example`）
- GitLab CI 模板（`.gitlab-ci.spine.yml.example`）

### 多语言 AST 支持

TypeScript、Go、Python、Rust、Java、C、C++、Ruby、PHP、Swift、Kotlin、Scala、Elixir（16 种语言）。

---

## 下一阶段

### Phase A：Agent 更智能的消费体验

- **Agent 工具推荐** — 教 skill 根据问题推荐正确的 MCP 工具（如"谁依赖了 X？"→ `spine_query_graph`）。
- **Monorepo 多 Agent Briefing** — 为 monorepo 的每个子包生成独立 briefing。
- **PR 工作流中的变更影响** — PR 创建时自动运行 `spine_get_change_impact`，让 review 者在读代码之前看到影响面。

### Phase B：Code Wiki

Qoder 替代品，每个模块一个 wiki 页面：

- 模块概述（角色/职责/约束）
- 合规仪表盘（活跃违规、严重程度、历史趋势）
- 依赖关系图（违规边高亮标注）
- 公共 API 契约（签名、schema、错误模式）
- 变更历史和漂移事件

**与 Qoder 的区别**：ArchSpine wiki 是 git 原生的，每次 sync 自动刷新，中英双语，且与架构规则交叉引用——无需单独 app、无需手动维护。

### Phase C：可插拔 Producer SDK

- 稳定的 `ViewProducer` 接口，标准输入/输出契约
- `spine view create <name>` 脚手架命令
- 社区 producer 注册表（基于 git repo 而非网站）
- 通过 npm 包或单文件脚本分发 producer

### Phase D：决策智能

- **变更影响视图** — 按需触发："改这个文件会影响什么？"完整传递依赖树 + 受影响的测试 + 规则。
- **模块契约提取** — 每个模块的 API 契约：函数签名、类型接口、I/O schema、错误处理模式。
- **语义搜索索引** — 跨所有索引语义的结构化搜索："哪个模块处理认证？"不依赖全文搜索。

---

## 我们不做的事情

- **不做 SaaS 平台** — Git 即分发渠道，`.spine/` 就是文件。
- **不做私有模型** — 做数据层，不做模型层。任何 LLM 提供商都能对接。
- **不做实时同步** — 跟随 `spine sync` 节奏即可。Commit → sync → push。
- **不支持非 git 仓库** — 控制面本身在仓库里；无 git 即无分发。
