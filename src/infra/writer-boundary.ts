import * as fs from 'fs';
import * as path from 'path';

const PROTECTED_DIRECTORIES = [
  path.join('.spine', 'index'),
  path.join('.spine', 'atlas'),
  path.join('.spine', 'view'),
];

const PROTECTED_FILE_PREFIXES = [path.join('.spine', '.lock'), path.join('.spine', 'cache.db')];

const DIRECTORY_LOCK_MODE = 0o755;
const FILE_LOCK_MODE = 0o444;
const DIRECTORY_UNLOCK_MODE = 0o755;
const FILE_UNLOCK_MODE = 0o644;

function normalizeRelative(input: string): string {
  return input.replace(/\\/g, '/');
}

function isProtectedFile(relativePath: string): boolean {
  const normalized = normalizeRelative(relativePath);
  return PROTECTED_FILE_PREFIXES.some((prefix) => {
    const normalizedPrefix = normalizeRelative(prefix);
    return (
      normalized === normalizedPrefix ||
      normalized.startsWith(`${normalizedPrefix}.`) ||
      normalized.startsWith(`${normalizedPrefix}-`)
    );
  });
}

function safeChmod(targetPath: string, mode: number): void {
  try {
    fs.chmodSync(targetPath, mode);
  } catch {
    // Best effort only. On unsupported platforms/filesystems this may fail.
  }
}

function walkFilesRecursively(
  dirPath: string,
  visitor: (fullPath: string, isDirectory: boolean) => void,
): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFilesRecursively(fullPath, visitor);
      visitor(fullPath, true);
    } else if (entry.isFile()) {
      visitor(fullPath, false);
    }
  }
}

export class SpineWriterBoundary {
  constructor(private readonly rootDir: string) {}

  public lockProtectedOutputs(): void {
    for (const relativeDir of PROTECTED_DIRECTORIES) {
      const fullDir = path.join(this.rootDir, relativeDir);
      if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) {
        continue;
      }

      walkFilesRecursively(fullDir, (fullPath, isDirectory) => {
        safeChmod(fullPath, isDirectory ? DIRECTORY_LOCK_MODE : FILE_LOCK_MODE);
      });
      safeChmod(fullDir, DIRECTORY_LOCK_MODE);
    }

    const spineDir = path.join(this.rootDir, '.spine');
    if (!fs.existsSync(spineDir) || !fs.statSync(spineDir).isDirectory()) {
      return;
    }

    const entries = fs.readdirSync(spineDir);
    for (const entry of entries) {
      const fullPath = path.join(spineDir, entry);
      if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        continue;
      }
      const relativePath = path.relative(this.rootDir, fullPath);
      if (isProtectedFile(relativePath)) {
        safeChmod(fullPath, FILE_LOCK_MODE);
      }
    }
  }

  public unlockProtectedOutputs(): void {
    const spineDir = path.join(this.rootDir, '.spine');
    if (fs.existsSync(spineDir) && fs.statSync(spineDir).isDirectory()) {
      safeChmod(spineDir, DIRECTORY_UNLOCK_MODE);
    }

    for (const relativeDir of PROTECTED_DIRECTORIES) {
      const fullDir = path.join(this.rootDir, relativeDir);
      if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) {
        continue;
      }

      safeChmod(fullDir, DIRECTORY_UNLOCK_MODE);
      walkFilesRecursively(fullDir, (fullPath, isDirectory) => {
        safeChmod(fullPath, isDirectory ? DIRECTORY_UNLOCK_MODE : FILE_UNLOCK_MODE);
      });
    }

    if (!fs.existsSync(spineDir) || !fs.statSync(spineDir).isDirectory()) {
      return;
    }

    const entries = fs.readdirSync(spineDir);
    for (const entry of entries) {
      const fullPath = path.join(spineDir, entry);
      if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        continue;
      }
      const relativePath = path.relative(this.rootDir, fullPath);
      if (isProtectedFile(relativePath)) {
        safeChmod(fullPath, FILE_UNLOCK_MODE);
      }
    }
  }
}

export async function withProtectedOutputsWriteAccess<T>(
  rootDir: string,
  operation: () => Promise<T>,
): Promise<T> {
  const boundary = new SpineWriterBoundary(rootDir);
  boundary.unlockProtectedOutputs();
  try {
    return await operation();
  } finally {
    boundary.lockProtectedOutputs();
  }
}
