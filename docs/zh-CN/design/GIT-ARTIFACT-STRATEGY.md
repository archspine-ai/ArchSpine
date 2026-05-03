# ArchSpine Git 产物策略

本文档定义 ArchSpine 应如何处理宿主仓库中的 `.spine/` 产物，以及 `spine init` 应如何塑造默认的 Git 使用体验。

## 问题

当前产品表述并不一致：

- 仓库根目录 `.gitignore` 忽略的是本地运行态
- 仓库根目录 `.gitattributes` 会把生成快照标成 generated
- `tutorials/DEMO-project/.gitignore` 几乎忽略了整个 `.spine/` 树
- `spine publish` 又把 `.spine/index/**` 和 `.spine/atlas/**` 描述为可分发快照输出
- `spine init` 目前只管理 `.ignore`，并不管理 `.gitignore` 或 `.gitattributes`

这会制造一个产品层歧义：`.spine/` 到底是本地缓存、可提交的治理层，还是仓库里的可分发产物？

## 产品目标

目标是在不破坏分发模型的前提下，让 ArchSpine 的接入体验足够干净。

默认体验应同时满足以下几点：

1. 第一次执行 `spine init` 不应制造大量 Git 噪音
2. 用户应能理解哪些 `.spine` 文件是项目资产，哪些是本地运行态
3. 团队在需要时可以提交可分发语义快照，同时不被 review 噪音淹没
4. `init`、`publish`、文档和 demo 项目必须表达同一套模型

产品推荐现在应当是：

- `Distributable snapshot` 作为默认、面向团队的路径
- `Local-first` 作为更轻量的可选退出路径，适合个人或试验用途

## 用户需求

### 1. 本地接入者

核心需求：

- 快速获得价值，而不是先被仓库污染问题卡住

期望默认行为：

- 本地运行噪音不进入 Git
- 如果用户想要更轻量的 footprint，可以选择 `local`

### 2. 团队维护者

核心需求：

- 把 ArchSpine 接入真实仓库工作流

期望默认行为：

- 治理输入可提交
- 生成产物有明确 Git 语义
- review 依然可读

### 3. 分发/发布负责人

核心需求：

- 把语义快照作为仓库资产发布与审查

期望默认行为：

- 可分发产物可以进入 Git
- 生成产物在 review 工具里被弱化处理
- 本地运行态仍保持排除

## 产物模型

ArchSpine 应正式把 `.spine/` 输出分为三类。

### 1. 控制面产物

示例：

- `.spine/config.json`
- `.spine/rules/**`

属性：

- 人工编写或人工审核
- 应进入版本控制
- 应作为正常 review 目标

### 2. 本地运行态

示例：

- `.spine/cache.db*`
- `.spine/.lock`
- `.spine/protected-output-baseline.json`
- 未来新增的本地缓存或锁文件

属性：

- 仅服务本地执行
- 默认不应提交
- 应通过 `.gitignore` 管理

### 3. 可分发快照产物

示例：

- `.spine/index/**`
- `.spine/atlas/**`
- `.spine/manifest.json`
- `.spine/languages.json`
- 如果保留为生成产物，`.spine/diagnostics/**` 也归入此类

属性：

- 由 ArchSpine 生成
- 可以作为仓库分发资产提交
- 应在 review 工具中标记为 generated
- 默认不应被静默踢出 Git

## 产品决议

ArchSpine 将 `.spine/` 定义为“仓库控制面 + 受管理的生成产物”，而不是纯本地缓存目录。

由此得到以下默认决议：

1. `spine init` 应管理 `.gitignore`
2. `spine init` 应管理 `.gitattributes`
3. `.gitignore` 只负责本地运行态
4. `.gitattributes` 负责把可分发快照标记为 generated
5. `spine init` 默认不应忽略 `.spine/index/**` 或 `.spine/atlas/**`
6. `spine publish` 继续作为可分发快照的刷新路径

## 为什么不能忽略整个 `.spine/`

如果在 `init` 阶段直接把大部分 `.spine/` 忽略掉，短期确实能减少本地噪音，但也会同时改写产品语义：

- 用户会自然理解为这些生成快照并不是仓库资产
- `publish` 却仍然把它们定义为可分发输出
- demo、文档和实际 Git 行为会持续冲突

这不是一个小的 UX 问题，而是产品层自相矛盾。

## `init` 默认体验

`spine init` 应优先优化接入体验，但不能破坏分发模型。

默认行为：

1. 在交互式产物策略选择器中优先推荐 `Distributable snapshot`
2. 在 `.gitignore` 中创建或更新 ArchSpine managed block
3. 在 `.gitattributes` 中创建或更新 ArchSpine managed block
4. 继续管理 `.ignore`
5. 对 managed block 之外的用户内容不做覆盖

这套默认行为应对用户表述为：

- 本地运行态默认不进入 Git
- 可分发语义快照默认保持可提交，但 review 体验更友好

## Managed File 策略

这些文件的同步应采用有边界的 managed block，而不是整文件覆写。

要求：

1. 文件不存在时创建
2. 文件中已存在 managed block 时仅更新该 block
3. 文件中有用户内容时保留原内容，并追加 managed block
4. uninit 或清理流程只移除 managed block

## 建议的 Managed 内容

### `.gitignore`

建议的 managed 条目：

```txt
# >>> ArchSpine managed >>>
.spine/cache.db*
.spine/.lock
.spine/protected-output-baseline.json
.spineignore.local
# <<< ArchSpine managed <<<
```

原因：

- 它们属于本地运行态或本地私有覆盖项
- 排除它们能改善默认仓库卫生
- 排除它们不会与 `publish` 语义冲突

### `.gitattributes`

建议的 managed 条目：

```txt
# >>> ArchSpine managed >>>
.spine/index/** linguist-generated=true
.spine/atlas/** linguist-generated=true
.spine/manifest.json linguist-generated=true
.spine/languages.json linguist-generated=true
.spine/diagnostics/** linguist-generated=true
# <<< ArchSpine managed <<<
```

原因：

- 这些都是生成产物
- generated 分类能改善 GitHub review 体验
- 它既不隐藏仓库资产，也不阻止提交

## 非目标

本提案不做以下事情：

- 重定义扫描策略
- 把 `.spine/index/**` 或 `.spine/atlas/**` 改成纯本地产物
- 强制每个仓库立刻提交可分发快照
- 在第一步实现里就引入多模式 `init` 交互

## 后续扩展

如果后续确有需要，ArchSpine 可以暴露显式的产物策略模式，例如：

- `local`
- `distributable`

但第一步实现不应被模式设计阻塞。当前最紧迫的需求，是先把默认语义做一致。

## 执行方案

### 阶段 1. 对齐产品契约

把以下模型正式确认为决议：

- 三类产物模型
- `.gitignore` 负责本地运行态
- `.gitattributes` 负责生成型可分发产物
- `publish` 继续作为分发刷新路径

### 阶段 2. 对齐产品表面

更新所有对外表述，使其表达同一套模型：

- 根仓库默认配置
- demo 项目默认配置
- `init` help 文案和 onboarding 话术
- 描述 Git 行为和 publish 语义的相关文档

### 阶段 3. 实现

新增与当前 `.ignore` / Agent 指令同步类似的工具：

- `syncGitIgnoreFile`
- `removeManagedGitIgnoreFile`
- `syncGitAttributesFile`
- `removeManagedGitAttributesFile`

并接入 `spine init` 与清理流程。

### 阶段 4. 验证

补充以下测试：

- 文件缺失时的创建行为
- 已存在 managed block 时的定向更新
- 有用户内容时的追加且不覆盖
- 清理流程只移除 managed 内容
- `init` 对 Git 相关 managed 文件的状态跟踪

## 验收标准

当以下条件全部成立时，方案视为完成：

1. `spine init` 会管理 `.gitignore`、`.gitattributes` 和 `.ignore`
2. 根文档、demo 默认行为和 CLI 文案都遵循同一产物模型
3. 本地运行态默认被排除
4. 可分发快照默认不被忽略
5. 生成快照在 review 工具中被标记为 generated
6. managed 文件中的用户自有内容得到保留

## 紧接着的工作项

在该策略获批后，下一批具体任务是：

1. 修正 demo 项目的 `.gitignore`，使其符合产品决议
2. 增加 managed sync helper 与测试
3. 接入 `spine init`
4. 修正文档里当前互相冲突的 Git 表述

---

# ArchSpine Git 策略迁移设计

本文档定义在初次执行 `spine init` 之后，仓库的 artifact strategy 应如何演进。

之所以需要它，是因为 `local` 和 `distributable` 已经不再只是 onboarding 预设，而是会影响 Git 行为、`publish` 语义以及未来团队工作流的仓库级声明。

## 背景

当前能力已经覆盖了部分表面：

- `spine init --artifact-strategy <local|distributable>` 可以设置声明策略
- managed `.gitignore` 会随策略更新
- managed `.gitattributes` 会按策略创建或移除
- `spine publish` 在 `local` 下已经会给出 warning
- `spine repo check` 已经能识别一部分配置与托管 Git 文件的漂移

当前缺失的，是“初始化之后如何切换策略”的正式生命周期模型。

## 问题

今天用户在技术上已经可以通过重新执行 `spine init` 改策略。

但这不是一个足够长期的产品方案，因为：

1. `init` 是 onboarding 命令，不是仓库生命周期命令
2. 策略切换需要更聚焦的 warning 和迁移提示
3. 团队需要一份清晰的 Git 状态变更契约
4. 未来商业化团队工作流需要稳定的仓库级策略面

## 产品目标

把 artifact strategy 变成一个具备三种属性的仓库契约：

1. 显式
2. 可恢复
3. 可治理

这意味着策略切换必须从“重跑 onboarding 的副作用”升级成“明确的仓库迁移动作”。

## 核心决议

ArchSpine 应明确区分两类动作：

1. bootstrap selection
2. lifecycle migration

Bootstrap selection：

- 发生在 `spine init`
- 负责选择仓库的初始策略

Lifecycle migration：

- 发生在初始化之后
- 负责把一个已有仓库从一种声明策略切换到另一种
- 必须能解释影响，并安全修复 managed Git 文件

## 策略定义

### `local`

意图：

- 默认把生成快照排除在 Git 之外
- 优先优化私密开发或早期接入体验

预期 Git 状态：

- `.gitignore` managed block 包含 snapshot 输出
- `.gitattributes` 不应保留 ArchSpine 的 generated markers

预期 publish 语义：

- `spine publish` 仍可在本地刷新 snapshot
- 但“把 snapshot 作为团队分发资产提交”并不是当前仓库的声明意图

### `distributable`

意图：

- 把 snapshot 输出视为仓库分发资产
- 通过 generated markers 降低 review 噪音

预期 Git 状态：

- `.gitignore` managed block 只排除本地运行态
- `.gitattributes` 为 snapshot 输出添加 generated markers

预期 publish 语义：

- `spine publish` 与仓库策略保持一致
- 维护者可以把它作为 review 或 release 流程的一部分

## Source of truth

建议的优先级应为：

1. 仓库配置声明策略意图
2. managed `.gitignore` 和 `.gitattributes` 负责落地
3. `repo check` 与未来 repair 命令负责报告和修复漂移

这点很关键，因为迁移窗口里，仓库中的已跟踪文件可能短时间与策略不一致，但配置仍应是最终政策锚点。

## 迁移模型

### 支持方向：`local -> distributable`

这是主要迁移路径，应被视为标准升级流。

效果：

1. 把声明策略更新为 `distributable`
2. 更新 managed `.gitignore`，停止忽略 snapshot 输出
3. 创建或更新 managed `.gitattributes`
4. 如果 snapshot 当前还不存在，应提示用户可能需要执行 `spine build` 或 `spine publish`
5. 可以提醒用户：此前被忽略的文件现在可能会出现在 `git status`

面向用户的表述应明确：

- 仓库正在从“本地 snapshot”切换为“可提交 snapshot”
- managed block 之外的用户 Git 文件内容不会被覆盖

### 支持方向：`distributable -> local`

这条路径允许存在，但应被表述为带后果的降级。

效果：

1. 把声明策略更新为 `local`
2. 更新 managed `.gitignore`，开始忽略 snapshot 输出
3. 移除 ArchSpine 管理的 `.gitattributes` block
4. 如果 snapshot 已经被 Git 跟踪，应给出 warning，因为修改 ignore 规则并不会自动 untrack 已有文件
5. 给维护者明确后续建议，用于停止分发 snapshot

重要规则：

ArchSpine 不应在降级策略时自动从 Git 历史或 index 中移除已跟踪文件。

这个动作过于破坏性，不应隐式执行。

CLI 应做的是把状态讲清楚，例如：

- 仓库现在声明为 `local`
- 但 snapshot 文件可能仍被 Git 跟踪
- 是否保留、untrack、或进一步清理历史，应由维护者自行决定

## 迁移不能做的事

迁移不应：

1. 重写 `.gitignore` 或 `.gitattributes` 中用户自有部分
2. 自动删除 snapshot 文件
3. 自动执行 `git rm --cached`
4. 把 `publish` 变成隐式切换策略的入口
5. 把 `remove` 变成策略切换工具

## 命令形态

建议的生命周期命令：

```bash
spine repo strategy set <local|distributable>
```

这个命令应逐步成为初始化之后的标准策略切换入口。

为什么这类命令形态更合适：

- 生命周期意图更明确
- 不会继续把 `init` 越做越重
- 也为未来的仓库策略子命令留下扩展空间

### 过渡期允许方案

在生命周期命令尚未存在前，重新执行：

```bash
spine init --artifact-strategy <mode>
```

仍然可以作为迁移和修复路径。

但文档里应把它表述为“过渡期做法”，而不是长期契约。

## 与校验/修复的关系

策略迁移应与现有和未来的校验面保持清晰分工。

预期命令职责：

- `spine init`：bootstrap
- `spine repo strategy set`：显式迁移
- `spine repo check`：检测漂移
- 未来 repair 命令：把 managed Git 文件修回声明策略

这种划分可以避免某个命令再次演化成新的上帝入口。

## 与 `publish` 的关系

`spine publish` 必须保持策略感知，但不应成为迁移命令。

要求：

1. 在 `distributable` 下，publish 正常工作
2. 在 `local` 下，publish 明确提醒“仓库意图”与“分发行为”不一致
3. 当团队真正需要分发 snapshot 时，publish 应指向正式迁移路径

建议 CLI 提示：

- 一段简洁 warning
- 下一步指向 `spine repo strategy set distributable`
- 在过渡期可补充 `spine init --artifact-strategy distributable`

## 分阶段执行方案

### Phase 1：契约收敛

交付物：

- 当前这份迁移设计
- 文档层统一 bootstrap 与 migration 的说法
- 保留现在 `init` 的迁移能力，但明确它只是过渡方案

### Phase 2：生命周期命令

交付物：

- 增加 `spine repo strategy set <mode>`
- 把策略更新逻辑从 `init` 中进一步抽离出来
- 复用现有 managed block 行为

### Phase 3：漂移与修复

交付物：

- 强化 `spine repo check`
- 增加把 managed 文件修回配置声明的 repair 路径
- 对已跟踪 snapshot 的降级 warning 做得更清晰

### Phase 4：团队/商业化增强

交付物：

- 面向 CI 的校验路径
- 更强的 publish 摘要
- 未来团队 preset 的接入点

## 验收标准

当满足以下条件时，这份设计算成功：

1. 策略切换被建模成仓库生命周期动作，而不是单纯重跑 init 的副作用
2. 用户在初始化之后仍能清晰理解 `local` 与 `distributable` 的区别
3. 降级路径会给出清晰 warning，但不会做破坏性 Git 操作
4. 后续团队/商业化能力可以建立在稳定的仓库策略契约之上

## 总结

这件事的关键动作其实很简单：

`init` 负责选择初始策略，但不应该继续承担长期的策略生命周期管理。

Artifact strategy 已经足够重要，值得拥有独立的仓库级命令路径。

---

# ArchSpine Git 策略后续清单

本文档用于固化 `spine init` Git 产物策略之后，下一阶段值得推进的产品与工程路径。

它面向 ArchSpine 当前所处阶段：

- 产品仍处于私密开发期
- 还没有进入真正的开源分发阶段
- 团队协作能力预期会成为未来商业化的一部分

这意味着优先级不能按“能做多少功能”来排，而要按“能否把控制面能力做扎实，并为后续团队商业化留出清晰边界”来排。

## 当前基线

已经完成的基础工作：

- `spine init` 已支持 `local` 和 `distributable`
- `.gitignore` 和 `.gitattributes` 已具备 managed block
- `spine remove` 已能清理托管 Git 集成，并覆盖残留边界场景
- demo、文档、README 和测试已经完成对齐

所以现在的问题已经不是“Git-aware onboarding 有没有做出来”，而是：

这套能力周边还缺哪些路径，才能支撑真实团队工作流，以及未来的商业化包装。

## 决策视角

建议用下面四条原则排序：

1. 优先消除产品自相矛盾
2. 优先保护未来团队/商业化路径
3. 优先增强真实仓库中的可恢复性
4. 不要过早扩大对外功能面

## Tier 1：在更广泛外部暴露前必须补齐

### 1. 策略迁移路径

问题：
现在已经有 `local` 和 `distributable`，但仓库生命周期中的模式切换还不是一条正式工作流。

为什么重要：

- 私密开发用户也会随着仓库成熟度变化而切换模式
- 很多团队一开始会先用 `local`，之后才升级到 `distributable`
- 未来商业化团队工作流必须有明确升级路径，不能靠“重跑一次 init 试试看”

建议结果：

- 明确定义 `local -> distributable` 的受支持迁移路径
- 明确定义 `distributable -> local` 的行为
- 说明当仓库里已经提交过 snapshot 时，降级模式该如何处理

可能形态：

- `spine init --artifact-strategy ...` 继续承担初始化职责
- 未来新增 `spine repo strategy set <mode>` 之类的生命周期命令

### 2. 仓库一致性检查路径

问题：
配置、`.gitignore`、`.gitattributes` 和仓库真实状态，随着时间推移会发生漂移。

为什么重要：

- 私密阶段还能靠人工修
- 团队和商业化场景不能依赖隐性经验
- 如果工具不能解释和修复漂移，后续支持成本会快速上升

建议结果：

- 增加仓库一致性检查能力
- 检测配置策略与托管 Git 文件是否一致
- 能识别明显异常，例如“配置是 distributable，但 snapshot 仍被全局忽略”

可能形态：

- `spine doctor`
- 或 `spine init --repair`
- 或更聚焦的 `spine repo check`

### 3. `publish` 与策略联动

问题：
`publish` 在概念上已经与 distributable snapshot 对齐，但交互和校验层还不够强。

为什么重要：

- 未来商业化团队工作流会把 `publish` 视为可信的状态切换点
- 如果 `publish` 在冲突的 Git 状态下照常运行，用户会不知道到底该信哪一层契约

建议结果：

- 让 `publish` 感知当前 artifact strategy
- 在 `local` 模式下，不要静默假定团队意图，而是给出明确升级提示
- 在策略冲突或仓库异常时，输出可执行的 warning

## Tier 2：适合在私密硬化阶段推进

### 4. 团队级 source of truth

问题：
当前还没有严格定义：配置、Git 文件和仓库实际内容，谁是最终权威。

为什么重要：

- 团队工作流需要确定性的冲突处理规则
- 商业化治理能力需要稳定的策略锚点

建议结果：

- 明确优先级
- 更合理的方向是：配置声明意图，托管 Git 文件负责落地，doctor/check 负责报告漂移

### 5. CI 校验路径

问题：
当前策略主要只在 `init` / `remove` 阶段生效。

为什么重要：

- 团队需要在 PR/CI 阶段发现漂移
- 当治理能力出现在 CI，而不只是本地初始化时，商业价值会明显提升

建议结果：

- 提供一个适合 CI 的只读校验命令
- 当 managed block 丢失或过期时能够失败
- 未来可扩展到校验已跟踪 snapshot 是否符合当前模式

### 6. 安全修复命令

问题：
`init` 和 `remove` 之间仍缺一条中间修复路径。

为什么重要：

- 真实仓库里经常会出现部分状态损坏
- 如果可以无损修复，而不是重装/重删，工具可维护性会更强

建议结果：

- 增加针对托管 Git 集成的安全修复命令
- 明确只修 managed block，不覆盖用户自有内容

## Tier 3：适合作为商业化路线储备

### 7. 团队 onboarding 预设

机会：
未来团队商业化能力可能需要的是成套初始化预设，而不只是一个策略开关。

可能的预设维度：

- artifact strategy
- hook mode
- publish 预期
- CI 校验建议

这件事应建立在底层策略契约稳定之后。

### 8. 策略漂移报告

机会：
一旦进入团队控制面能力阶段，Git 产物漂移本身就会成为治理信号。

可能结果：

- 在 CI 中给出 drift summary
- 给仓库健康度看板提供输入
- 面向管理员输出仓库配置错误原因

### 9. 审计友好的 snapshot 工作流

机会：
对于付费团队能力来说，可分发 snapshot 可以从“纯生成物”升级成“可审计治理资产”。

可能结果：

- 更强的 `publish` 摘要
- snapshot 变更意图元数据
- 针对语义生成产物的 PR 指引

## Tier 4：可选探索

### 10. 更智能的初始化推荐

可能方向：

- 根据仓库形态推断推荐模式
- 当仓库明显是团队托管形态时，优先建议 `distributable`

这件事有价值，但在默认模式的真实问题出现前，不是当下必须项。

### 11. 多官方模板

可能方向：

- 一个 local-first 模板
- 一个 distributable / team-oriented 模板

当产品开始更广泛对外传播时，这条路径会更有意义。

## 建议执行顺序

建议后续几个周期按下面顺序推进：

1. 先定义策略迁移行为
2. 再补仓库一致性检查
3. 再让 `publish` 与策略状态形成联动
4. 然后明确团队级 source of truth
5. 再补适合 CI 的只读校验
6. 最后再扩展到团队预设和治理看板类商业化能力

## 现在不要做的事

当前应避免：

- 继续增加更多策略模式
- 把内部规划文档过早包装成对外营销承诺
- 在仓库级契约尚未稳定前就构建组织级管理界面
- 过早把云端或多租户假设写进本地 CLI

## 总结

接下来最值得做的，不是继续打磨 `.gitignore` 细节。

真正该做的是把 Git 产物策略从“一次性的初始化功能”，升级成“可检查、可恢复、未来可治理”的仓库契约。
