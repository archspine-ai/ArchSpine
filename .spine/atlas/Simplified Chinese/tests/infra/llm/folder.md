<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/infra/llm","role":"Test suite for the LLM retry utility's error classification function.","responsibility":"Validates that the `isRetryableError` function correctly classifies various error types as retryable or non-retryable, ensuring robust error handling for LLM interactions.","children":[{"filePath":"tests/infra/llm/retry.test.ts","role":"Vitest unit test suite for the LLM retry utility's error classification function.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.491Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `tests/infra/llm` — LLM 重试错误分类测试

此目录包含 LLM 重试工具的错误分类函数的测试套件。其唯一目的是验证 `isRetryableError` 能否正确区分可重试与不可重试的错误类型，从而确保 LLM 交互中的错误处理稳健可靠。

## 主要子项

- **`retry.test.ts`** — 一个 Vitest 单元测试套件，用于测试错误分类逻辑。它覆盖了多种错误场景，以确认函数对每种情况返回预期的可重试性判定。

## 实现重点

最关键的区域是错误分类逻辑本身，它决定某个错误是否应触发重试。此目录中的测试直接验证该逻辑，因此对于维护 LLM 通信的可靠性至关重要。