---
layout: home

hero:
  name: ArchSpine
  text: 中文文档入口
  tagline: 这里汇总 ArchSpine 当前可用的中文页面，方便按主题查找快速开始、Demo、MCP 与规格说明。
  actions:
    - theme: brand
      text: 中文快速开始
      link: tutorials/quick-start
    - theme: alt
      text: MCP 接入
      link: how-to/MCP
    - theme: alt
      text: 中文 Demo
      link: tutorials/DEMO
    - theme: alt
      text: 查看英文主页
      link: ../index

features:
  - title: 快速入门
    details: 从安装、初始化配置、首次全量同步到治理检查，先跑通最短上手路径。
  - title: 治理演示
    details: 用内置 demo 工程展示 sync -> check -> fix 的完整闭环。
  - title: Git 策略初始化
    details: 在 `spine init` 时默认推荐把 `.spine` 产物作为可分发快照进入 Git，同时保留更轻量的本地模式。
  - title: MCP 与规格
    details: 查看 AI 工具接入方式，以及当前协议和规则相关中文资料。
  - title: 实验性 View Layer
    details: 可选生成 `.spine/view/public-surface.json` 与 `.spine/view/risk-hotspots.json`，用于快速阅读和定位风险热点，同时不改变主线 sync 契约。
  - title: 可验证的 Prompt Engine
    details: 用运行模式、diagnostics 和固定语料基准做可比较优化，而不是凭感觉调整生成行为。
---

## 当前可用中文入口

- **入门与演示:**
  - [快速开始](tutorials/quick-start)
  - [官方 Demo](tutorials/DEMO)
  - [Showcase](tutorials/showcase)
- **指南与参考:**
  - [当前已实现能力](reference/CURRENT-CAPABILITIES)
  - [Runbook](how-to/RUNBOOK)
  - [常见问题 (how-to/FAQ)](how-to/FAQ)
  - [成本与消耗指南](explanation/COST-USAGE)
  - [View Layer 指南](explanation/VIEW-LAYER)
  - [God Mode 指南](explanation/GOD-MODE) - 镜像版上帝文件笑话入口
  - [本地 LLM 接入指南](how-to/LOCAL-LLM)
  - [MCP 接入指南](how-to/MCP)
- **规范:**
  - [规范导航](reference/)

::: info 注意
在 `v1.0.x` 版本中，`sync` 是面向机器优先的增量同步命令，而 `publish` 则是维护者更新 Atlas 等人类可读快照的刷新边界。另外，`.spine/view/**` 系列产物目前仍处于实验性阶段。
:::

## 使用原则

- 中文页用于补齐公开使用路径，但不假设所有页面都已经双语对等
- 当前中文镜像按 `docs/zh-CN/` 结构组织
- 如果中英文描述冲突，以当前实现和明确标注版本的文档为准
- 初始化时默认推荐 `distributable`，同时保留 `local` 作为更轻量的可选模式

## 当前运行态口径

当前 `1.0.x` 主线已经包含：

- 以 `mode` 作为主控制面：`standard / heavy`
- 高级覆盖项仍然存在，但正常产品面只使用 `mode=standard|heavy`
- prompt 与 relevance diagnostics 快照
- 固定 corpus 与 comparison harness
- 更重的 validate 路径，可以先稳定语义结果，再补 markdown
- 面向公开仓库的 CI 分层：默认 gate 保持产品导向，research bench 按需单独运行

运行细节请看 Runbook，运行边界请看架构总览和任务执行模型，设计原因请看 Prompt Engine 文档。
