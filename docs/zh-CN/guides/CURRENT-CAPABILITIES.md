# 当前已实现能力

这个页面只总结当前 `v1.0.x` 已经落地的能力。

它刻意比设计文档更收敛：这里只写已经实现的行为，不写路线图设想。

## 核心工作流

ArchSpine 当前已经具备一条完整的仓库控制面工作流：

- `spine init`：初始化 `.spine/` 配置、规则模板、Git 策略选项，以及可选宿主集成文件。
- `spine build`：执行全量基线重建，用于首次初始化、恢复和受信重建。
- `spine sync`：执行日常开发使用的增量运行态刷新。
- `spine publish`：刷新可分发快照，并基于当前 index 基线回填面向人的 Atlas Markdown。
- `spine check` 与 `spine fix`：执行规则治理检查与修复。
- `spine remove`：移除 ArchSpine 托管的仓库集成内容。

## 运行边界

当前版本已经明确区分写入边界：

- `sync` 是本地运行态刷新边界。
- `publish` 是面向维护者的分发快照刷新边界。
- MCP 仍然是只读面，不负责写 `.spine`。

在当前实现里，普通增量 `sync` 默认是机器优先刷新，核心目标是 `.spine/index/**`；Atlas Markdown 回填由 `publish` 负责。

## 失败恢复

当前版本已经实现了几条明确的恢复路径：

- `spine sync --repair-violations`：当 policy 能安全收敛修复范围时，修复受保护生成产物。
- `spine sync --retry-failed`：只重跑最近一次 sync checkpoint 中 `summarization` 和 `state-commit` 失败的文件，不强制全量 rebuild。
- `spine publish`：当 index 基线已经存在时，用于回填缺失或过期的 Atlas Markdown。

实践上可以这样区分：

- Atlas 文档缺失或过期，用 `publish`
- sync 流水线自身有少量失败文件，用 `sync --retry-failed`
- 运行态基线不完整或需要更大范围恢复时，再用 `build`

## Atlas 行为

Atlas 生成现在已经补上两个关键加固点：

- 当 `project.locales` 缩减时，会自动清理过期的 `.spine/atlas/<locale>/` 目录
- 如果摘要任务请求了 markdown 输出，但模型对所有目标语言都没有返回 markdown block，该文件会被标记为 failed，而不是记成误导性的部分成功

这两点分别避免了两类常见问题：

- 仓库已经只保留中文，但历史 `English/` 目录仍长期残留
- `.spine/index/**` 已更新，但对应 Atlas markdown 没生成却还被当成 completed

## View Layer

实验性的 view layer 已经作为派生阅读层实现到 `.spine/view/` 下。

当前产物包括：

- `public-surface.json`
- `public-surface.md`
- `risk-hotspots.json`
- `risk-hotspots.md`
- `architecture-diagram.json`
- `architecture-diagram.html`

当前行为：

- 开启实验 view layer 后，`public-surface` 与 `risk-hotspots` 默认生成
- `architecture-diagram` 是依赖 full sync 与 LLM 的更重视图
- 这些产物仍然只是阅读辅助层，不是主真相源

## LLM 运行时

当前 CLI 已经提供：

- provider/model 的配置与查看
- 以 `mode` 作为主用户控制面
- 在 runtime manifest 和 sync summary 中保留 diagnostics 与可追溯信息
- 通过现有 LLM 命令面支持本地 LLM 兼容接入

## 建议阅读顺序

如果你要快速理解当前版本的公开能力面，建议按这个顺序阅读：

1. [快速开始](../quick-start)
2. [Runbook](./RUNBOOK)
3. [View Layer 指南](./VIEW-LAYER)
4. [MCP 接入](../integrations/mcp)
5. [协议](../specs/PROTOCOL)
