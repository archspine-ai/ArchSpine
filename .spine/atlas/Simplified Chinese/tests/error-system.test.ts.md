<!-- spine-content-hash:226e303f29752e0dfc0758671db62e6abe56539a5db59ef0de867f58683792eb -->
# ArchSpine 错误收敛集成测试

## 角色
Vitest 集成测试套件，用于验证 ArchSpine 服务和基础设施外观模块的错误处理一致性和收敛性。

## 主要职责
- 为每个测试用例设置隔离的临时目录，确保测试隔离和干净状态。
- 验证 CheckService、FixService、SpineResources、SpineTools 和 MCPContextGate 外观模块的错误传播和处理一致性。
- 测试各个子系统是否以预期的结构和属性抛出特定的错误码（例如来自 ErrorCodes）。
- 验证错误上下文中的锁负载序列化行为，确保跨模块边界的错误报告正确。

## 重要不变项与负面范围
- **不变项：** 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：`test-file-suffix`）。
- **不涉及：** 对与错误收敛不直接相关的单个内部函数或工具进行单元测试。
- **不涉及：** 对错误处理系统进行性能或负载测试。
- **不涉及：** 对非错误代码路径或成功操作流程进行集成测试。

## 最重要的导出/外部可见行为
- `describe('error system convergence (round 1)')` — 顶层测试套件
- `beforeEach` 钩子 — 为每个测试设置隔离的临时目录
- `afterEach` 钩子 — 每个测试后清理临时目录
- `it('should propagate errors from CheckService with correct error codes')`
- `it('should propagate errors from FixService with correct error codes')`
- `it('should propagate errors from SpineResources with correct error codes')`
- `it('should propagate errors from SpineTools with correct error codes')`
- `it('should propagate errors from MCPContextGate with correct error codes')`
- `it('should serialize lock payload correctly in error contexts')`

## 架构意图
确保 ArchSpine 系统中的错误处理一致、可预测，并能在模块边界正确传播错误码和负载。