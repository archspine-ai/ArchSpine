# ArchSpine 语义配置概要

本配置文件定义了 ArchSpine 项目知识图谱的语义标识、索引管线以及来源元数据。它是所有索引操作的核心，如果配置有误，系统可能无法生成正确的语义合约、产生不一致的文档，或丢失溯源信息。

## 该配置控制的内容

该文件声明了项目名称、顶层角色、模块目录和索引来源信息。它告诉 ArchSpine *索引什么*、*如何解释源代码目录*以及*索引何时构建*。

### 关键参数及其重要性

| 参数 | 说明 | 操作注意 |
|------|------|----------|
| `schemaVersion` | 期望的模式版本（必须为 `"1.0.0"` 以匹配当前生成器）。 | 不匹配会导致解析失败；必须与运行时版本保持一致，以防静默数据损坏。 |
| `projectName` | 仓库标识符（例如 `"archspine"`）。 | 用于限定生成的构件和跨引用索引的范围。必须是非空字符串。 |
| `role` | 本配置在索引管线中的功能定位（例如 *语义索引与协议工具——用于仓库知识图谱的构建*）。 | 描述系统的整体意图，影响哪些管线阶段被激活。 |
| `responsibility` | 此配置驱动的主要产出（例如 *在 `.spine` 目录下生成机器可读的语义合约及派生文档*）。 | 影响下游文档生成方向；配置不当会导致产出不相关或损坏。 |
| `modules` | 源代码目录列表及其职责。每个条目包含 `directory`、`role` 和 `childCount`。 | `childCount` 有助于分配索引资源并检测结构变化。遗漏或错标模块会导致索引不完整或资源分配异常。 |
| `provenance` | 记录索引何时构建（`indexedAt`）、如何构建（`generatorVersion`）以及经过哪些管线阶段（例如 `["ast", "llm"]`）。 | 对缓存失效和审计追踪至关重要。`indexedAt` 必须是有效的 ISO 8601 时间戳；`generatorVersion` 必须匹配当前工具版本。 |

### 来自支持上下文的示例

```yaml
projectName: archspine
schemaVersion: "1.0.0"
role: "语义索引与协议工具——用于仓库知识图谱的构建。"
modules:
  - directory: src
    role: "运行时与索引管线实现。"
    childCount: 14
  - directory: docs
    role: "规范与策略资产。"
    childCount: 4
provenance:
  indexedAt: "2026-04-02T10:00:00Z"
  generatorVersion: "archspine/1.0.0"
  pipelineStages: ["ast", "llm"]
```

## 操作风险与稳定性注意事项

- **模式/生成器版本不匹配：** `schemaVersion` 和 `generatorVersion` 必须与 ArchSpine 生成器的实际运行时版本一致。不匹配可能悄无声息地损坏索引数据或使整个管线崩溃。
- **模块配置错误：** 错误的 `directory` 路径、角色或遗漏 `childCount` 会导致索引不完整和资源分配错误。系统依赖 `childCount` 决定为每个模块分配多少工作进程。
- **来源信息不一致：** 如果 `indexedAt` 不是有效的 ISO 时间戳，或者 `generatorVersion` 与工具不匹配，审计轨迹将不可靠，缓存失效可能无法正常工作。
- **缺失不变条件：** `modules` 数组至少需要一个条目；`projectName` 必须是非空字符串；`schemaVersion` 必须恰好是 `"1.0.0"`。违反任何一条不变条件都会阻止索引构建。

操作员应将此文件视为关键控制平面——任何更改都应经过审查、验证，并首先在非生产环境中进行测试。