export const ErrorCodes = {
  CliUsageInvalid: 'CLI_USAGE_INVALID',
  CliCommandFailed: 'CLI_COMMAND_FAILED',
  RuntimeLockAcquireFailed: 'RUNTIME_LOCK_ACQUIRE_FAILED',
  RuntimeLockActive: 'RUNTIME_LOCK_ACTIVE',
  RuntimeLockOwnerUnverifiable: 'RUNTIME_LOCK_OWNER_UNVERIFIABLE',
  RuntimeLockCorrupt: 'RUNTIME_LOCK_CORRUPT',
  RuntimeDbOpenFailed: 'RUNTIME_DB_OPEN_FAILED',
  RuntimeDbReadonly: 'RUNTIME_DB_READONLY',
  RuntimeDbInitFailed: 'RUNTIME_DB_INIT_FAILED',
  PublishRuntimeMissing: 'PUBLISH_RUNTIME_MISSING',
  PublishRuntimeBaselineIncomplete: 'PUBLISH_RUNTIME_BASELINE_INCOMPLETE',
  PublishLockActive: 'PUBLISH_LOCK_ACTIVE',
  PublishSnapshotIncomplete: 'PUBLISH_SNAPSHOT_INCOMPLETE',
  ConfigParseFailed: 'CONFIG_PARSE_FAILED',
  ManifestParseFailed: 'MANIFEST_PARSE_FAILED',
  IndexSnapshotInvalidContent: 'INDEX_SNAPSHOT_INVALID_CONTENT',
  IndexSnapshotIncompatibleSchema: 'INDEX_SNAPSHOT_INCOMPATIBLE_SCHEMA',
  LlmProviderMissing: 'LLM_PROVIDER_MISSING',
  LlmApiKeyMissing: 'LLM_API_KEY_MISSING',
  CheckExecutionFailed: 'CHECK_EXECUTION_FAILED',
  FixExecutionFailed: 'FIX_EXECUTION_FAILED',
  SyncExecutionFailed: 'SYNC_EXECUTION_FAILED',
  SyncStatusFailed: 'SYNC_STATUS_FAILED',
  InfoReportFailed: 'INFO_REPORT_FAILED',
  McpResourceInvalidUri: 'MCP_RESOURCE_INVALID_URI',
  McpResourceNotFound: 'MCP_RESOURCE_NOT_FOUND',
  McpResourceInvalidContent: 'MCP_RESOURCE_INVALID_CONTENT',
  McpContextAccessDenied: 'MCP_CONTEXT_ACCESS_DENIED',
  McpRuntimeMissing: 'MCP_RUNTIME_MISSING',
  McpRuntimeBaselineIncomplete: 'MCP_RUNTIME_BASELINE_INCOMPLETE',
  McpReadFailed: 'MCP_READ_FAILED',
  McpToolUnknown: 'MCP_TOOL_UNKNOWN',
  McpToolInvalidArguments: 'MCP_TOOL_INVALID_ARGUMENTS',
  McpToolIndexReadFailed: 'MCP_TOOL_INDEX_READ_FAILED',
  McpToolIndexInvalidContent: 'MCP_TOOL_INDEX_INVALID_CONTENT',
  McpToolExecutionFailed: 'MCP_TOOL_EXECUTION_FAILED',
} as const;

export type ArchSpineErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface ArchSpineErrorOptions {
  cause?: unknown;
  context?: Record<string, unknown>;
  exitCode?: number;
}

export class ArchSpineError extends Error {
  public readonly code: ArchSpineErrorCode;
  public readonly cause?: unknown;
  public readonly context?: Record<string, unknown>;
  public readonly exitCode: number;

  constructor(code: ArchSpineErrorCode, message: string, options: ArchSpineErrorOptions = {}) {
    super(message);
    this.name = 'ArchSpineError';
    this.code = code;
    this.cause = options.cause;
    this.context = options.context;
    this.exitCode = options.exitCode ?? 1;
  }
}

export function toArchSpineError(
  error: unknown,
  fallbackCode: ArchSpineErrorCode,
  fallbackMessage: string,
  options: ArchSpineErrorOptions = {},
): ArchSpineError {
  if (error instanceof ArchSpineError) {
    return error;
  }
  const message = error instanceof Error && error.message ? error.message : fallbackMessage;
  return new ArchSpineError(fallbackCode, message, { ...options, cause: error });
}
