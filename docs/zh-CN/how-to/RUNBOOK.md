# ArchSpine 操作手册

本手册描述当前 `v1.0.x` CLI 与协议行为，目标是帮助你按照已经实现的方式运行 `.spine/` 控制面，而不是跟随未来路线图。

## 第一天：快速开始

ArchSpine 会在仓库中构建 `.spine/` 控制面。在 `v1.0` 中，`spine sync` 走机器优先路径：默认使用 `json-only` 策略快速刷新 `.spine/index/`；面向人的 `.spine/atlas/` Markdown 刷新由 `spine publish` 负责。开启后仍可在 `.spine/view/` 下生成实验性 JSON 阅读视图。

Writer Boundary（v1.0 最小边界）：

- ArchSpine CLI/runtime 是 `.spine` 正式产物的 authoritative writer。
- MCP 只提供只读语义面，不承担 `.spine` 写入。
- 本地 IDE/CLI Agent 默认是建议来源（suggestion source），不是 `.spine` writer。

当前版本的正式 writer path：

- `spine sync`（默认增量）：以 `generationStrategy=json-only` 刷新机器运行层（`.spine/index/**`、`.spine/cache.db*`、`.spine/.lock`）；不会在该路径重建 Atlas Markdown
- `spine build`：重型基线构建路径，用于首次初始化、恢复以及受信任的 `.spine` 全量重建
- 当实验性 view 输出开启时，同一条 `sync` writer path 也会写入 `.spine/view/public-surface.json` 与 `.spine/view/risk-hotspots.json`
- `spine sync --hook`：写入 hook 场景所需运行层子集（`.spine/index/**`、`.spine/cache.db*`、`.spine/.lock`），并刷新同一份 baseline，但不生成 Atlas
- `spine check` / `spine fix`：仍属于受信写路径，但只写 `.spine/cache.db*`、`.spine/.lock` 这类本地运行态
- `spine publish`：维护者发布流入口，会先过 publish preflight，再做一次轻量 sync 刷新 JSON 索引，然后在具备文本生成能力时通过 `DocumentBackfillTask` 尝试回填 `.spine/atlas/**`；如果启用了实验 view 层，同一条 publish 流也会刷新 `.spine/view/**`。它不是另一套独立 writer 栈，且要求已有 `.spine` 运行层基线（`manifest.json` + `protected-output-baseline.json`），并在 `.spine/.lock` 存在、已陈旧或 owner 不可验证时都 fail-closed

### 初始化仓库

```bash
spine init
```

交互式初始化时建议：

- 选择你想生成的文档语言
- 如果仓库希望把语义快照作为共享资产，请选择 `Distributable snapshot`
- 安装推荐规则模板
- 如果希望 commit 时自动同步，则开启 Git hook

语言说明：

- ArchSpine 会把稳定性更高的文档语言放在默认列表前部，并在交互式选择器里用可见分隔线区分对模型能力要求更高的多语输出
- 法语、德语、巴西葡语、越南语、俄语等语言仍然属于正式支持范围，但生成质量更依赖所选模型
- 当前策略是“允许选择，但明确提醒”，而不是硬性拦截；如果结果不理想，用户应自行检查输出并切换到更强的多语模型

`spine init` 只负责准备配置、规则模板、hook 偏好和语言快照；并可选把 ArchSpine 的 Agent 协作说明注入到一个仓库说明文件中，向 `package.json` 注入最小 `spine:*` 工作流脚本，并准备一个很小的搜索忽略文件，避免默认工作区搜索被生成态 `.spine` 结果淹没。它不会自动执行首次 build。

`init` 还会选择一套 Git 产物策略：

- `local`：默认把本地运行态和生成语义快照都排除在 Git 之外
- `distributable`：只排除本地运行态，并在 `.gitattributes` 中把生成态 `.spine` 快照标为 generated

如果后续需要切换仓库策略，当前受支持的过渡期路径仍是重新执行 `spine init --artifact-strategy <mode>`。

如果你在非交互场景中初始化，可直接指定：

```bash
spine init --artifact-strategy distributable
```

如果后续需要切换仓库策略，当前受支持的过渡期路径仍是重新执行 `spine init --artifact-strategy <mode>`。

如果你想在初始化时直接指定说明文件名，可使用：

```bash
spine init --agent-file AGENTS.md
```

常见文件名包括 `AGENTS.md`、`CLAUDE.md`、`GEMINI.md`。这只是一次性的初始化辅助能力，不是安全边界。

注入后的说明文件应把本地 Agent 引导到“优先 MCP，再读控制面”，而不是直接广泛搜索生成态 `.spine/index/**` 与 `.spine/atlas/**`。

当前版本的默认语义镜像边界：

- 把代码、schema、`.github/workflows/**` 与 `.spine` 控制面文件作为主要语义输入
- 像 `docs/**`、`README*`、`CONTRIBUTING.md`、`SECURITY.md`、`SUPPORT.md`、`CODE_OF_CONDUCT.md` 这类面向人的仓库文档，默认保留原位作为权威可读版本，不进入默认 `.spine` 镜像，除非仓库自行改边界

### 从仓库中移除 ArchSpine

```bash
spine remove
```

`spine remove` 会删除本地 `.spine/` 目录，从 `.git/hooks/pre-commit` 中移除 ArchSpine 管理的那一段 hook，并回滚仍保持 ArchSpine 托管默认值的宿主集成内容，例如注入的 agent-instructions block、生成的 `.ignore` 条目、托管的 `.gitignore` / `.gitattributes` block，以及默认 `spine:*` scripts。它不会改动 hook 文件中不属于 ArchSpine 的其它逻辑，也不会误删已经偏离托管默认值的用户自有内容。
如果你在非交互场景中执行，可使用 `spine remove --yes` 跳过确认提示。

### 构建首个语义镜像

```bash
spine build
```

后续日常使用增量同步：

```bash
spine sync
```

当前 sync 报告口径：

- CLI summary 会打印本次 sync 实际使用的 LLM provider 与 model
- `.spine/manifest.json` 会持久化最近一次解析出来的 provider/model 及其来源
- 这些信息用于运行时可追溯性，不是执行锁，也不是策略边界
- 如果普通增量 `sync` 在未刷新 Atlas 的情况下处理了一个或多个文件，ArchSpine 会写入 `.spine/.stale` 一致性水位标记
- 一旦出现 `.spine/.stale`，维护者在提交可分发文档前应执行 `spine publish`

如果最近一次 sync checkpoint 里存在文件级失败，而你希望定点重跑而不是直接 full rebuild，可以执行：

```bash
spine sync --retry-failed
```

当前 retry-failed 口径：

- 只会重跑最近一次 `.spine/runtime/checkpoints/sync.json` 中 `summarization` 和 `state-commit` 失败的文件
- 不会从 atlas 缺口、manifest 状态或控制台日志里反推候选文件
- 它与 `publish` 刻意分开：retry-failed 负责修复 sync 流水线失败，publish 负责基于已有 index 基线回填 atlas markdown
- 不能与 `--hook` 或 `--repair-violations` 组合使用

恢复路径速查：

- Atlas 文档缺失或过期，但 `.spine/index/**` 已经存在：执行 `spine publish`
- sync 流水线只在少量文件上失败，并且你希望定点重跑：执行 `spine sync --retry-failed`
- 受保护生成产物在受信写路径之外被修改，并且你希望显式修复：执行 `spine sync --repair-violations`
- 运行态基线不完整、已损坏，或者失败范围已经大到不适合做定点修复：执行 `spine build`

如果某些受保护生成产物在受信写路径之外被修改，而你希望 ArchSpine 显式修复它们，可以执行：

```bash
spine sync --repair-violations
```

当前 repair 口径：

- 普通 `spine sync` 仍然只负责报告 protected output violation，不会默认覆盖现场
- `--repair-violations` 才是显式恢复入口
- 如果 violation 能安全映射回一小组源码，ArchSpine 会优先做 targeted repair
- 如果 policy 判断破坏范围更大或存在结构性风险，则会升级为要求 full rebuild，而不是静默吞掉现场

如果你想开启实验性的阅读视图层，可在执行 `sync` 前通过项目配置或环境变量打开：

```bash
spine config set artifacts.experimentalViewLayer true
spine sync
```

或者：

```bash
SPINE_EXPERIMENTAL_VIEW_LAYER=true spine sync
```

当前实验性 view 输出包括：

- `.spine/view/public-surface.json`
- `.spine/view/risk-hotspots.json`

这些输出是派生层、非权威层，并且在首个开源 `v1.0` 中不属于稳定产物承诺。

如果要刷新仓库分发快照（维护者发布流）：

```bash
spine publish
```

当前边界模型：

- `sync` 负责更新本地运行层 `.spine` 状态，默认是快速、机器优先的 JSON 刷新。
- `publish` 负责刷新仓库分发层快照，目标是 `.spine/index/**`、`.spine/atlas/**`，以及在启用时的 `.spine/view/**`。
- `publish` 是面向人类文档的正式刷新边界：先轻量 sync，再在具备文本生成能力时尝试回填 Atlas Markdown。
- 在进入 atlas 写入摘要前，已经不再配置的 `.spine/atlas/<locale>/` 目录会被自动清理。
- 如果请求了 markdown 输出，但模型对所有目标语言都没有返回 markdown block，对应文件会被标记为 failed，而不是被视为部分成功。
- 默认分发快照的主价值面是代码、schema、仓库自动化和 `.spine` 控制面语义，而不是再次镜像面向人的仓库文档
- `publish` 会先执行前置校验（必须已有运行层基线，且运行锁需已清空）。
- 如果 `.spine/.lock` 存在，publish 对活动锁、陈旧锁、owner 不可验证锁都会 fail-closed；只有在确认没有 ArchSpine 进程仍在运行后，才应手动清锁。
- `.spine/.lock` 只承担本机运行互斥，不承担 Git 语义。
- 默认建议：日常开发持续执行 `spine sync`，在合并窗口或发版前、且需要提交分发文档时执行 `spine publish`。

Publish 排障速查（维护者）：

- `[PUBLISH_RUNTIME_MISSING]`：`.spine/` 还不存在。先执行 `spine init`，再执行 `spine build`，然后重试 `spine publish`。
- `[PUBLISH_RUNTIME_BASELINE_INCOMPLETE]`：运行层基线不完整。先用 `spine build` 重建基线，再发布。
- `[PUBLISH_LOCK_ACTIVE]`：`.spine/.lock` 处于活动、已陈旧或 owner 不可验证状态。先确认没有 ArchSpine 进程仍在运行，再决定清锁或重建运行态。
- `[PUBLISH_SNAPSHOT_INCOMPLETE]`：publish 已执行，但分发快照仍不完整。重新执行 `spine build`，然后重试 `spine publish`。

运行时与 MCP 排障速查（维护者）：

- `[RUNTIME_LOCK_ACTIVE]`：另一个 ArchSpine 进程正在持有 `.spine/.lock`。等待该进程结束后，再重试 `spine sync`、`spine check` 或 `spine fix`。
- `[RUNTIME_LOCK_OWNER_UNVERIFIABLE]`：当前宿主上无法验证 lock owner。先确认没有 ArchSpine 进程仍在运行，再决定是否清除 `.spine/.lock`。
- `[RUNTIME_LOCK_CORRUPT]`：`.spine/.lock` 内容损坏。先确认没有 ArchSpine 进程仍在运行，再删除该锁；必要时重建运行态。
- `[RUNTIME_DB_OPEN_FAILED]` / `[RUNTIME_DB_INIT_FAILED]`：本地 SQLite 运行态无法打开或初始化。执行 `spine build` 重建。
- `[RUNTIME_DB_READONLY]`：本地 SQLite 运行态处于只读状态。使用 ArchSpine 受信写路径，或先修复本地 `.spine` 权限后再重试。
- `[MCP_RUNTIME_MISSING]`：MCP 试图读取一个还没有 `.spine` 运行态的仓库。先执行 `spine init` 和 `spine build`。
- `[MCP_RUNTIME_BASELINE_INCOMPLETE]`：MCP tool 调用要求运行层基线已同步完成。先执行 `spine build`，再重试查询。
- `[MCP_RESOURCE_INVALID_CONTENT]` / `[MCP_TOOL_INDEX_INVALID_CONTENT]`：`.spine/index/**` 内容存在但已损坏。先执行 `spine build` 重建运行层镜像。
- `[MCP_READ_FAILED]`：MCP 读取资源失败（例如 `spine://project`）。
- `[MCP_TOOL_EXECUTION_FAILED]`：MCP tool 执行失败。
- `[MCP_TOOL_UNKNOWN]`：请求的 MCP tool 未知。

Protected output violation 排障补充：

- 当前告警会更准确地描述“受保护生成产物被越界修改”，而不是使用过宽的 external-mutation 语义
- `.spine/.lock`、`.spine/cache.db*` 这类运行态文件虽然属于受保护运行状态，但不参与生成产物 violation 判定
- 只有在你明确要修复受保护生成产物时，才使用 `spine sync --repair-violations`
- 如果 repair 不能被安全收敛，按 CLI 提示执行 `spine build`

宿主部署约定（当前最小契约）：

- 普通 Agent 可以工作在可写仓库中，负责正常源码改动
- `.spine/index/**`、`.spine/atlas/**`、`.spine/cache.db*`、`.spine/.lock` 默认应保持只读
- 如果开启，`.spine/view/**` 也由同一条受信 writer path 写入，并应视作受保护生成产物
- `spine` 受信写路径会在写入前临时解锁这些 protected outputs，写完后立即回锁
- 这是一条依赖宿主协助的安全边界，用于降低同权限正常开发流中的误写，不宣称防御同权限恶意进程
- 应把这条边界理解为协作契约和运行时安全机制，而不是对同权限工具的强制宿主级隔离

### 配置 LLM Provider

`sync`、`check`、`fix` 要完整工作，需要提供模型：

```bash
spine llm setup
```

`spine init` 首次初始化时也可以直接采集这组配置。

常用管理命令：

```bash
spine llm show
spine llm show --verbose
spine llm set provider openai
spine llm set api-key sk-xxxx
spine llm set model gpt-4o-mini
spine llm set base-url https://openrouter.ai/api/v1
spine llm set mode standard
spine llm set mode heavy
spine llm clear api-key
```

当前建议：

- 主控制面使用 `mode`
  `standard` 适合日常生成整个 `.spine`
  `heavy` 更慢、更贵，但更稳健，适合高置信度生成与检查
- 兼容性覆盖项不要放进默认路径，只有在你明确调试运行时行为时才使用

Review 指引：

- `.spine/index/**` 与 `.spine/atlas/**` 属于生成型语义产物，在 GitHub review 中会按 generated files 处理
- ArchSpine 将 `.spine/index/**`、`.spine/atlas/**`、`.spine/view/**`、`.spine/cache.db*`、`.spine/.lock` 视为 protected outputs
- `sync` 这类受信写路径会在写入窗口临时解锁 protected outputs，结束后回锁
- `.spine/config.json` 与 `.spine/rules/**` 仍然是正常 review 目标，因为它们属于控制面
- `status`、`check`、`fix`、`info` 如果发现这些生成型 protected outputs 在最近一次 ArchSpine 正式写入之后又被改动，会打印告警
- direct-edit detection 只是生成产物漂移告警，不是完整的 proposal / review gate

开源 CI 与测试分层：

- 默认公开 CI gate 有意只覆盖产品面，当前运行 `npm run test:unit`、`npm run validate`、`npm run docs:build`、`npm run pack:check`
- prompt-policy、benchmark、corpus 这类 research-only 覆盖位于 `research/bench/**`，默认不进入公开 PR gate
- 当维护者需要显式复跑 corpus、comparison、strategy harness 时，使用 `npm run test:research`
- 仓库同时提供单独的手动 GitHub Actions 工作流 `Research Bench` 来承载这套 research-only 测试，避免公开贡献者被内部策略评测阻塞

soft gate 保留指引：

- 当前版本必须保留 protected outputs 默认只读、受信写路径临时解锁/回锁，以及 MCP 默认只读这些硬边界
- protected-output baseline 与 external-mutation warning layer 目前也应保留，直到宿主侧存在更强、可验证的写入中介
- 不能因为 protected outputs 已加锁，就把 warning layer 视为可删；它当前仍负责把越界写入显式暴露出来

如果只是临时覆盖，也仍然可以使用环境变量；环境变量会优先于持久化配置。
如果你要接本地模型，请看 [本地 LLM 指南](../how-to/LOCAL-LLM)。

只有在你需要排查当前 `mode` 在运行时如何展开时，才使用 `spine llm show --verbose` 或 `spine info --verbose`。

### 命令依赖矩阵

需要 LLM 才能完整生效：

- `spine sync`
- `spine publish`
- `spine check`
- `spine fix`

只依赖本地 `.spine` 或仓库状态：

- `spine status`
- `spine scan --dry-run`
- `spine hook on|off`
- `spine config get|set`
- `spine languages show|set`
- `spine usage`
- `spine info`
- `spine remove`
- `spine mcp start`

## 架构治理

### 运行审计

```bash
spine check
```

如果规则被违反，ArchSpine 会把违规写入本地状态，并打印受影响文件和规则信息。

兼容性覆盖仍然存在，用于内部调试和迁移支持，但它们刻意不放进正常用户配置路径。

### 查看交互式修复

```bash
spine fix
```

`fix` 会从 `check` 使用的本地 manifest-backed 状态中读取 active violations，生成补丁建议，并在写回前要求确认。

### 维护规则

当前规则文件建议放在 `.spine/rules/` 下，使用 YAML：

```yaml
version: 1
rules:
  - ruleId: layer-isolation
    title: API must not import Infra directly
    appliesTo:
      - src/api/**
    severity: error
    summary: API files must depend on services or ports, not infra implementations.
```

## 与 AI 协作

### 启动 MCP 服务

```bash
spine mcp start
```

当前 MCP 面包括：

- 只读语义能力（不提供 `.spine` 写接口，也不提供 repo 文件写接口）
- 对普通 Agent 工作流，优先 MCP 读取和控制面文件，而不是广泛搜索生成态 `.spine/index/**` 与 `.spine/atlas/**`

- 列出的 resource：`spine://project`
- 可读取的 URI 模式：`spine://folder/{path}`、`spine://file/{filePath}`
- tools：
  - `spine_query_invariants`
  - `spine_query_responsibilities`
  - `spine_preview_scan`
  - `spine_get_drift_history`
  - `spine_get_sync_status`
  - `spine_get_baseline_status`
  - `spine_get_violations_summary`
  - `spine_list_resource_templates`

### 可选上下文门禁

如果你希望 Agent 先按固定顺序读取上下文：

```bash
spine config set mcp.contextMode project-first
```

支持的值：

- `off`
- `project-first`
- `search-first`

## 自动化与效率

### Git Hook 开关

- 关闭并移除 ArchSpine 管理的 hook 段：`spine hook off`
- 安装或刷新 ArchSpine 管理的 hook 段并启用：`spine hook on`
- 调整 hook 同步策略：`spine hook set-mode <hook|standard|heavy>`
- 单次跳过：`SPINE_PRECOMMIT=false git commit -m "wip"`

`spine hook on` 现在会在需要时自动安装 hook；`spine hook off` 会从 `.git/hooks/pre-commit` 中移除 ArchSpine 管理段，避免仓库里留下失效的受管 hook 内容。`spine hook set-mode` 用于控制受管 hook 执行轻量 hook 路径、standard 增量 sync 还是 heavy 增量 sync。

### 调整文档语言

```bash
spine languages show
spine languages set
```

`show` 会输出当前配置的文档语言，并在存在快照时附带展示语言发现结果。`set` 会重新打开初始化时使用的语言多选器，让用户在 `init` 之后继续调整输出语言。

### 读写配置

```bash
spine config get hooks.preCommit
spine config get hooks.syncMode
spine config set hooks.preCommit false
spine config set hooks.syncMode heavy
```

### Hook 同步路径

```bash
spine sync --hook
```

这条路径会更新索引和缓存，但跳过 Atlas 文档生成。它是受管 pre-commit hook 的默认路径，适合高频本地索引刷新场景。

如果你希望受管 pre-commit hook 改为执行完整的增量 sync，可以使用 `spine hook set-mode standard` 或 `spine hook set-mode heavy`。这两种策略都会复用正常的 `spine sync` 路径，只是运行时 mode 不同。

### God mode 档案

```bash
spine god
```

God mode 是一个单独的人类阅读命令，不会接入正常 `sync` 流程。它只会写出一份超大的总档案到 `.spine/<repo-name>-god.md`。

这个模式刻意不是生产模式：

- 它是一个只面向人类阅读的 joke mode
- 每次运行都会覆盖之前的 `.spine/<repo-name>-god.md`
- 不应把它视为正常 machine-facing control plane 的一部分

### 诊断命令

```bash
spine status
spine history <file_path>
spine languages show
spine usage
spine info
spine scan --dry-run
```

这些命令分别用于查看同步状态、历史语义变更、语言识别、Token 使用、工作区摘要和实际扫描边界。

如果要排查 prompt / validate 行为，也可以使用：

- `SPINE_DIAGNOSTICS_MODE=debug spine check`
- `spine llm show`

只有显式开启 diagnostics 模式时，系统才会把快照写到 `.spine/diagnostics/`，默认不会产生噪声日志。

## 疑难排障

### 锁冲突

如果遇到锁冲突、陈旧锁提示或 owner 不可验证锁提示，先确认没有其他 ArchSpine 进程在运行，再考虑删除 `.spine/.lock`。

### 扫描边界异常

优先运行 `spine scan --dry-run`，然后检查：

- `.gitignore`
- `.spineignore`
- `.spineignore.local`
- `scanPolicy.fileSource`

### 语言识别异常

运行 `spine languages show` 查看当前配置的文档语言、识别到的语言、parser 可用性和未映射扩展名。
