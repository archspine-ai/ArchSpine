# 任务执行模型

本文说明 ArchSpine 当前如何运行 `scan`、`check`、`fix` 和 `sync`。
目标是在保持现有产品形态的前提下，让运行模型尽量确定、可组合、可维护：

- CLI 仍然是入口
- service 层负责编排与生命周期
- task 只做单一阶段的工作
- 共享状态被收紧，而不是继续当作隐式数据总线

## 为什么需要这份说明

ArchSpine 的目标是把仓库语义做成显式、可治理的控制面。
因此，执行模型也应该遵循同样的原则，而不是依赖一条松散的隐式流水线。

这种模型主要避免这些风险：

- task 之间的顺序耦合
- 对可变共享状态的隐式依赖
- 重试时把旧运行数据带回下一轮
- 运行逻辑难以复用到其他入口

## 当前模型

### 1. 阶段输入和输出是显式的

每个 task 都接收一个有类型的输入，并返回一个有类型的输出。

这意味着某个 pipeline 步骤依赖上一步时，依赖关系写在数据契约里，而不是写在“大家都记得要先改某个共享对象”这种约定里。

例如：

- `scan` 产出文件选择结果，供提取阶段使用
- AST 提取产出 skeleton 和支持信息，供 summarize 与 validate 使用
- summarize 产出待提交信息，供 state commit 使用
- state commit 产出已提交的选择结果，供 reverse index 与 aggregation 使用
- fix 显式消费 violations，并返回需要复检的文件集合

### 2. `TaskContext.state` 只保留 telemetry

共享的 `state` 现在只用于执行遥测：

- usage 计数
- warning 记录
- diagnostics 快照

它不再是 pipeline 数据流转的主通道。

### 3. `TaskContext.runtimeCache` 保存临时产物

有些 task 在单次运行里仍然需要短生命周期的运行时产物。

这些内容现在放在 `runtimeCache`，而不是 `state` 里：

- file skeletons
- unsupported file 标记
- pending commit 缓冲

`runtimeCache` 被视为运行期缓存，不是 pipeline 契约本身。

### 4. service 负责编排

`check-service`、`sync-service` 和 `fix-service` 负责决定：

- 哪些 task 要执行
- 每个 task 接收什么显式输入
- 重试时如何重置
- 何时获取或释放锁

这样编排逻辑就不会散落在 task 内部。

### 5. CLI 保持轻薄

CLI 只负责解析参数、选择 service、呈现用户输出。
它不应该承担 pipeline 规则、阶段串联或重试状态的职责。

## 当前流水线形态

现在主链已经是显式流：

- `scan -> ast -> validate`
- `scan -> ast -> summarize -> state-commit -> reverse-index -> aggregation`
- `violations -> fix -> recheck scan -> revalidate`

这是有意设计的。
这条链更像数据流，而不是一串副作用。

## 任务模型中的 Build / Sync / Publish 三段生命周期

- `build` 是重型基线生命周期，用于首次建立可信 `.spine` 基线、运行态恢复，以及语义大幅变化后的重建。
- `sync` 是机器生命周期优化路径。非 full 模式下会通过 runtime override 强制 `generationStrategy=json-only`，优先保证索引新鲜度与 Agent 地图实时性。
- `publish` 是人类文档生命周期边界。它先过 preflight，再做轻量 sync 刷新 JSON，随后在具备文本生成能力时通过 `DocumentBackfillTask` 尝试回填 Atlas Markdown；如果启用了实验 view 层，同一条流程也会刷新 `.spine/view/**`。
- 当非 full、非 hook 的增量 sync 在未刷新 Atlas 的情况下处理了文件时，运行时会写入 `.spine/.stale`，让 Agent 与 MCP 客户端可感知文档滞后。

## summarize/aggregation 的双层短路机制

- **L1（LLM 前跳过）**：summarize 会比较当前 AST `skeletonHash` 与上次索引 identity；若一致，直接复用历史 semantic，跳过 LLM 生成。
- **L2（LLM 后传播门）**：LLM 生成后会计算 `semanticHash`。当前实现用它决定该文件是否进入 summarize 阶段的 `affectedDirs`；但如果父级 index 产物的 mtime 落后于被重写的子级 JSON，后续目录级聚合仍可能重新执行。
- 两层门控结合后，可同时降低 token 消耗与聚合抖动，并保持 sync-first 工作流的机器输出确定性。

## 这带来的收益

- 步骤之间的隐藏耦合更少
- 每个阶段更容易单测
- 重试行为更清晰
- 后续做 server 或 daemon 入口更简单
- 新增 task 的风险更低

## 不要做的事

不要把旧的隐式模式加回来。

- 不要再通过 `TaskContext.state` 上的临时字段传递新的 pipeline 信息
- 不要让 task 依赖未显式写进输入类型的前序副作用
- 不要把 `runtimeCache` 当成跨阶段契约
- 不要把 CLI 交互塞回 task 逻辑里，能放到 runtime I/O 或 service 层的就不要放进 task

## 相关文档

- [工程原则](ENGINEERING-PRINCIPLES)
- [Prompt Engine](PROMPT-ENGINE)
- [总体策略](STRATEGY)
