# ArchSpine 配置摘要

该配置文件定义 ArchSpine 仓库中某个源目录的结构化元数据与索引来源信息。它告诉系统如何解释该文件夹的内容，为目录分配高层职责，并记录索引过程中所应用的各个处理阶段。

## 配置控制内容

- **schemaVersion** – 控制与 ArchSpine 解析器的兼容性。使用不支持的版本可能导致错误。
- **directory** – 指定所描述目录的相对路径。该目录必须真实存在，否则索引可能失败。示例中为 `src`。
- **role** – 对目录用途的自然语言描述。示例中为“核心应用模块容器”。AI 代理通过此字段理解上下文。
- **responsibility** – 目录负责的高层声明。示例中为“组合实现仓库索引管道的源文件”。
- **children** – 文件条目数组。每个条目的完整性直接影响下游索引与查询。本例包含 `src/auth.ts` 和 `src/sync.ts`，各自有独立角色，且 `fileKind` 均为 `source`。
- **filePath** – 文件相对于目录的路径。必须有效且可访问。
- **fileKind** – 对文件类型进行分类（例如 `source`）。取值错误可能导致解析器失效。
- **provenance** – 元数据块，证明该配置的生成时间与生成方式。缺失字段可能引发信任问题。
  - **indexedAt** – 索引运行的时间戳；用于缓存失效和新鲜度检查。
  - **generatorVersion** – 生成此文件的 ArchSpine 工具版本；确保与管道的兼容性。
  - **pipelineStages** – 已应用的处理阶段列表（例如 `ast`、`llm`）。阶段性缺失表明索引不完整。

## 不变约束

- 所有 `children` 条目必须指定有效的 `filePath` 和 `fileKind`。
- `fileKind` 的值必须是已识别的种类之一（例如 `source`）。
- `provenance` 块必须包含 `indexedAt`、`generatorVersion` 和 `pipelineStages` 以确保可追溯性。
- `directory` 的值必须对应仓库中真实存在的目录。
- `schemaVersion` 必须匹配支持的版本（例如 `1.0.0`）。

## 运行风险与稳定性说明

本配置文件是索引管道的结构性锚点。如果 `role` 或 `responsibility` 字段缺失或不准确，AI 代理可能误判模块用途，导致错误的建议。`children` 列表必须与实际文件系统保持同步——过时的条目会造成索引不匹配。`generatorVersion` 等来源字段可防止管道版本漂移；忽略这些字段可能引发静默不兼容问题。总体而言，该文件在自动生成时风险较低，但手动编辑时应对照模式进行验证，以避免静默失败。

---