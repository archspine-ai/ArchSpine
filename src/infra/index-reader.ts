import * as fs from 'fs';
import * as path from 'path';
import { ErrorCodes } from '../core/errors.js';
import { CURRENT_SCHEMA_VERSION, type SchemaVersion } from '../types/protocol.js';

export type IndexReadResult<T> =
  | {
      status: 'ok';
      fullPath: string;
      relativePath: string;
      data: T;
      schemaVersion: SchemaVersion;
    }
  | {
      status: 'missing';
      fullPath: string;
      relativePath: string;
      message: string;
    }
  | {
      status: 'invalid-json';
      fullPath: string;
      relativePath: string;
      message: string;
      reason: string;
    }
  | {
      status: 'incompatible-schema';
      fullPath: string;
      relativePath: string;
      message: string;
      schemaVersion?: string;
      expectedSchemaVersion: SchemaVersion;
    };

const reportedIssues = new Set<string>();

function buildRelativePath(rootDir: string, fullPath: string): string {
  return path.relative(rootDir, fullPath) || fullPath;
}

function describeSchemaVersion(schemaVersion: unknown): string | undefined {
  return typeof schemaVersion === 'string' ? schemaVersion : undefined;
}

export function readIndexDocument<T extends { schemaVersion?: unknown }>(
  rootDir: string,
  fullPath: string,
): IndexReadResult<T> {
  const relativePath = buildRelativePath(rootDir, fullPath);

  if (!fs.existsSync(fullPath)) {
    return {
      status: 'missing',
      fullPath,
      relativePath,
      message: `${relativePath} is missing.`,
    };
  }

  let parsed: T;
  try {
    parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      status: 'invalid-json',
      fullPath,
      relativePath,
      reason,
      message:
        `[${ErrorCodes.IndexSnapshotInvalidContent}] Failed to parse indexed artifact ${relativePath}. ` +
        `Run 'spine build' to rebuild the local snapshot. Reason: ${reason}`,
    };
  }

  const schemaVersion = describeSchemaVersion(parsed?.schemaVersion);
  if (schemaVersion === CURRENT_SCHEMA_VERSION) {
    return {
      status: 'ok',
      fullPath,
      relativePath,
      data: parsed,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
  }

  const actual = schemaVersion ? `"${schemaVersion}"` : 'an unsupported schemaVersion';
  return {
    status: 'incompatible-schema',
    fullPath,
    relativePath,
    schemaVersion,
    expectedSchemaVersion: CURRENT_SCHEMA_VERSION,
    message:
      `[${ErrorCodes.IndexSnapshotIncompatibleSchema}] Indexed artifact ${relativePath} uses ${actual}, ` +
      `but this build expects "${CURRENT_SCHEMA_VERSION}". Run 'spine build' to rebuild the local snapshot.`,
  };
}

export function reportIndexReadIssueOnce(
  logger: (message: string) => void,
  result: Exclude<IndexReadResult<unknown>, { status: 'ok' | 'missing' }>,
): void {
  const discriminator =
    result.status === 'invalid-json' ? result.reason : result.schemaVersion || 'missing';
  const key = `${result.status}:${result.relativePath}:${discriminator}`;
  if (reportedIssues.has(key)) {
    return;
  }
  reportedIssues.add(key);
  logger(result.message);
}

export function isIndexReadFailure<T>(
  result: IndexReadResult<T>,
): result is Exclude<IndexReadResult<T>, { status: 'ok' | 'missing' }> {
  return result.status === 'invalid-json' || result.status === 'incompatible-schema';
}

export function isCompatibleIndexDocument<T>(
  result: IndexReadResult<T>,
): result is Extract<IndexReadResult<T>, { status: 'ok' }> {
  return result.status === 'ok';
}
