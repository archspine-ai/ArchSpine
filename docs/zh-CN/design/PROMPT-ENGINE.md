# Prompt Engine 策略

本文档说明 ArchSpine 当前 prompt 拼接层的设计方向。

目标不是“prompt 文案更漂亮”，而是最大化两件事：

- 性能上限
- 结果质量

ArchSpine 应该表现为一个 prompt system，而不是一堆 prompt 字符串的集合。

## 为什么需要这一层

朴素的 prompt 拼接在真实仓库里很快会失效：

- 过多上下文被硬塞进同一次请求
- 低价值 import 挤占高价值证据
- 规则密集的审计任务和摘要密集的语义任务争抢同一份预算
- 文件一大、依赖一多，输出稳定性就明显下降

Prompt Engine 的存在，就是为了解决这些问题。

## 当前模型

当前实现可以分成四层。

### 1. 上下文检索

`ContextEngine` 负责解析本地 import、符号引用和已知依赖语义。

当前输出被组织成三类：

- `Import Inventory`
- `Known Internal Dependency Semantics`
- `Resolved Symbol References`

这样模型拿到的是基于证据的上下文，而不是原始文件堆砌。

### 2. Prompt 上下文编排

`src/infra/prompt-context.ts` 是当前 source 文件 prompt 的编排层。

它负责：

- 压缩 AST skeleton 输入
- 裁剪历史 semantic
- 在规则上下文与依赖上下文之间分配预算
- 输出 diagnostics，说明哪些内容被保留、哪些被裁掉

这是系统从“prompt builder”走向“prompt engine”的关键变化。

### 3. 任务感知的 prompt 构造

`generateSourcePrompt(...)` 现在支持任务模式：

- `summarize`
- `validate`

不同模式会改变指令重心：

- `summarize` 更偏向语义综合
- `validate` 更偏向精确审计和基于证据的规则报告

这样就不会再让同一种 prompt 风格同时承担所有任务。

### 4. Provider 执行与解析

Provider 仍然负责执行 prompt 和解析结构化输出，但它们消费的已经不是原始、无限制的上下文，而是经过编排后的输入。

这个边界很重要：

- orchestration 决定什么上下文值得花 token
- provider 决定怎么执行和解析

## 设计原则

### 1. 预算优先于文案

Prompt 质量主要由上下文选择和预算分配决定，而不是靠花哨表述。系统应该在考虑文案之前，先回答什么内容进 prompt 以及分配多少预算。

### 2. 证据优先于广度

系统应该优先保留直接 import、已知语义文档和精确的符号证据，而不是猜测性的邻居或泛泛的路径相似性。这对质量和 token 效率都更有利。

### 3. 按任务分配上下文策略

不同任务需要不同预算。`validate` 应该把更多预算给规则和审计证据，而 `summarize` 应该把更多预算给角色、职责和依赖语义。

### 4. 无头生成 (JSON 即 UI)

ArchSpine 将 LLM 视为**分析引擎**，而非文案作者。

- **数据优先于文本**：LLM 被指令输出严格结构化的 JSON，包含所有语义事实和多语言字符串。
- **本地渲染**：人类可读的 Markdown 由确定性的 Node.js 渲染器基于 JSON 负载生成。
- **一致性**：确保整个仓库的文档风格 100% 一致，不受模型波动影响。

### 5. 智能原语 (Intelligence Primitives)

为了弥合“可用语义”与“精确语义”之间的差距：

- **Few-Shot 样例库**：通过内置的“金标准”样例（优劣对比）引导模型输出专业的架构口吻。
- **思维链 (CoT)**：在校验模式下强制要求输出专用 `_thinking` 字段，模型必须先进行分步逻辑推导再给出结论。
- **符号锚定**：将依赖推断限制在已有的 AST Skeleton 符号范围内，消除“幻想”依赖。

## 当前优化

当前实现已经不只是“下一步设想”，而是已经具备一条完整主线：

- prompt policy tiers：`lite / balanced`
- validate 专用策略：`default / strict`
- runtime 模式预设：`standard / heavy`
- 面向 `summarize` 与 `validate` 的任务感知预算分配
- dependency candidate / symbol target 的 relevance diagnostics
- retained / truncated dependency 与 retained / dropped rule 的 prompt diagnostics
- 固定评测语料与 comparison harness
- 面向 `validate` 的 rule-aware context weighting
- 更重的 semantic-first validate 路径，并且已经通过 runtime 模式与高级 flow 控制暴露出来

## 动态预算分配

Source prompt 的预算已经不再是固定常量。

当前 allocator 会根据这些因素动态调整：

- 源文件行数
- import/export/usage 数量
- 依赖上下文大小
- 规则上下文大小
- 任务模式

当前控制的预算项包括：

- header 行数
- imports 上限
- exports 上限
- usages 上限
- implementation clue 深度
- 总上下文字符预算
- 依赖上下文字符预算
- 规则字符预算
- 历史职责数量

## 轻量相关性排序

依赖摘要和符号目标现在会按轻量相关性信号排序。

当前使用的因子包括：

- 同目录优先
- 已有 semantic 文档优先
- public surface / export 证据更强的依赖优先
- 导入符号更多的依赖优先
- 直接 import 目标优先
- 精确 imported symbol 命中优先
- 路径距离更近优先

这套排序刻意保持简单和高效。

## Diagnostics

Prompt artifacts 现在会暴露 diagnostics，用于观察：

- 原始输入规模
- 分配到的预算
- 最终保留的内容规模
- 哪些 dependency candidate 被保留、哪些被裁掉
- 哪些 rule block 被保留、哪些被丢弃
- dependency candidate 与 symbol target 的相关性排序贡献

如果没有这层观测，后续就无法严肃地做质量和性能调优。

## 下一步应该优化什么

下一阶段仍然应该只围绕性能上限和结果质量推进，但底座已经建好。

最高价值的下一步包括：

1. 扩大 validate-only JSON 实验路径的 live `validate` 样本覆盖
2. 在更多真实 provider 运行上比较收益，再决定是否调整默认行为
3. 随着 prompt policy 演进，持续维护 corpus 与 comparison 数据
4. 把实现结论持续同步回 docs / runbook，避免把 legacy `lite-mode` / `lite mode` 继续写成默认主语义
5. 任何新增 prompt policy 都必须能被现有 corpus 与 comparison harness 验证

## 现阶段不该优先做什么

以下方向当前收益较低：

- 没有测量支撑的 prompt 文案微调
- 重型评分框架
- 把 agent 治理层混进 prompt 拼接
- 不能提升质量或吞吐的架构洁癖式清理

## 成功标准

Prompt Engine 的工作只有在下面这些指标改善时才算成功：

- 相同质量下 token 成本更低
- JSON 解析稳定性更高
- 规则违规检测精度和召回更高
- drift 幻觉更少
- 大仓库下输出更稳定
- 单文件编排开销更低

如果一个变更没有推动这些指标，它就不算 Prompt Engine 进展。
