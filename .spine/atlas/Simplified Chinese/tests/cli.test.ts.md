<!-- spine-content-hash:94c4303239e7a22fed06d906d126a87c9fee01aa5541211c33da69d31a3ff205 -->
# ArchSpine 端到端集成测试套件

## 角色
ArchSpine CLI 命令工作流和服务编排的 Vitest 端到端集成测试套件，验证真实的命令行行为和引擎交互。

## 主要职责
- 为每个测试用例设置隔离的临时目录，避免副作用。
- 通过自定义的 `E2EMockClient` 模拟 LLM 客户端，以模拟成功和失败场景，测试鲁棒性。
- 通过 `child_process.execSync` 执行 ArchSpine CLI 命令，验证真实的命令行行为。
- 验证核心引擎（check、fix、usage）与同步工作流之间的交互。

## 重要不变性与负面范围
- **不变性：** 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：test-file-suffix）。
- **不涉及范围：**
  - 对单个函数或模块的单元测试。
  - 对非 CLI 接口或 API 端点的测试。
  - 系统的性能或负载测试。

## 最重要的导出/外部可见行为
- `E2EMockClient` 类（实现 `LLMClient`）——用于在测试中模拟 LLM 响应。
- CLI 命令和引擎交互的测试用例——验证从命令执行到引擎编排的完整工作流。

## 架构意图
提供一个全面的端到端测试套件，验证完整的 CLI 工作流，确保 check、fix、usage 和 sync 引擎在真实的命令行环境中正确协同工作。

## 近期变更意图
解决 lint 错误并完成 v1.0 前的流水线修复，确保测试套件干净可靠。