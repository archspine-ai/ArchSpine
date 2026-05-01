<!-- spine-content-hash:fcc5cb1d66cc82bc8600be18a14750168e79810d1e891bdef8980212d74f761f -->
# ArchSpine 语义漂移集成测试套件

本文件是 ArchSpine 同步系统的 **Vitest 集成测试套件**。其主要目的是验证系统能否正确检测并处理**语义漂移**——即多次同步传递中含义或意图的变化——通过跟踪 `PreviousSemanticContext` 在流水线中的传递情况。

## 主要职责

- **模拟 LLM 客户端**：使用 `DriftMockClient` 来模拟并观察 `PreviousSemanticContext` 在多次同步传递中的使用情况。
- **管理临时测试目录**：为每个测试创建隔离的环境，并在测试完成后清理。
- **执行 CLI 命令**：通过 `execSync` 在隔离环境中模拟真实的同步操作。
- **验证 SyncService 行为**：特别针对语义漂移场景，确保服务能正确传递上下文并在发生漂移时检测到。

## 重要不变性与范围限制

- **不变性**：所有测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（由 `test-file-suffix` 规则强制要求）。
- **范围外**：本套件**不**对单个 `SyncService` 方法进行单元测试，**不**测试生产环境中的 LLM 客户端实现（如 OpenAI、Anthropic），也**不**涵盖同步系统的性能或负载测试。

## 导出的公共接口

- **`DriftMockClient`** 类——用于跟踪语义上下文的模拟 LLM 客户端。
- **`generateSummary`** 方法——测试中触发摘要生成的主要入口点。

## 变更意图

架构意图是提供一个**测试框架**，确保 ArchSpine 同步流水线能通过跨传递传递 `PreviousSemanticContext` 来正确处理语义漂移。最近的变更解决了 lint 错误，并在 v1.0 版本发布前完成了流水线的最终修复。