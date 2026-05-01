<!-- spine-content-hash:71c124bd778b30b95c5622ad508792c41c9f8354830eb488a386ffa530bb038d -->
# ArchSpine – 执行检查点存储

## 角色
基础设施层的持久化存储，用于执行检查点状态管理、验证和文件系统 I/O。

## 主要职责
- 定义执行检查点状态（运行、阶段、项目状态和状态）的 TypeScript 类型和接口。
- 提供存储类（`ExecutionCheckpointStore`），用于从文件系统加载、保存和验证检查点状态。
- 根据预期的状态枚举和结构模式验证检查点状态的完整性。
- 通过文件系统 I/O 管理检查点状态的生命周期（初始化、更新、序列化）。

## 重要不变性与负面范围
- 必须保持为纯粹的检查点状态持久化和验证层。
- 不得吸收服务/任务/引擎编排的关注点。
- 应暴露稳定的底层能力和外观。
- **不在范围内：** 编排执行工作流或业务逻辑；直接调用扫描器或引擎运行时进程；为外部消费者提供高级 API 外观（保持为底层存储）。

## 最重要的导出/外部可见行为
- `ExecutionCheckpointStore` – 用于加载、保存和验证检查点状态的主要类。
- `ExecutionCheckpointItemState`、`ExecutionCheckpointStageState`、`ExecutionCheckpointState` – 核心状态接口。
- `ExecutionCheckpointRunStatus`、`ExecutionCheckpointStageStatus`、`ExecutionCheckpointItemStatus` – 用于验证的状态枚举。