# ArchSpine 语义协议规范（v1.0.0）

本规范描述 ArchSpine 当前 `v1.0.x` 已经实现的行为：`.spine/` 目录模型、索引契约，以及运行时已经落地的机制。

## 1. 机器优先的设计

`.spine/` 首先是结构化语义对象，并为被纳入索引的仓库输入派生可读视图。目标是让 IDE、Agent、CI 和治理系统都能消费同一套仓库语义资产。

在当前开源主线中，默认语义镜像会刻意聚焦代码、schema、仓库自动化，以及 `.spine` 控制面本身。像 `docs/**`、`README*`、`CONTRIBUTING.md`、`SECURITY.md` 这类面向人的仓库文档，通常保留原始文件作为权威可读版本，默认不进入 `.spine` 镜像，除非仓库自行选择不同边界。

## 2. 物理结构

```text
.spine/
├── manifest.json       # 面向人的摘要视图
├── cache.db            # 核心 SQLite 状态库
├── index/              # 机器可读语义索引
│   └── src/
│       └── auth.ts.json
├── atlas/              # 派生 Markdown 文档层
│   └── en-US/
│       └── src/
│           └── auth.ts.md
├── view/               # 实验性的派生 JSON 阅读层（按开关启用）
│   ├── public-surface.json
│   └── risk-hotspots.json
└── rules/              # YAML 架构规则
```

当前版本的 protected outputs：

- `.spine/index/**`
- `.spine/atlas/**`
- `.spine/view/**`
- `.spine/cache.db*`
- `.spine/.lock`

ArchSpine CLI/runtime 是这些正式 `.spine` 产物的 authoritative writer。MCP 和普通本地 Agent 不属于正式 `.spine` writer。

当前版本中，`.spine/` 还可能包含一些本地运行态但不可分发的文件：

- `.spine/protected-output-baseline.json`

这些文件属于运行态操作状态，不属于语义快照输出。

一致性水位标记：

- 当非 full、非 hook 的增量 `spine sync` 在未刷新 Atlas Markdown 的情况下处理了一个或多个文件时，ArchSpine 会写入 `.spine/.stale`。
- `.spine/.stale` 表示面向人的文档落后于机器索引，需通过 `spine publish`（或 `spine build`）清除。

## 3. 核心运行机制

### 3.1 同步引擎

- `ScanPolicy` 负责文件来源和 ignore chain
- 路径统一归一为 repo-relative、POSIX 风格
- 状态更新通过 SQLite 流程原子提交
- `.gitignore`、`.spineignore`、`.spineignore.local` 按顺序组合
- 默认产品边界会保留代码、schema、以及 `.github/workflows/**` 这类仓库自动化可索引，同时通常把面向人的仓库文档排除在语义镜像之外
- 增量同步依赖 Git 与哈希感知变更
- 已删除源码会作为孤儿索引条目被清理

### 3.2 Skeleton-first 提取

- AST 提取提供确定性的 import/export 骨架
- 语义生成建立在骨架事实上，而不是替代骨架
- 最近的 Git intent 可以被注入，用于解释文件为何变动

### 3.2.1 双层语义短路机制（Dual-Layer Semantic Short-Circuiting）

- **L1（LLM 前）**：ArchSpine 对 AST import/export 结构计算 `skeletonHash`。若与上次一致，直接跳过该文件的 LLM summarize（0 token）。
- **L2（LLM 后）**：若 `skeletonHash` 变化，系统仍会基于 role/responsibilities/publicSurface 计算 `semanticHash`。当前该哈希用于决定该文件是否进入 summarize 阶段的 `affectedDirs`；后续目录级/项目级聚合仍可能因为 index 文档 mtime 判定父级产物已过期而重新执行。
- 该双层设计让 `sync` 在保证聚合语义正确性的同时，最大化速度与 token 效率。

### 3.3 分层聚合

- 文件层：角色、职责、不变量、依赖图
- 目录层：`folder.json` 和派生 `folder.md`
- 项目层：`project.json` 和派生 `project.md`

### 3.4 实验性 view 派生层

当 `artifacts.experimentalViewLayer=true` 或 `SPINE_EXPERIMENTAL_VIEW_LAYER=true` 时，post-aggregation writer path 还可以额外派生：

- `public-surface.json`
- `risk-hotspots.json`

这一层当前的定位是：

- 从索引和聚合信号派生出来
- 不属于权威真相源
- 主要服务快速理解
- 在首个开源 `v1.0` 中刻意不纳入稳定公共产物契约

### 3.5 writer path inventory 与边界契约

当前受信写路径：

- `spine sync`（默认）：以 `generationStrategy=json-only` 刷新本地机器运行态（`.spine/index/**`、`.spine/cache.db*`、`.spine/.lock`），并更新 protected-output baseline
- `spine build`：重型基线重建路径，可用于刷新 `.spine/atlas/**`
- 如果开启，同一条受信 `sync` writer path 也会写入 `.spine/view/**`
- `spine sync --hook`：刷新 hook 运行所需子集，并更新同一份 baseline，但不生成 Atlas
- `spine check` / `spine fix`：更新 `.spine/cache.db*` 这类本地运行态，并与 `.spine/.lock` 协同
- `spine publish`：维护者发布流，会先执行 publish preflight，再做一次轻量 sync 刷新 JSON 索引，然后在具备文本生成能力时通过 `DocumentBackfillTask` 尝试回填 `.spine/atlas/**`；如果启用实验 view 层，同一条流程也会刷新 `.spine/view/**`。它要求已有运行层基线（`.spine/manifest.json` 与 `.spine/protected-output-baseline.json`），并在 `.spine/.lock` 处于活动、已陈旧或 owner 不可验证时 fail-closed

当前宿主部署约定：

- 普通 Agent 在可写仓库中进行正常源码工作
- 受保护的 `.spine` 输出默认保持只读
- 如果开启，`.spine/view/**` 也遵循同样的 protected-output 边界
- `spine` 受信写路径会临时解锁这些输出并在写后回锁
- baseline 文件与 mutation warning 属于 soft gate，用来暴露越界写入，而不是强隔离的替代物
- 这一模型的目标是降低同权限正常工作流中的误写，不宣称阻止同权限恶意进程

### 3.6 MCP 语义观测面

ArchSpine 通过 STDIO 暴露 Model Context Protocol (../how-to/MCP) 服务，用于 AI 工具集成。

- **定位**：只读。MCP 面不提供 `.spine` 写接口，也不提供通用仓库写接口。
- **资源模型**：将 `.spine/` 目录结构映射为语义 URI (`spine://project`, `spine://folder/{path}`, `spine://file/{filePath}`)。
- **观测工具**：通过标准 tool schema 向 Agent 暴露运行时状态、同步新鲜度、架构不变量以及治理违规情况。
- **上下文门禁**：支持可选的门禁模式 (`project-first`, `search-first`)，用于为连接的 Agent 强制执行结构化的上下文获取模式。

## 4. 索引契约

每个被索引的文件会以 `SpineUnit` 形式写入 `.spine/index/<path>.json`。

关键切片：

1. identity：路径、哈希、语言、文件类型、scope
2. semantic：角色、职责、out-of-scope、不变量、public surface 以及 **localized content (多语言翻译)**。
3. skeleton：确定性的 AST 事实
4. graph：依赖边和相关结构
5. provenance：生成元数据

其他运行时信号：

- `ruleViolations`
- `driftDetected`
- `driftReason`
- `_thinking`: (仅限校验模式) 思维链 (CoT) 废稿区。

## 5. v0.4 的变化

相较于 v0.3，`v0.4` 引入了：

- **无头生成 (Headless Generation)**：从生成散文转向以数据为中心的 JSON 提取。
- **本地 Atlas 渲染**：基于 SpineUnit 数据在本地进行确定性的 Markdown 生成。
- **多语言索引**：`SpineSemantic` 支持 `localized` 字段以保存多语言语义摘要。
- **智能原语**：集成 Few-Shot 样例和思维链 (CoT) 以提升生成的专业度与准确率。
- 基于 `cache.db` 的 SQLite 状态存储
- 集中的 violations 和 usage logs
- `manifest.json` 从唯一真相源降级为摘要视图
- 协议与实现版本统一
- 语义漂移检测和持久化历史
- 更强的事务写入与锁处理

## 6. SQLite 表

当前核心表：

- `files`
- `violations`
- `usage_logs`
- `drift_events`
- `symbols`

## 7. 当前版本的运行特征

已发布的 `v1.0.x` 线路已经包含：

- 基于 task 的执行流程，并采用显式阶段输入/输出契约
- `TaskContext.state` 仅保留 telemetry，临时阶段产物放在 `runtimeCache`
- 串行任务编排与耗时日志
- 叠加在 SQLite 事务之上的文件锁
- 对 CLI 进度与健康状态的清晰暴露

## 8. Manifest 摘要视图

`manifest.json` 是面向人的摘要层，不是主真相源。当前版本中它会记录 sync 摘要，包括：

- sync mode 与 duration
- 聚合计数和 token usage 摘要
- 最近一次解析出来的 LLM provider/model 元数据

其中 sync 的 LLM 摘要包含：

- `provider`
- `providerSource`
- `model`
- `modelSource`

这组元数据用于运行时可追溯性，帮助用户知道当前 `.spine` 状态是由哪组解析后的模型配置生成的。
