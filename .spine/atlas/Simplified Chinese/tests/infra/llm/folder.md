<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/infra/llm","role":"Test suite for the LLM retry utility's error classification function.","responsibility":"Validates that the `isRetryableError` function correctly classifies various error types as retryable or non-retryable, ensuring robust error handling for LLM interactions.","children":[{"filePath":"tests/infra/llm/retry.test.ts","role":"Vitest unit test suite for the LLM retry utility's error classification function.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.491Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `tests/infra/llm/` — LLM 重试错误分类测试

此目录包含 LLM 重试工具核心错误分类函数的测试套件。其唯一目的是验证 `isRetryableError` 函数能否正确将各种错误类型归类为可重试或不可重试，这对于 LLM 交互中的健壮错误处理至关重要。

## 主要子模块

- **`retry.test.ts`** — 一个 Vitest 单元测试文件，用于测试错误分类逻辑。它覆盖多种错误场景，包括临时网络故障、认证错误、速率限制和内部服务器错误，验证每个错误是否被正确标记为可重试。

## 目录组织方式

此目录结构扁平：测试文件直接位于 `tests/infra/llm/` 下，没有子目录或额外配置文件。所有内容集中在一个文件中，以保持测试范围的聚焦性。

## 关键实现领域

- **错误分类覆盖** — 测试确保 LLM 重试模块处理的每种错误类型都得到恰当分类，降低将永久错误误认为可重试或将可重试错误误认为非重试的风险。
- **边界情况** — 测试套件包含自定义错误对象、嵌套原因和非标准 HTTP 状态码等边界条件，增强了分类的可靠性。
- **与 Vitest 集成** — 测试框架基于 Vitest，使用 describe/it 结构和断言工具，提供清晰可维护的测试结果。