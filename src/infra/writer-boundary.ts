import * as fs from 'fs';
import * as path from 'path';

const PROTECTED_DIRECTORIES = [path.join('.spine', 'index'), path.join('.spine', 'view')];

const PROTECTED_FILE_PREFIXES: string[] = [];

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
  } catch (err: any) {
    // Best effort only. On unsupported platforms/filesystems this may fail.
    if (targetPath.includes('cache.db')) {
      process.stderr.write(
        `[WriterBoundary] chmod ${mode.toString(8)} failed for ${targetPath}: ${err?.message ?? err}\n`,
      );
    }
  }
}

function walkFilesRecursively(
  dirPath: string,
  visitor: (fullPath: string, isDirectory: boolean) => void,
): void {
  const visited = new Set<string>();
  const walk = (currentDir: string): void => {
    let realPath: string;
    try {
      realPath = fs.realpathSync(currentDir);
    } catch {
      return; // Broken symlink, skip
    }
    if (visited.has(realPath)) {
      return; // Already visited — prevents symlink cycles
    }
    visited.add(realPath);

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isSymbolicLink()) {
        continue; // Skip symlinks to avoid cycles and out-of-tree traversal
      }
      if (entry.isDirectory()) {
        walk(fullPath);
        visitor(fullPath, true);
      } else if (entry.isFile()) {
        visitor(fullPath, false);
      }
    }
  };
  walk(dirPath);
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
  // Proactively lock first to repair any residual unlocked state from a prior crash.
  // This is idempotent — if files are already locked the chmod is a no-op.
  boundary.lockProtectedOutputs();
  boundary.unlockProtectedOutputs();
  try {
    return await operation();
  } finally {
    boundary.lockProtectedOutputs();
  }
}
