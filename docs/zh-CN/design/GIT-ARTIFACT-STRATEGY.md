# ArchSpine Git 产物策略

本文档定义 ArchSpine 应如何处理宿主仓库中的 `.spine/` 产物，以及 `spine init` 应如何塑造默认的 Git 使用体验。

## 问题

当前产品表述并不一致：

- 仓库根目录 `.gitignore` 忽略的是本地运行态
- 仓库根目录 `.gitattributes` 会把生成快照标成 generated
- `examples/demo-project/.gitignore` 几乎忽略了整个 `.spine/` 树
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

```gitignore
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

```gitattributes
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
