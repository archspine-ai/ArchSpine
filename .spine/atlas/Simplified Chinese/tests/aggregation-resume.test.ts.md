<!-- spine-content-hash:2d2729df844ddcb000db128ec8e5b674851a01a7fe1db42054e2e856f4982a61 -->
# ArchSpine 聚合器恢复测试套件

## 角色
用于验证 Aggregator 引擎恢复功能和目录聚合需求的 Vitest 测试套件。

## 主要职责
- 创建和清理临时目录，确保测试在隔离环境中运行。
- 模拟并恢复 Vitest 模拟，保证测试之间的隔离性。
- 测试 Aggregator 的 `needsDirectoryAggregation` 方法在不同文件系统状态下的行为。
- 验证聚合任务能否正确识别需要处理的目录。

## 重要不变项与排除范围
- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾。
- 每个测试后必须通过 `afterEach` 钩子清理临时目录。
- 每个测试后必须恢复模拟，防止跨测试污染。
- **排除范围：** 与外部数据库或服务的集成测试；聚合引擎的性能或负载测试；Aggregator 之外独立工具函数的单元测试。

## 最重要的导出行为
- `describe('aggregation resume support')` — 主测试套件块。
- `afterEach(() => { vi.restoreAllMocks(); ... })` — 确保模拟清理。
- `it('should detect directories needing aggregation')` — 核心正向测试。
- `it('should handle empty directories')` — 边界情况验证。

## 架构意图
确保 Aggregator 引擎正确识别需要聚合的目录，支持 ArchSpine 镜像系统中的恢复功能。