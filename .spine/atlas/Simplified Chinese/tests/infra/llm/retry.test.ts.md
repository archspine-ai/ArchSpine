<!-- spine-content-hash:1a2a52856c835b1cfc53d95da9a71b4574d543090d7997957ad25dd0ef7e8392 -->
# ArchSpine – LLM 重试错误分类测试套件

## 角色
针对 LLM 重试工具的错误分类函数的 Vitest 单元测试套件。

## 主要职责
- 验证 `isRetryableError` 能正确将套接字相关错误（例如 'socket hang up'、ECONNRESET）识别为可重试。
- 验证 `isRetryableError` 能正确将 'terminated' 错误识别为可重试。
- 验证 `isRetryableError` 能正确将 HTTP 429（速率限制）错误识别为可重试。
- 验证 `isRetryableError` 能正确将 HTTP 400（错误请求）错误识别为不可重试。

## 重要不变性
- 必须从 LLM 重试模块导入 `isRetryableError` 函数。
- 必须使用 Vitest 的 describe/it/expect 断言结构。
- 测试文件后缀必须为 `.test.ts` 或 `.spec.ts`（依据架构规则）。

## 排除范围（不在范围内）
- 测试 `withRetry` 函数的重试逻辑或定时行为。
- 模拟外部 LLM API 调用或网络条件。
- 验证超出可重试性分类的错误消息或格式。

## 最重要的导出行为
该测试套件验证 `isRetryableError` 函数正确分类错误为可重试或不可重试的能力，确保 LLM 错误处理的可靠性。