<!-- spine-content-hash:741ad1a0fca2030fd6caa3c5eeab135f62d359202ab6f0ebb31894abad9e66fd -->
# ArchSpine 任务状态单元测试

## 角色
ArchSpine 核心任务状态管理、运行时缓存和遥测统计的 Vitest 单元测试套件。

## 主要职责
- 测试任务状态对象的创建、重置和工件状态（`createTaskState`、`resetTaskState`、`createTaskArtifactsState`）。
- 验证遥测统计累积和阶段指标记录（`recordTaskStageMetric`、`incrementTaskFailed`、`incrementTaskSkipped`）。
- 验证运行时缓存在骨架、不支持文件和待提交提交方面的行为。
- 确保任务使用跟踪和提交排队功能正确运行（`addTaskUsage`、`queueTaskCommit`）。

## 不涉及范围
- 完整流水线执行的集成测试。
- CLI 命令的端到端测试。
- 任务状态操作的性能或负载测试。

## 重要不变规则
- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：`test-file-suffix`）。

## 公开接口
- `describe('task-state')`
- `beforeEach`
- `afterEach`
- `it('should create task state')`
- `it('should reset task state')`
- `it('should create task artifacts state')`
- `it('should record stage metrics')`
- `it('should increment failed tasks')`
- `it('should increment skipped tasks')`
- `it('should handle runtime cache')`
- `it('should track task usage')`
- `it('should queue task commits')`