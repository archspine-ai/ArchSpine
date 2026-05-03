# ArchSpine SpineUnit 模式 — 配置摘要

此模式定义了 ArchSpine 镜像系统中每个 **SpineUnit** 文档的结构。SpineUnit 代表一个源代码单元（文件），承载索引、验证、依赖分析和治理实施所需的所有元数据。操作员必须确保每个 SpineUnit 符合此模式，以维护系统完整性。

## 配置控制的内容

该模式规定了六个必需顶层属性的有效性：

- **`schemaVersion`** — 必须与共享模式中声明的版本一致。模式不匹配是导致摄取失败的最常见原因。
- **`identity`** — 通过 `filePath`（仓库相对路径）、`contentHash`、`skeletonHash`、`semanticHash`、`language`、`fileKind` 和 `scope` 唯一标识该单元。哈希值必须是有效的内容哈希；文件路径不能为空且必须是仓库相对路径。
- **`semantic`** — 核心治理元数据。包含：
  - `role` 和 `responsibilities`（描述性数组）。
  - `outOfScope`（明确排除的责任列表）。
  - `invariants` — 每个不变量包含 `id`（短横线命名法）、`description` 和 `enforceable` 布尔值。这些不变量对执行引擎至关重要。
  - `changeIntent` — `architecturalIntent` 和 `recentChangeIntent`（可空字符串）。缺少意图信息会阻塞自动化变更影响分析。
  - `publicSurface` — 导出的符号（`symbolName` + `description`）。对 API 表面跟踪是必需的。
- **`skeleton`** — 结构轮廓（导入/导出）。供依赖解析器使用。
- **`graph`** — 存储派生的依赖关系和调用图边。
- **`provenance`** — 来源和历史（时间戳、生成上下文）。对审计和回滚决策至关重要。

## 最重要的参数

| 参数 | 重要性 |
|------|--------|
| `schemaVersion` | 必须与系统活动模式一致。不匹配会导致立即拒绝。 |
| `identity.contentHash` | 主要去重键。哈希值错误或过时会导致增量索引中断。 |
| `semantic.invariants[].id` | 必须是短横线命名法且唯一。策略引擎用它来实施规则。 |
| `semantic.changeIntent` | 两个可空字符串字段。若留空，则无法进行有关变更理由的自动推理。 |
| `publicSurface[].symbolName` | 驱动 API 合规性检查。符号缺失或拼写错误会产生虚假的治理告警。 |

## 操作风险与稳定性注意事项

- **模式版本漂移**：如果系统更新到新模式版本而不迁移现有 SpineUnit，所有旧文档将不可读。**始终先在过渡环境中升级文档。**
- **缺少必需字段**：任何缺少六个顶层属性之一的 SpineUnit 将在摄取时被拒绝。在批量导入前验证文档。
- **不变量实施**：`enforceable` 标志是布尔值。如果设置为 `true`，系统必须尝试以编程方式验证该不变量。在不具备相应验证逻辑的情况下启用不变量会产生漏报。
- **哈希正确性**：哈希值（`contentHash`、`skeletonHash`、`semanticHash`）必须一致计算。更改哈希算法而不重新扫描将导致所有现有文档失效。
- **向后兼容性**：模式不允许 `additionalProperties`。未来版本中添加新字段会破坏兼容性，除非显式修订模式。使用 `$schema` 版本机制管理过渡。

将模式作为 SpineUnit 验证的唯一事实来源。生成的文档与此模式之间的任何偏差都将波及整个 ArchSpine 管道，导致索引失败、依赖关系图损坏以及治理报告不一致。