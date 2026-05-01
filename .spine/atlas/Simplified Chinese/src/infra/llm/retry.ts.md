<!-- spine-content-hash:5f1cea756b3d4e7a6175104ff81f3970b356d0e580746ba69d3049ce4e80168b -->
# 重试工具

## 角色
基础设施工具，提供可配置的指数退避重试逻辑，用于弹性异步操作。

## 主要职责
- 定义 `RetryOptions` 接口，用于配置重试行为（`maxRetries`、`initialDelayMs`、`onRetry` 回调）。
- 实现 `withRetry` 函数，包装异步函数并在临时网络/套接字错误时重试。
- 提供 `isRetryableError` 谓词，基于错误消息模式（如 ECONNRESET、ETIMEDOUT、套接字错误）识别可重试错误。
- 在重试尝试之间应用带抖动的指数退避延迟。

## 重要不变性与负面范围
- 重试逻辑仅应用于由 `isRetryableError` 识别的临时网络/套接字错误。
- `withRetry` 函数不得修改原始函数的返回类型或行为，除了在失败时重试。
- 必须在重试尝试之间应用带抖动的指数退避，以避免惊群问题。
- **不**处理不可重试的错误或应用程序级异常。
- **不**管理跨多次调用的重试状态，也不提供断路器模式。
- **不**集成任何日志或监控框架，仅提供可选的 `onRetry` 回调。

## 公开接口
- `RetryOptions`
- `isRetryableError`
- `withRetry`