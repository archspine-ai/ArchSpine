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

- [任务执行模型](../design/TASK-EXECUTION-MODEL)
- [Git 产物策略](../design/GIT-ARTIFACT-STRATEGY)
- [Prompt Engine](../design/PROMPT-ENGINE)

---

# ArchSpine 战略

ArchSpine 的定位是 AI 辅助工程的语义控制面。它不是“把文档做得更漂亮”的工具，而是把仓库结构显式化、可查询化、可治理化。

## 问题是什么

大型仓库会以非常稳定的方式失序：

- God file 吞掉越来越多逻辑
- 职责跨层扩散
- 历史设计意图随着团队流动而消失

传统 prompt 驱动的 AI 工作流会放大这个问题，因为它把“理解仓库”变成了一次临时重建。

## 核心判断

ArchSpine 用三件事来解决这个问题：

1. 确定性提取
2. 显式治理
3. 可持久化的语义记忆

### 确定性提取

以 AST 结构为稳定基础，避免 Agent 在语法和依赖上盲猜。

### 显式治理

让团队在 `.spine/rules/` 中声明规则，再基于这些规则进行审计和修复。

### 语义记忆

把角色、职责和 drift 信息持久化，让仓库意图不依赖单个开发者记忆存在。

### 执行模型

运行时实现也必须和战略保持一致：

- pipeline 各阶段要使用显式的输入 / 输出契约
- 共享运行态要保持足够窄且可读
- 临时产物要和 telemetry 分开
- 编排逻辑应放在 service 层，而不是泄漏进 task 内部

这样 ArchSpine 才能在保持 CLI-first 可用性的同时，对未来的 MCP 或 daemon 入口仍然保持确定性和可治理性。

## Open core 边界

开源层：

- `.spine` 协议
- extractors
- 基础 CLI
- 本地聚合
- 本地 MCP 支持

如果后续有商业层，重点应该放在组织级控制面价值，而不是基础仓库生成能力。

## 战略护城河

ArchSpine 进入的是四个高价值工作流位置：

1. commit 时的同步和仓库卫生
2. CI / PR 阶段的治理
3. 通过 MCP 为 Agent 提供上下文
4. 新成员 onboarding 和仓库理解

## 长期目标

让 `.spine` 像 `package.json` 一样，成为 AI 可读仓库中的自然标准。

## 相关文档

- [架构总览](../explanation/ARCHITECTURE-OVERVIEW)
- [任务执行模型](../design/TASK-EXECUTION-MODEL)

---

# Engineering Principles 与技术加固

ArchSpine 以工业级韧性为目标构建，确保即使在大型、频繁变动的开发环境中，架构治理也能保持一致。本文档总结当前 `v1.0.x` 线路已经落地的核心工程原则。

## 1. 原子化增量检测（Hash Bypass）

为了让 Git Hook 保持亚秒级响应，ArchSpine 为文件变更检测实现了 Fast Path。

- **机制**：系统把每个 tracked 文件的 `mtime` 和 `size` 存入本地 SQLite `cache.db`
- **优化**：在哈希阶段先做浅层元数据比对；如果磁盘元数据与数据库记录一致，则跳过昂贵的 SHA-256 计算，直接返回缓存哈希
- **可靠性**：这条路径不依赖 Git 状态，因此即使开发者绕过 hook 或手动修改文件，也能发现变化

## 2. 图谱自愈（Resilience）

架构依赖图是 ArchSpine 语义推理的基础，因此其一致性必须优先保证。

- **状态持久化**：Reverse Index 的完成状态持久化在 `.spine/manifest.json`
- **自动恢复**：如果同步中断，`ReverseIndexComplete` 会保持 `false`；下次运行时会强制重建整张图，而不是只做增量更新
- **一致性**：这样可以避免“文件摘要已经变了，但依赖图还停留在旧状态”的语义分叉

## 3. 内存安全索引（Streaming）

处理 10,000+ 文件的仓库时，必须避免 Node.js OOM。

- **选择性缓存**：在图构建过程中，只加载 index JSON 中的 `identity` 和 `graph`，跳过大型摘要和 token 数组
- **原子重写**：只有在确实需要写某个节点时，才重新从磁盘加载完整 `SpineUnit`
- **可扩展性**：这样可以把峰值内存压在可控范围内

## 4. 根级扫描剪枝（Performance）

在 `node_modules`、`dist` 很深的仓库里，文件系统扫描本身就可能成为瓶颈。

- **递归剪枝**：`Scanner.walkFileSystem` 在进入子目录前先查询 `ScanPolicy` 和 ignore 规则
- **短路**：如果目录在根层就被忽略，例如 `node_modules/`，则整棵分支会被直接剪掉，避免大量无效 `stat` 调用

## 5. 工业级并发

ArchSpine 在完整或增量同步时采用分层并行模型，以提高吞吐量。

- **按深度并行聚合**：同一层级的目录可以并行聚合，再逐层向根目录冒泡
- **指数退避**：所有 LLM 调用都包裹在带抖动的指数退避重试逻辑里，用于处理 socket reset、DNS 问题和 429 限流
