<!-- spine-content-hash:6ce11b2c806693e2b6d7f7d39dcd26ba65a57b65b9f9894ea9316e6b11e5845c -->
# ArchSpine – PostCommitDerivationTask 集成测试套件

## 角色
本文件是针对 `PostCommitDerivationTask` 编排管线的 Vitest 集成测试套件，用于验证顶层任务按预期顺序协调其子任务。

## 关键职责
- 验证 `PostCommitDerivationTask.execute` 按正确顺序调用 `ReverseIndexingTask`、`AggregationTask` 和 `ViewDerivationTask`。
- 模拟依赖任务的 `execute` 方法，以隔离编排逻辑与具体实现。
- 使用 `createTaskTelemetryState` 为任务执行提供遥测上下文。
- 通过 `afterEach` 在每个测试后清理所有模拟，确保测试隔离，防止跨测试污染。

## 重要不变项与排除范围
- **不变项：**  
  - 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：`test-file-suffix`）。  
  - 每个测试后恢复所有模拟，以保持状态清洁。
- **排除范围：**  
  - 对单个任务实现（`ReverseIndexingTask`、`AggregationTask`、`ViewDerivationTask`）的单元测试。  
  - 与真实文件系统或数据库的集成测试。  
  - 对后提交派生管线中错误处理或边界情况的测试。

## 导出/外部可见行为
本文件不导出任何公共 API；它是一个由 Vitest 执行的测试套件。其主要外部行为是在模拟条件下断言编排管线按正确顺序运行子任务。