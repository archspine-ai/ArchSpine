<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/infra","role":"This directory contains test suites for validating index-based recovery and LLM retry mechanisms.","responsibility":"Collectively, these tests ensure the ArchSpine system can recover from corrupted index states and correctly classify LLM errors for retry logic, maintaining data integrity and robust error handling.","children":[{"filePath":"tests/infra/index-recovery.test.ts","role":"Vitest test suite for validating index-based resume recovery and LLM retry mechanisms in the ArchSpine system.","fileKind":"source"},{"filePath":"tests/infra/llm","role":"Test suite for the LLM retry utility's error classification function.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:51.850Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# tests/infra — 基础设施恢复与重试测试

此目录包含验证 ArchSpine 系统中两个关键基础设施行为的测试套件：**基于索引的恢复**和**LLM 重试分类**。这些测试确保系统能够优雅地从损坏的索引状态中恢复，并正确分类 LLM 错误以进行重试逻辑，从而维护数据完整性和操作稳健性。

## 重要子项

- **`index-recovery.test.ts`** — 一个 Vitest 测试套件，用于测试基于索引的断点恢复机制和 LLM 重试工具。这是主要的测试文件，用于验证系统能否检测并从索引损坏中恢复，以及 LLM 错误是否被正确分类以决定是否重试。
- **`llm/`** — 一个子文件夹，包含专门针对 LLM 重试工具的错误分类函数的测试。它将决定哪些 LLM 错误可重试的逻辑隔离出来，确保重试机制在各种错误条件下行为正确。

## 实现领域

此处覆盖的最重要的实现领域包括：

1. **索引恢复** — 验证系统能否检测损坏的索引状态，并从已知的良好检查点恢复处理，防止数据丢失或重复。
2. **LLM 错误分类** — 确保重试逻辑根据错误类型和上下文，正确区分可重试的临时错误和不可重试的永久错误。
3. **恢复与重试的集成** — `index-recovery.test.ts` 中的测试将两种机制结合起来，验证系统在从索引损坏中恢复后，能否在恢复的操作中正确处理后续的 LLM 错误。