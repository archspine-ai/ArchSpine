<!-- spine-content-hash:243b7c73c82f6983045b4b1ec981df6ff21d9e05facbee216128e1a9a00b5bde -->
# ArchSpine 执行检查点状态管理器

**角色：** 基础设施层执行检查点状态管理器，为 ArchSpine 检查点重试系统提供类型定义、验证、文件系统持久化和恢复候选推导。

**主要职责：**
- 定义运行、阶段和项目状态的 TypeScript 联合类型（例如 `ExecutionCheckpointRunStatus`）。
- 定义检查点项目、阶段和完整状态的接口（`ExecutionCheckpointState`）。
- 导出 `ExecutionCheckpointStore` 类，用于通过文件系统 I/O 加载、保存、验证和管理检查点状态。
- 提供查询状态的工具函数：`isResumableCheckpoint`、`getStageData`、`getStageItemsByStatus`。
- 提供派生函数，根据状态计算恢复/失败/检查恢复的候选文件列表。
- 根据状态枚举和结构模式验证检查点状态完整性（从 `isRecord`、`ITEM_STATUSES.has` 的使用推断）。

**不涉及范围：**
- 任务执行或服务逻辑的编排。
- 用户界面或命令行交互。
- 系统依赖注入或配置加载。

**不变量：**
- 检查点状态必须在使用前验证；无效状态应产生警告或错误。
- 文件系统操作须优雅处理 I/O 错误，不导致进程崩溃。
- 恢复候选推导必须基于检查点状态且具有确定性。

**最重要的导出行为：**
模块的公共表面包括类型 `ExecutionCheckpointRunStatus`、`ExecutionCheckpointStageStatus`、`ExecutionCheckpointItemStatus`，以及接口 `ExecutionCheckpointItemState`、`ExecutionCheckpointStageState`、`ExecutionCheckpointState`。关键函数有 `isResumableCheckpoint(state)`、`getStageData(state, stageId)`、`getStageItemsByStatus(state, stageId, statuses)`，以及三个恢复候选推导函数：`deriveSyncResumeCandidateFiles`、`deriveSyncFailedCandidateFiles`、`deriveCheckResumeCandidateFiles`。`ExecutionCheckpointStore` 类是主要持久化管理器。