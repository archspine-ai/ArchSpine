<!-- spine-content-hash:1a1308272f006dd420efe7f0c7bf5a3bcc0d3dc00a2901b513f50ae938fadc95 -->
# PostCommitDerivationTask — 源文件摘要

**角色：** 管道阶段任务，负责在提交后编排视图、聚合和反向索引的派生工作。

**主要职责：**
- 通过 `TaskRunner` 按顺序编排 `AggregationTask`、`ReverseIndexingTask` 和 `ViewDerivationTask` 的执行。
- 在派生之前使用 `ViewService.clearViewArtifacts` 清除过期的视图工件。
- 遍历 `VIEW_DEFINITIONS` 以派生每个视图的工件。
- 作为 ArchSpine 管道的提交后阶段，消费 `CommitStageOutput` 并产生 `void`。

**重要不变性：**
- 必须在提交阶段成功完成后执行。
- 必须在运行派生任务之前清除视图工件，以避免状态过时。
- 必须按定义顺序运行子任务：先聚合，再反向索引，最后视图派生。

**排除范围（不负责）：**
- 不处理 CLI 命令解析或用户输入。
- 不实现单独的聚合、索引或视图派生逻辑。
- 不管理数据库连接或模式迁移。
- 不执行身份验证或授权。

**最重要的导出/外部可见行为：**
- `PostCommitDerivationTask`（类，继承自 `SpineTask<CommitStageOutput, void>`）
- `name` 属性：`'Post-Commit Derivation'`
- `checkpointId` 属性：`'post-commit-derivation'`