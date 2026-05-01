<!-- spine-content-hash:5f1cea756b3d4e7a6175104ff81f3970b356d0e580746ba69d3049ce4e80168b -->
# Retry Utility

## Role
Infrastructure utility providing configurable retry logic with exponential backoff for resilient asynchronous operations.

## Key Responsibilities
- Defines the `RetryOptions` interface for configuring retry behavior (`maxRetries`, `initialDelayMs`, `onRetry` callback).
- Implements the `withRetry` function that wraps an async function and retries on transient network/socket errors.
- Provides the `isRetryableError` predicate to identify retryable errors based on error message patterns (e.g., ECONNRESET, ETIMEDOUT, socket errors).
- Applies exponential backoff delay with jitter between retry attempts.

## Notable Invariants & Negative Scope
- Retry logic must only be applied to transient network/socket errors as identified by `isRetryableError`.
- The `withRetry` function must not modify the original function's return type or behavior beyond retrying on failure.
- Exponential backoff with jitter must be applied between retry attempts to avoid thundering herd problems.
- Does **not** handle non-retryable errors or application-level exceptions.
- Does **not** manage retry state across multiple calls or provide circuit breaker patterns.
- Does **not** integrate with any logging or monitoring framework beyond optional `onRetry` callback.

## Public Surface
- `RetryOptions`
- `isRetryableError`
- `withRetry`