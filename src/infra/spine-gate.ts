import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const BASELINE_FILE = path.join('.spine', 'protected-output-baseline.json');
const PROTECTED_DIRECTORIES = [
  path.join('.spine', 'index'),
  path.join('.spine', 'atlas'),
  path.join('.spine', 'view'),
];

export interface ProtectedOutputMutationReport {
  hasBaseline: boolean;
  addedPaths: string[];
  changedPaths: string[];
  removedPaths: string[];
}

interface ProtectedOutputBaseline {
  generatedAt: string;
  files: Record<string, string>;
}

export function detectProtectedOutputMutations(rootDir: string): ProtectedOutputMutationReport {
  const baseline = readBaseline(rootDir);
  if (!baseline) {
    return {
      hasBaseline: false,
      addedPaths: [],
      changedPaths: [],
      removedPaths: [],
    };
  }

  const currentFiles = collectProtectedOutputHashes(rootDir);
  const baselineFiles = filterGeneratedProtectedOutputFiles(baseline.files);

  return {
    hasBaseline: true,
    addedPaths: Object.keys(currentFiles)
      .filter((filePath) => !(filePath in baselineFiles))
      .sort(),
    changedPaths: Object.keys(currentFiles)
      .filter(
        (filePath) =>
          baselineFiles[filePath] !== undefined &&
          baselineFiles[filePath] !== currentFiles[filePath],
      )
      .sort(),
    removedPaths: Object.keys(baselineFiles)
      .filter((filePath) => !(filePath in currentFiles))
      .sort(),
  };
}

export function writeProtectedOutputBaseline(rootDir: string): void {
  const filePath = path.join(rootDir, BASELINE_FILE);
  const baseline: ProtectedOutputBaseline = {
    generatedAt: new Date().toISOString(),
    files: collectProtectedOutputHashes(rootDir),
  };

  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(baseline, null, 2));
}

export function formatProtectedOutputMutationWarning(
  report: ProtectedOutputMutationReport,
): string | null {
  if (!report.hasBaseline) {
    return null;
  }

  const totalChanges =
    report.addedPaths.length + report.changedPaths.length + report.removedPaths.length;
  if (totalChanges === 0) {
    return null;
  }

  const preview = [...report.changedPaths, ...report.addedPaths, ...report.removedPaths]
    .slice(0, 5)
    .join(', ');
  return (
    `[Spine Gate] Protected output violation detected in generated artifacts (.spine/index or .spine/atlas). ` +
    `Changed=${report.changedPaths.length}, Added=${report.addedPaths.length}, Removed=${report.removedPaths.length}. ` +
    `Examples: ${preview}`
  );
}

function readBaseline(rootDir: string): ProtectedOutputBaseline | null {
  const filePath = path.join(rootDir, BASELINE_FILE);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as ProtectedOutputBaseline;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.files ||
      typeof parsed.files !== 'object'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function collectProtectedOutputHashes(rootDir: string): Record<string, string> {
  const hashes: Record<string, string> = {};

  for (const relativeDir of PROTECTED_DIRECTORIES) {
    const fullDir = path.join(rootDir, relativeDir);
    if (!fs.existsSync(fullDir)) {
      continue;
    }

    walkDirectory(fullDir, (filePath) => {
      const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
      hashes[relativePath] = hashFile(filePath);
    });
  }

  return hashes;
}

function filterGeneratedProtectedOutputFiles(
  files: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).filter(([relativePath]) => isGeneratedProtectedOutput(relativePath)),
  );
}

function isGeneratedProtectedOutput(relativePath: string): boolean {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  return PROTECTED_DIRECTORIES.some((protectedDir) => {
    const normalizedDir = protectedDir.replace(/\\/g, '/');
    return normalizedPath === normalizedDir || normalizedPath.startsWith(`${normalizedDir}/`);
  });
}

function walkDirectory(dirPath: string, onFile: (filePath: string) => void): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(fullPath, onFile);
    } else if (entry.isFile()) {
      onFile(fullPath);
    }
  }
}

function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
