import { ArchSpineError, ErrorCodes } from '../../core/errors.js';

export function mapRuntimeDbError(
  error: unknown,
  stage: 'open' | 'init',
  dbPath: string,
): ArchSpineError {
  if (error instanceof ArchSpineError) {
    return error;
  }

  const reason = error instanceof Error ? error.message : String(error);
  const normalizedReason = reason.toLowerCase();
  const isReadonly =
    normalizedReason.includes('readonly') ||
    normalizedReason.includes('attempt to write a readonly database');
  const code = isReadonly
    ? ErrorCodes.RuntimeDbReadonly
    : stage === 'open'
      ? ErrorCodes.RuntimeDbOpenFailed
      : ErrorCodes.RuntimeDbInitFailed;

  const message = isReadonly
    ? `[Runtime DB] SQLite is read-only at ${dbPath}. Use a trusted ArchSpine write path or repair the local .spine runtime before retrying.`
    : stage === 'open'
      ? `[Runtime DB] Failed to open the local SQLite runtime at ${dbPath}. Rebuild it with 'spine build' if the file is missing or damaged.`
      : `[Runtime DB] Failed to initialize the local SQLite runtime at ${dbPath}. Rebuild it with 'spine build' if the schema or file is damaged.`;

  return new ArchSpineError(code, message, {
    cause: error,
    context: {
      dbPath,
      stage,
    },
  });
}
