# 快速开始

本页给出 ArchSpine 的中文最短上手路径。

## 零安装试用

```bash
npx --yes archspine@latest try
```

这是推荐给 clone 后开发者的第一触点。`try` 是只读命令：它会告诉你当前仓库是否已经带有 `.spine` 控制面输入和可分发快照，并给出下一步显式命令，但不会修改任何仓库状态。

如果你更偏好持久安装，安装后仍然可以继续使用 `spine` 作为主 CLI 入口。

## 初始化仓库

```bash
npx --yes archspine@latest init
```

如果你想一键清除当前仓库中的 ArchSpine 初始化状态，可执行：

```bash
npx --yes archspine@latest remove
```

如果你要跳过确认提示，可使用 `npx --yes archspine@latest remove --yes`。

初始化时，ArchSpine 也可以把一小段 Agent 协作说明注入到一个仓库说明文件中。
默认可用 `AGENTS.md`，也可以显式选择 `CLAUDE.md` 或 `GEMINI.md`。

```bash
npx --yes archspine@latest init --agent-file AGENTS.md
```

这只是一次性的仓库初始化辅助能力，不是安全边界。

`init` 也会顺带准备一个很小的搜索忽略文件，避免默认工作区搜索被生成态 `.spine` 结果淹没。
它还会创建一个带注释的 `.spineignore` 起始模板，默认放入少量推荐的语义忽略项，例如 `.env`、证书/密钥模式、常见缓存目录、明显属于次级产物的生成镜像，以及那些本身已经是权威可读面的仓库说明文档。这些默认项保持可编辑；默认仍会保留代码、schema，以及 `.github/workflows/**` 这类仓库自动化定义作为可索引输入。
它还会决定 `.spine` 产物在 Git 里的默认管理方式：

- `distributable`：面向团队仓库的推荐默认值，让生成快照保持可 review
- `local`：把运行态和生成快照都排除在 Git 之外，更适合轻量本地使用

如果后续需要切换仓库策略，当前受支持的过渡期路径仍是重新执行 `spine init --artifact-strategy <mode>`。

如果你在脚本或 CI 中初始化，可直接指定策略：

```bash
npx --yes archspine@latest init --artifact-strategy distributable
```

如果仓库里已经有 `package.json`，`init` 现在默认不会注入 `spine:*` scripts。只有在你显式选择时，才会加入这些 helper，而且它们会使用 `npx --yes archspine@latest ...`，避免 clone 下来的开发者依赖全局 `spine` 二进制。

如果后续需要切换仓库策略，当前受支持的过渡期路径仍是重新执行 `spine init --artifact-strategy <mode>`。

如果你在 `init` 期间启用 Git pre-commit 同步，请确保当前目录就是 Git 仓库根目录；否则 ArchSpine 会继续完成初始化，并提示你返回 Git root 或先执行 `git init`。

ArchSpine 也支持更广的文档语言列表，包括越南语、俄语这类质量波动更依赖模型能力的多语输出。这些语言仍然可以直接选择，但生成结果需要你自行检查；如果质量不稳定，应切换到更强的多语模型。

## 生成语义镜像

```bash
npx --yes archspine@latest build
```

完成首次全量构建后，日常更新再使用 `npx --yes archspine@latest sync`。

每次 `sync` 结束时，ArchSpine 都会打印本次运行实际解析出的 LLM provider 与 model。`.spine/manifest.json` 中最新一次 sync 摘要也会记录这组 provider/model 及其来源，方便你追溯“当前镜像到底是用什么运行时生成的”。

如果你想试用实验性的派生 view 层，可以先开启开关，再按正常方式执行 `sync`：

```bash
npx --yes archspine@latest config set artifacts.experimentalViewLayer true
npx --yes archspine@latest sync
```

这样会额外生成：

- `.spine/view/public-surface.json`
- `.spine/view/risk-hotspots.json`

请把这两个产物视为实验性的阅读辅助层，而不是稳定协议输出。

如果 ArchSpine 报告了受保护生成产物 violation，而你希望通过正式修复路径重建它们，可执行：

```bash
npx --yes archspine@latest sync --repair-violations
```

这是一个显式 repair 模式，不会默认触发；如果当前破坏范围不能被安全收敛，它会升级为要求执行 `spine build`。

> **💡 交互式体验**：执行 `sync` 时，默认会收起繁杂的任务流水日志，仅在底部显示状态栏和闪烁的进度点 `·`。执行期间随时按下 `空格键`（Space）可以向下展开所有任务细节。如果终端不支持交互（如 CI 环境），会自动降级为普通打印模式。

如果你是维护者，需要刷新仓库分发快照，可执行：

```bash
npx --yes archspine@latest publish
```

其中 `sync` 是日常机器运行层 writer path，默认走快速 `json-only` 索引刷新；`publish` 是面向 `.spine/index/**` 与 `.spine/atlas/**`，以及在启用时的 `.spine/view/**` 的维护者分发刷新路径：会先做轻量 sync，再在具备文本生成能力时尝试回填 Atlas Markdown，并要求运行层基线已就绪，且不存在活动、陈旧或 owner 不可验证的 `.spine/.lock`。

## 执行治理检查

```bash
npx --yes archspine@latest check
npx --yes archspine@latest fix
```

如果你想查看当前 LLM 运行态配置：

```bash
npx --yes archspine@latest llm show
```

如果你需要让 pre-commit 走更高质量的增量同步，而不是默认的 hook 快路径，可以执行：

```bash
npx --yes archspine@latest hook set-mode heavy
```

日常使用时，优先使用更高层的模式开关：

```bash
npx --yes archspine@latest llm set mode standard
npx --yes archspine@latest llm set mode heavy
```

日常使用时，把 `spine sync` 和 `spine publish` 当作主要操作面即可。`spine check` 仍是独立治理流（不是 `publish` 的强制前置步骤）。MCP 保持只读，默认也不应把生成态 `.spine` 结果当作工作区搜索主目标。

如果你要查看更详细的 LLM 运行时展开结果，可以执行：

```bash
npx --yes archspine@latest llm show --verbose
npx --yes archspine@latest info --verbose
```

## 推荐继续阅读

- [中文 Demo](../tutorials/DEMO)
- [中文 MCP 指南](../how-to/MCP)
- [中文 Runbook](../how-to/RUNBOOK)
- [中文常见问题 (../how-to/FAQ)](../how-to/FAQ)
- [中文成本与消耗指南](../explanation/COST-USAGE)
- [中文 View Layer 指南](../explanation/VIEW-LAYER)
- [中文 Prompt Engine 设计](../design/PROMPT-ENGINE)
- [中文架构总览](../explanation/ARCHITECTURE-OVERVIEW)
- [中文任务执行模型](../design/TASK-EXECUTION-MODEL)
- [中文 LLM 基准](../reference/LLM-BENCHMARKS)
- [中文规范导航](../reference/)
