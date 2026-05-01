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
