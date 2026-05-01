# 架构总览

本文记录 ArchSpine 在执行模型和状态边界收敛之后，当前已经稳定下来的架构。

这是一份描述性文档，不是愿景说明。目标是在不改变产品形态的前提下，把运行模型写清楚。

## 1. 运行边界

ArchSpine 的边界现在比较清晰：

- CLI 是用户入口
- service 负责编排和生命周期
- task 负责单个阶段
- infrastructure 负责 I/O、持久化、LLM 和宿主集成

这个划分很重要，因为 ArchSpine 是治理工具，不只是代码生成器。
运行时必须足够确定，才能承担仓库控制面的职责。

## 2. 显式阶段流

当前主流水线已经由显式阶段契约描述，而不是依赖隐式共享状态。

现在的主链是：

- `scan -> ast -> validate`
- `scan -> ast -> summarize -> state-commit -> reverse-index -> aggregation`
- `violations -> fix -> recheck scan -> revalidate`

阶段数据通过显式的输入 / 输出对象流转。
这样可以避免顺序耦合，也更容易单测和复用。

## 3. 共享状态策略

`TaskContext.state` 现在只保留 telemetry。

它用于：

- usage 计数
- warning 记录
- diagnostics 快照

它不再承担 pipeline 数据从一个阶段传到下一个阶段的职责。

临时运行产物则放在 `TaskContext.runtimeCache` 里：

- file skeletons
- unsupported file 标记
- pending commit 缓冲

`runtimeCache` 是运行期缓存，不是跨阶段契约。

## 4. service 编排

`check-service`、`sync-service` 和 `fix-service` 是编排层。

它们负责决定：

- 哪些 task 执行
- 每个 task 接收什么输入
- 重试时如何重置本地运行态
- 何时获取或释放锁

这样可以把工作流逻辑留在 service 层，而不是散落到 task 内部。

## 5. writer 边界

受信写入边界依然严格：

- ArchSpine CLI/runtime 是正式 `.spine` 产物的 authoritative writer
- MCP 只读
- 普通本地 Agent 只是建议来源，不是 `.spine` writer
- 这条边界是协作与运行时安全契约，不是对同权限进程的强隔离层

受保护的输出包括：

- `.spine/index/**`
- `.spine/atlas/**`
- `.spine/cache.db*`
- `.spine/.lock`

## 6. 产物分类

`.spine/` 被视为受控的仓库控制面加生成产物。

当前的产物类别是：

- 控制面产物，例如 `.spine/config.json` 和 `.spine/rules/**`
- 本地运行态，例如 `.spine/cache.db*` 和 `.spine/.lock`
- 可分发快照产物，例如 `.spine/index/**`、`.spine/atlas/**`、`.spine/manifest.json` 和 `.spine/languages.json`

在当前产品线里，默认语义镜像并不试图再复制整套仓库文档。面向人的仓库文档通常继续在原路径上充当权威版本，而代码、schema、仓库自动化和 `.spine` 控制面资产才是默认镜像主面。

因此：

- `spine init` 会管理 `.gitignore` 和 `.gitattributes`
- 运行态默认不进入 Git
- 生成快照在分发时可以保持可 review

## 7. 当前产品姿态

当前主线主要优化的是：

- 确定性提取
- 显式治理
- 可持久化语义记忆
- CLI-first 工作流
- 本地 MCP 消费

这让 ArchSpine 能够直接使用，同时也给未来的 daemon 或 hosted MCP 入口保留结构基础。

## 相关文档

- [总体策略](STRATEGY)
- [任务执行模型](TASK-EXECUTION-MODEL)
- [Git 产物策略](GIT-ARTIFACT-STRATEGY)
- [Prompt Engine](PROMPT-ENGINE)
