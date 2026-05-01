<!-- spine-content-hash:49bdb1e8a459ea33ea853870fe982398e1c835587211fd74402825ca735f52e5 -->
# ArchSpine 发布工作流测试套件

## 角色
针对发布工作流命令（`runPublishWorkflow`）的 Vitest 测试套件。

## 主要职责
- 使用 `vi.hoisted` 和 `vi.mock` 模拟发布工作流的所有外部依赖：`syncWorkflow`、`warnIfPublishingFromLocalStrategy`、`assertPublishRuntimeBaseline`、`assertPublishSnapshotReady`、`clearAtlasStale`、`documentBackfillRun`。
- 通过共享的 `callOrder` 数组追踪模拟函数的调用顺序，以验证执行序列。
- 提供一个 `describe` 块，其中包含 `beforeEach` 钩子，在每个测试用例前重置模拟。
- 定义一个 `it` 块，使用模拟参数调用 `runPublishWorkflow` 并断言预期行为（例如调用顺序）。

## 重要不变项与排除范围
- **不变项：** 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾。
- **排除范围：** 发布工作流的实际生产实现；与真实外部服务的集成测试；UI 或 CLI 渲染逻辑。

## 最重要的导出行为
- 测试的唯一公共表面是 `runPublishWorkflow`（从 `../src/cli/commands/publish.js` 导入）。
- 测试验证编排逻辑以正确顺序调用依赖项，确保工作流序列得以保持。