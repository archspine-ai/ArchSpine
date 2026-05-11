export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  onRetry?: (error: unknown, attempt: number, maxRetries: number, delayMs: number) => void;
}

export const isRetryableError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  // Handle string errors
  const errStr = String(error).toLowerCase();

  // Check for common network/socket errors
  if (
    errStr.includes('socket') ||
    errStr.includes('und_err_socket') ||
    errStr.includes('econnreset') ||
    errStr.includes('etimedout') ||
    errStr.includes('terminated')
  ) {
    return true;
  }

  // Rate limiting
  if (errStr.includes('429') || errStr.includes('rate limit')) {
    return true;
  }

  // Server errors
  if (
    errStr.includes('500') ||
    errStr.includes('502') ||
    errStr.includes('503') ||
    errStr.includes('504')
  ) {
    return true;
  }

  // If it's an object with a status or code
  const errObj = error as { status?: number; code?: string };
  if (errObj.status && (errObj.status === 429 || errObj.status >= 500)) {
    return true;
  }

  if (errObj.code && ['ECONNRESET', 'ETIMEDOUT', 'UND_ERR_SOCKET'].includes(errObj.code)) {
    return true;
  }

  return false;
};

export const withRetry = <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
  const maxRetries = options.maxRetries ?? 1;
  const initialDelayMs = options.initialDelayMs ?? 500;

  return new Promise((resolve, reject) => {
    const attempt = async (retryCount: number) => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        if (retryCount >= maxRetries || !isRetryableError(error)) {
          reject(error);
          return;
        }

        const baseDelayMs = initialDelayMs * Math.pow(2, retryCount);
        const jitter = Math.floor(Math.random() * (baseDelayMs * 0.2)); // 20% jitter
        const delayMs = baseDelayMs + jitter;

        if (options.onRetry) {
          options.onRetry(error, retryCount + 1, maxRetries, delayMs);
        } else {
          // eslint-disable-next-line no-console -- Fallback retry log when no onRetry callback is provided
          console.warn(
            `[Retry] Operation failed (attempt ${retryCount + 1}/${maxRetries}). Retrying in ${delayMs}ms... Error: ${error instanceof Error ? error.message : String(error)}`,
          );
        }

        setTimeout(() => {
          attempt(retryCount + 1);
        }, delayMs);
      }
    };

    attempt(0);
  });
};
