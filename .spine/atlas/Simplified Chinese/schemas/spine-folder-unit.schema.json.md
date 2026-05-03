### ArchSpine SpineFolderUnit 配置概述

**SpineFolderUnit** 模式定义了 ArchSpine 镜像系统中一个目录的结构化表示。每个实例描述了一个文件夹的身份、用途以及它所含文件的元数据。该配置对于管理跨流水线阶段的目录单元的索引、验证和可追溯性的操作人员来说至关重要。

#### 该配置控制什么

- **结构性契约** – 每个 SpineFolderUnit 必须包含全部六个必需字段：`schemaVersion`、`directory`、`role`、`responsibility`、`children` 和 `provenance`。缺少任意一个都会导致验证失败。
- **目录身份** – `directory` 字段提供项目范围内的相对路径，将单元锚定到特定位置。
- **语义角色** – `role` 和 `responsibility` 说明了文件夹存在的原因（例如配置、源代码、文档）及其负责的内容。这些字符串必须非空，但自由格式；操作人员应采用一致的命名约定以避免混淆。
- **子文件元数据** – `children` 数组列出了该文件夹下的每个文件，每个文件包含 `filePath`、`role` 和 `fileKind`。这实现了层次一致性和基于类型的处理（例如，仅处理 `fileKind: "config"` 的文件）。
- **溯源追踪** – `provenance` 对象记录单元被索引的时间（`indexedAt` 为 ISO 时间戳）、创建该单元的工具版本（`generatorVersion`）以及处理该单元的流水线阶段（`pipelineStages` 数组）。这对于可审计性和调试至关重要。

#### 哪些参数最重要

| 参数 | 重要性 |
|------|--------|
| `directory`、`role`、`responsibility` | 定义文件夹的身份和上下文；错误的值可能误导下游工具。 |
| `children[*].filePath`、`role`、`fileKind` | 驱动自动化文件处理；缺失或不准确的条目可能使流水线中断。 |
| `provenance.indexedAt`、`generatorVersion`、`pipelineStages` | 提供单元的历史；过时或不真实的数据会破坏信任并增加取证分析的难度。 |

#### 运营风险与稳定性注意事项

1. **验证失败** – 由于模式禁止额外属性并强制执行必需字段，任何配置错误（例如属性名称拼写错误、缺少 `fileKind`）都会导致单元被拒绝。请确保所有实例都是根据最新模式（`https://archspine.dev/schema/v1.0.0/spine-folder-unit.schema.json`）生成或编写的。

2. **数据完整性失败** – 如果 `provenance` 字段未正确填写（例如错误的时间戳或生成器版本），依赖它们进行排序或信任验证的下游系统可能会产生错误结果。请将溯源字段视为一等关注事项，而非可选的注释。

3. **下游依赖** – 许多流水线阶段假定 `children` 数组是完整且准确的。不完整的列表可能导致文件被忽略；错误的 `fileKind` 可能将文件路由到错误的处理器。应在索引期间对照实际文件系统验证 `children` 数组。

4. **模式版本漂移** – `schemaVersion` 字段引用版本化的模式。使用过时的版本可能导致与新工具不兼容。始终使生成器版本与预期模式同步。

**总结**：严格遵守此模式可提高系统一致性并减少集成错误。操作人员应将每个 SpineFolderUnit 视为关键元数据记录，并在提交到任何流水线之前根据模式进行验证。