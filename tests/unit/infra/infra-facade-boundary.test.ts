import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

interface BoundaryRule {
  internalDir: string;
  facade: string;
  allowedImporters: Set<string>;
}

function collectFiles(dirPath: string, collected: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) {
    return collected;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, collected);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.ts')) {
      collected.push(fullPath);
    }
  }

  return collected;
}

function toRepoPath(rootDir: string, absolutePath: string): string {
  return path.relative(rootDir, absolutePath).split(path.sep).join('/');
}

function extractImportSpecifiers(source: string): string[] {
  const specifiers = new Set<string>();
  const patterns = [
    /import[\s\S]*?from\s+['"]([^'"]+)['"]/g,
    /export[\s\S]*?from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier) {
        specifiers.add(specifier);
      }
    }
  }

  return Array.from(specifiers);
}

function resolveImportTarget(importerAbsPath: string, specifier: string): string | null {
  if (!specifier.startsWith('.')) {
    return null;
  }

  const baseDir = path.dirname(importerAbsPath);
  const resolved = path.resolve(baseDir, specifier);
  const candidates = [
    resolved,
    `${resolved}.ts`,
    `${resolved}.js`,
    path.join(resolved, 'index.ts'),
    path.join(resolved, 'index.js'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

function isImporterAllowed(importer: string, rule: BoundaryRule): boolean {
  if (importer === rule.facade) {
    return true;
  }

  if (rule.allowedImporters.has(importer)) {
    return true;
  }

  return importer.startsWith(`${rule.internalDir}/`);
}

describe('facade boundary', () => {
  const rootDir = process.cwd();
  const scanRoots = ['src', 'tests'];
  const rules: BoundaryRule[] = [
    {
      internalDir: 'src/infra/db',
      facade: 'src/infra/db.ts',
      allowedImporters: new Set(['tests/db-modules.test.ts']),
    },
    {
      internalDir: 'src/infra/prompt-context',
      facade: 'src/infra/prompt-context.ts',
      allowedImporters: new Set(['tests/prompt-context-modules.test.ts']),
    },
    {
      internalDir: 'src/infra/prompt',
      facade: 'src/infra/prompt.ts',
      allowedImporters: new Set([]),
    },
    {
      internalDir: 'src/infra/llm',
      facade: 'src/infra/llm.ts',
      allowedImporters: new Set(['tests/llm-provider-utils.test.ts']),
    },
    {
      internalDir: 'src/infra/config',
      facade: 'src/infra/config.ts',
      allowedImporters: new Set([]),
    },
    {
      internalDir: 'src/infra/manifest',
      facade: 'src/infra/manifest.ts',
      allowedImporters: new Set([]),
    },
    {
      internalDir: 'src/services/view',
      facade: 'src/services/view/index.ts',
      allowedImporters: new Set([]),
    },
    {
      internalDir: 'src/types/protocol',
      facade: 'src/types/protocol.ts',
      allowedImporters: new Set([]),
    },
  ];

  it('forces callers to use infra facades instead of internal submodules', () => {
    const violations: string[] = [];
    const files = scanRoots.flatMap((scanRoot) => collectFiles(path.join(rootDir, scanRoot)));

    for (const filePath of files) {
      const importer = toRepoPath(rootDir, filePath);
      const source = fs.readFileSync(filePath, 'utf8');
      const specifiers = extractImportSpecifiers(source);

      for (const specifier of specifiers) {
        const targetAbsPath = resolveImportTarget(filePath, specifier);
        if (!targetAbsPath) {
          continue;
        }

        const target = toRepoPath(rootDir, targetAbsPath);
        for (const rule of rules) {
          if (!target.startsWith(`${rule.internalDir}/`)) {
            continue;
          }

          if (target === rule.facade) {
            continue;
          }

          if (!isImporterAllowed(importer, rule)) {
            violations.push(`${importer} imports ${target}; use ${rule.facade} instead`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('keeps infra free of higher-layer orchestration imports', () => {
    const forbiddenPrefixes = ['src/cli/', 'src/services/', 'src/tasks/', 'src/engines/'];
    const violations: string[] = [];
    const infraFiles = collectFiles(path.join(rootDir, 'src', 'infra'));

    for (const filePath of infraFiles) {
      const importer = toRepoPath(rootDir, filePath);
      const source = fs.readFileSync(filePath, 'utf8');
      const specifiers = extractImportSpecifiers(source);

      for (const specifier of specifiers) {
        const targetAbsPath = resolveImportTarget(filePath, specifier);
        if (!targetAbsPath) {
          continue;
        }

        const target = toRepoPath(rootDir, targetAbsPath);
        if (forbiddenPrefixes.some((prefix) => target.startsWith(prefix))) {
          violations.push(`${importer} imports higher-layer module ${target}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
