import * as fs from 'fs';
import * as path from 'path';
import { OutputManager } from '../infra/output.js';
import { FileKind, SpineFolderUnit, SpineProjectUnit, SpineUnit } from '../types/protocol.js';
import {
  isCompatibleIndexDocument,
  readIndexDocument,
  reportIndexReadIssueOnce,
} from '../infra/index-reader.js';

type FileLedgerEntry = {
  path: string;
  kind: FileKind;
  role: string;
  responsibilities: string[];
  outOfScope: string[];
  invariants: string[];
  publicSurface: string[];
  dependsOn: string[];
  driftDetected: boolean;
};

export function runGodMode(rootDir: string): { outputPath: string } {
  const indexRoot = path.join(rootDir, '.spine', 'index');
  if (!fs.existsSync(indexRoot)) {
    throw new Error('God mode requires an existing .spine/index. Run `spine sync` first.');
  }

  const dossier = buildDossier(rootDir, indexRoot);
  const outputManager = new OutputManager({ rootDir });
  const fileName = `${path.basename(rootDir)}-god.md`;
  outputManager.saveGodDoc(fileName, dossier);
  return { outputPath: path.join(rootDir, '.spine', fileName) };
}

function buildDossier(rootDir: string, indexRoot: string): string {
  const projectUnit = readJson<SpineProjectUnit>(path.join(indexRoot, 'project.json'), indexRoot);
  if (!projectUnit) {
    throw new Error(
      'God mode requires a current .spine/index/project.json snapshot. Run `spine build` first.',
    );
  }
  const folderUnits = readFolderUnits(indexRoot);
  const fileUnits = readFileUnits(indexRoot);
  const fileLedger = fileUnits.map(toLedgerEntry).sort((a, b) => a.path.localeCompare(b.path));

  const countsByKind = countBy(fileLedger.map((entry) => entry.kind));
  const totalResponsibilities = fileLedger.reduce(
    (sum, entry) => sum + entry.responsibilities.length,
    0,
  );
  const totalDependencies = fileLedger.reduce((sum, entry) => sum + entry.dependsOn.length, 0);

  const lines: string[] = [];
  lines.push('# God Mode Dossier');
  lines.push('');
  lines.push('> Human-only, non-production output.');
  lines.push('> Joke mode output: a single-file giant repository dossier.');
  lines.push('');
  lines.push('## Snapshot');
  lines.push(`- Project: ${projectUnit?.projectName || path.basename(rootDir)}`);
  lines.push(`- Files parsed: ${fileLedger.length}`);
  lines.push(`- Folders parsed: ${folderUnits.length}`);
  lines.push(`- Total responsibilities recorded: ${totalResponsibilities}`);
  lines.push(`- Total dependency edges recorded: ${totalDependencies}`);
  lines.push('');
  lines.push('### File kinds');
  for (const kind of ['source', 'config', 'document', 'other', 'folder'] as FileKind[]) {
    lines.push(`- ${kind}: ${countsByKind.get(kind) || 0}`);
  }
  lines.push('');

  if (projectUnit) {
    lines.push('## Project Summary');
    lines.push(`- Role: ${projectUnit.role || 'n/a'}`);
    lines.push(`- Responsibility: ${projectUnit.responsibility || 'n/a'}`);
    lines.push('');
    if (projectUnit.modules.length > 0) {
      lines.push('### Modules');
      for (const module of projectUnit.modules
        .slice()
        .sort((a, b) => a.directory.localeCompare(b.directory))) {
        lines.push(`- ${module.directory || '/'}: ${module.role} (${module.childCount} files)`);
      }
      lines.push('');
    }
  }

  if (folderUnits.length > 0) {
    lines.push('## Directory Ledger');
    for (const folder of folderUnits
      .slice()
      .sort((a, b) => a.directory.localeCompare(b.directory))) {
      lines.push(`### ${folder.directory || '/'}`);
      lines.push(`- Role: ${folder.role}`);
      lines.push(`- Responsibility: ${folder.responsibility}`);
      lines.push(`- Child entries: ${folder.children.length}`);
      if (folder.children.length > 0) {
        lines.push('- Children:');
        for (const child of folder.children
          .slice()
          .sort((a, b) => a.filePath.localeCompare(b.filePath))) {
          lines.push(`  - ${child.filePath} [${child.fileKind}]: ${child.role}`);
        }
      }
      lines.push('');
    }
  }

  lines.push('## File Ledger');
  for (const entry of fileLedger) {
    lines.push(`### ${entry.path}`);
    lines.push(`- Kind: ${entry.kind}`);
    lines.push(`- Role: ${entry.role}`);
    lines.push(
      `- Responsibilities: ${entry.responsibilities.length > 0 ? entry.responsibilities.join(' | ') : 'n/a'}`,
    );
    lines.push(
      `- Out of scope: ${entry.outOfScope.length > 0 ? entry.outOfScope.join(' | ') : 'n/a'}`,
    );
    lines.push(
      `- Invariants: ${entry.invariants.length > 0 ? entry.invariants.join(' | ') : 'n/a'}`,
    );
    lines.push(
      `- Public surface: ${entry.publicSurface.length > 0 ? entry.publicSurface.join(' | ') : 'n/a'}`,
    );
    lines.push(`- Depends on: ${entry.dependsOn.length > 0 ? entry.dependsOn.join(' | ') : 'n/a'}`);
    lines.push(`- Semantic change detected: ${entry.driftDetected ? 'yes' : 'no'}`);
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}

function readFileUnits(indexRoot: string): SpineUnit[] {
  const units: SpineUnit[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (
        !entry.isFile() ||
        !entry.name.endsWith('.json') ||
        entry.name === 'folder.json' ||
        entry.name === 'project.json'
      ) {
        continue;
      }

      const unit = readJson<SpineUnit>(fullPath, indexRoot);
      if (unit?.identity?.filePath) {
        units.push(unit);
      }
    }
  };

  walk(indexRoot);
  return units;
}

function readFolderUnits(indexRoot: string): SpineFolderUnit[] {
  const units: SpineFolderUnit[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.isFile() || entry.name !== 'folder.json') {
        continue;
      }

      const unit = readJson<SpineFolderUnit>(fullPath, indexRoot);
      if (unit?.directory !== undefined) {
        units.push(unit);
      }
    }
  };

  walk(indexRoot);
  return units;
}

function toLedgerEntry(unit: SpineUnit): FileLedgerEntry {
  return {
    path: unit.identity.filePath,
    kind: unit.identity.fileKind,
    role: unit.semantic.role,
    responsibilities: unit.semantic.responsibilities || [],
    outOfScope: unit.semantic.outOfScope || [],
    invariants: (unit.semantic.invariants || []).map((item) => `${item.id}: ${item.description}`),
    publicSurface: (unit.semantic.publicSurface || []).map(
      (item) => `${item.symbolName}: ${item.description}`,
    ),
    dependsOn: (unit.graph?.dependsOn || []).map((edge) => edge.targetPath),
    driftDetected: Boolean(unit.semantic.driftDetected),
  };
}

function countBy(values: FileKind[]): Map<FileKind, number> {
  const map = new Map<FileKind, number>();
  for (const value of values) {
    map.set(value, (map.get(value) || 0) + 1);
  }
  return map;
}

function readJson<T extends { schemaVersion?: unknown }>(
  fullPath: string,
  indexRoot?: string,
): T | undefined {
  const rootDir = indexRoot
    ? path.dirname(path.dirname(indexRoot))
    : path.dirname(path.dirname(fullPath));
  const result = readIndexDocument<T>(rootDir, fullPath);
  if (isCompatibleIndexDocument(result)) {
    return result.data;
  }
  if (result.status !== 'missing') {
    // eslint-disable-next-line no-console -- Index read diagnostics
    reportIndexReadIssueOnce((message) => console.warn(message), result);
  }
  return undefined;
}
