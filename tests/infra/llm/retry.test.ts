import { describe, it, expect, vi } from 'vitest';
import { withRetry, isRetryableError } from '../../../src/infra/llm/retry.js';

describe('isRetryableError', () => {
  it('identifies socket reset as retryable', () => {
    expect(isRetryableError(new Error('socket hang up'))).toBe(true);
    expect(isRetryableError({ code: 'ECONNRESET' })).toBe(true);
  });

  it('identifies terminated as retryable', () => {
    expect(isRetryableError(new Error('terminated'))).toBe(true);
  });

  it('identifies rate limits 429 as retryable', () => {
    expect(isRetryableError({ status: 429 })).toBe(true);
    expect(isRetryableError(new Error('429 Too Many Requests'))).toBe(true);
  });

  it('identifies non-retryable errors correctly', () => {
    expect(isRetryableError(new Error('Bad Request: Invalid model'))).toBe(false);
    expect(isRetryableError({ status: 400 })).toBe(false);
  });
});

describe('withRetry', () => {
  it('succeeds immediately without retrying', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors and eventually succeeds', async () => {
    // Fail first time with ECONNRESET, succeed second time
    const error = new Error('read ECONNRESET');
    const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success');

    const result = await withRetry(fn, { maxRetries: 2, initialDelayMs: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('stops retrying on non-retryable errors', async () => {
    const error = new Error('Invalid Configuration 400');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { maxRetries: 3, initialDelayMs: 10 })).rejects.toThrow(
      'Invalid Configuration 400',
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('stops retrying after maxRetries', async () => {
    const error = new Error('socket disconnected');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { maxRetries: 2, initialDelayMs: 10 })).rejects.toThrow(
      'socket disconnected',
    );
    // initial + 2 retries = 3 calls
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('calls onRetry callback when provided', async () => {
    const error = new Error('terminated');
    const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success');

    const onRetry = vi.fn();

    const result = await withRetry(fn, { maxRetries: 1, initialDelayMs: 10, onRetry });
    expect(result).toBe('success');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(error, 1, 1, expect.any(Number));
  });
});
