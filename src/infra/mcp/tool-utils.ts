import * as path from 'path';
import { ArchSpineError, ErrorCodes } from '../../core/errors.js';

/**
 * Validate a filePath received from MCP tool input. Rejects null bytes,
 * absolute paths, and path traversal (..) segments. Returns the normalized
 * relative path on success.
 */
export function normalizeToolFilePath(toolName: string, rawPath: string): string {
  if (rawPath.includes('\0')) {
    throw new ArchSpineError(
      ErrorCodes.McpToolInvalidArguments,
      `Tool '${toolName}' received a filePath with null bytes.`,
      { context: { toolName, rawPath } },
    );
  }

  const normalizedSeparators = rawPath.replace(/\\/g, '/').trim();
  if (
    normalizedSeparators.length === 0 ||
    path.posix.isAbsolute(normalizedSeparators) ||
    path.win32.isAbsolute(rawPath)
  ) {
    throw new ArchSpineError(
      ErrorCodes.McpToolInvalidArguments,
      `Tool '${toolName}' requires a non-empty relative filePath.`,
      { context: { toolName, rawPath } },
    );
  }

  const normalizedPath = path.posix.normalize(normalizedSeparators);
  if (normalizedPath === '.' || normalizedPath === '') {
    throw new ArchSpineError(
      ErrorCodes.McpToolInvalidArguments,
      `Tool '${toolName}' requires a non-empty relative filePath.`,
      { context: { toolName, rawPath } },
    );
  }

  if (normalizedPath.split('/').some((segment) => segment === '..')) {
    throw new ArchSpineError(
      ErrorCodes.McpToolInvalidArguments,
      `Tool '${toolName}' received a filePath with path traversal.`,
      { context: { toolName, rawPath, normalizedPath } },
    );
  }

  return normalizedPath;
}

/** Verify a resolved path stays within an expected parent directory. */
export function assertPathWithinParent(
  toolName: string,
  resolvedPath: string,
  parentDir: string,
): void {
  const normalizedParent = path.resolve(parentDir);
  const normalizedTarget = path.resolve(resolvedPath);
  if (
    normalizedTarget !== normalizedParent &&
    !normalizedTarget.startsWith(normalizedParent + path.sep)
  ) {
    throw new ArchSpineError(
      ErrorCodes.McpToolInvalidArguments,
      `Tool '${toolName}' resolved a filePath outside the allowed directory.`,
      { context: { toolName, resolvedPath, parentDir } },
    );
  }
}
