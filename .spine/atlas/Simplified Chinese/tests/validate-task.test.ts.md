<!-- spine-content-hash:8cd208a9bf639b63ae364b3c7d90f92eae8543475933bb5419e7dc21ed7d3119 -->
# ValidationTask 单元测试套件

## 角色
针对 `ValidationTask` 类的 Vitest 单元测试套件，验证其文件选择与摘要生成逻辑。

## 主要职责
- 使用 `fs.mkdtempSync` 为每个测试用例创建独立的临时目录。
- 搭建模拟文件结构，调用 `ValidationTask.execute` 测试文件过滤与摘要输出。
- 验证任务能根据选择条件正确过滤文件，并返回预期的摘要统计信息。
- 测试结束后使用 `fs.rmSync` 清理临时目录。

## 重要不变项与排除范围
- **不变项：** 测试文件必须以 `.test.ts` 或 `.spec.ts` 后缀结尾（规则：`test-file-suffix`）。
- **排除范围：** 完整验证管线的集成或端到端测试；超出临时目录范围的外部文件系统副作用测试；`ValidationTask` 的性能或负载测试。

## 公开接口（导出/外部可见行为）
- `describe('ValidationTask', ...)`
- `beforeEach` 钩子
- `afterEach` 钩子
- `it('should return summary with correct counts', ...)`
- `it('should filter files based on selection criteria', ...)`

## 变更意图
- **架构意图：** 为 `ValidationTask` 提供专注且隔离的单元测试套件，确保在受控的临时环境中文件选择与摘要生成的正确性。
- **近期变更：** 开源发布（v1.0.0）的初始提交——该测试文件作为初始代码库的一部分被包含。