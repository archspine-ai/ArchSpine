import * as fs from 'fs';
import * as path from 'path';
import {
  AGENT_BLOCK_END,
  AGENT_BLOCK_START,
  ARCHSPINE_AGENT_BLOCK,
  ARCHSPINE_PACKAGE_SCRIPTS,
  ArtifactStrategy,
  DISTRIBUTABLE_GITATTRIBUTES_LINES,
  DISTRIBUTABLE_GITIGNORE_LINES,
  GITATTRIBUTES_BLOCK_END,
  GITATTRIBUTES_BLOCK_START,
  GITIGNORE_BLOCK_END,
  GITIGNORE_BLOCK_START,
  LOCAL_GITIGNORE_LINES,
  SEARCH_IGNORE_CONTENT,
  SEARCH_IGNORE_LINES,
  SEARCH_IGNORE_PATH,
  SPINEIGNORE_BLOCK_END,
  SPINEIGNORE_BLOCK_START,
  SPINEIGNORE_PATH,
  SPINEIGNORE_RECOMMENDED_LINES,
} from './agent-instructions.templates.js';

export type AgentInstructionsSyncStatus = 'created' | 'updated' | 'appended' | 'unchanged';
export type PackageScriptStatus =
  | 'updated'
  | 'unchanged'
  | 'missing-package-json'
  | 'invalid-package-json';
export type SearchIgnoreSyncStatus = 'created' | 'updated' | 'unchanged';
export type SpineIgnoreSyncStatus = 'created' | 'updated' | 'appended' | 'unchanged';
export type GitIgnoreSyncStatus = 'created' | 'updated' | 'appended' | 'unchanged';
export type GitAttributesSyncStatus = 'created' | 'updated' | 'appended' | 'unchanged';
export type AgentInstructionsRemovalStatus = 'deleted' | 'updated' | 'unchanged' | 'not-found';
export type SearchIgnoreRemovalStatus = 'deleted' | 'updated' | 'unchanged' | 'not-found';
export type SpineIgnoreRemovalStatus = 'deleted' | 'updated' | 'unchanged' | 'not-found';
export type GitIgnoreRemovalStatus = 'deleted' | 'updated' | 'unchanged' | 'not-found';
export type GitAttributesRemovalStatus = 'deleted' | 'updated' | 'unchanged' | 'not-found';
export type PackageScriptRemovalStatus =
  | 'updated'
  | 'unchanged'
  | 'missing-package-json'
  | 'invalid-package-json';

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeAgentInstructionsFilename(filename: string): string {
  const trimmed = filename.trim();
  return trimmed.length > 0 ? trimmed : 'AGENTS.md';
}

function getManagedBlockPattern(): RegExp {
  return new RegExp(
    `${escapeForRegExp(AGENT_BLOCK_START)}[\\s\\S]*?${escapeForRegExp(AGENT_BLOCK_END)}`,
    'm',
  );
}

function getBoundedBlockPattern(start: string, end: string): RegExp {
  return new RegExp(`${escapeForRegExp(start)}[\\s\\S]*?${escapeForRegExp(end)}`, 'm');
}

function upsertManagedBlock(
  filePath: string,
  start: string,
  end: string,
  lines: string[],
): 'created' | 'updated' | 'appended' | 'unchanged' {
  const block = [start, ...lines, end].join('\n');

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${block}\n`, 'utf-8');
    return 'created';
  }

  const current = fs.readFileSync(filePath, 'utf-8');
  const pattern = getBoundedBlockPattern(start, end);
  if (pattern.test(current)) {
    const next = current.replace(pattern, block);
    if (next !== current) {
      fs.writeFileSync(filePath, next.endsWith('\n') ? next : `${next}\n`, 'utf-8');
      return 'updated';
    }
    return 'unchanged';
  }

  const separator = current.length === 0 || current.endsWith('\n') ? '\n' : '\n\n';
  fs.writeFileSync(filePath, `${current}${separator}${block}\n`, 'utf-8');
  return 'appended';
}

function removeManagedBlock(
  filePath: string,
  start: string,
  end: string,
  deleteManagedFile: boolean,
): 'deleted' | 'updated' | 'unchanged' | 'not-found' {
  if (!fs.existsSync(filePath)) {
    return 'not-found';
  }

  const current = fs.readFileSync(filePath, 'utf-8');
  const pattern = getBoundedBlockPattern(start, end);
  if (!pattern.test(current)) {
    return 'unchanged';
  }

  const next = current
    .replace(pattern, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (next.length === 0 && deleteManagedFile) {
    fs.unlinkSync(filePath);
    return 'deleted';
  }

  fs.writeFileSync(filePath, next.length > 0 ? `${next}\n` : '', 'utf-8');
  return 'updated';
}

export function getGitIgnoreManagedLines(strategy: ArtifactStrategy): string[] {
  return strategy === 'local' ? [...LOCAL_GITIGNORE_LINES] : [...DISTRIBUTABLE_GITIGNORE_LINES];
}

export function syncGitIgnoreFile(
  rootDir: string,
  strategy: ArtifactStrategy,
): { filePath: string; status: GitIgnoreSyncStatus } {
  const filePath = path.join(rootDir, '.gitignore');
  const status = upsertManagedBlock(
    filePath,
    GITIGNORE_BLOCK_START,
    GITIGNORE_BLOCK_END,
    getGitIgnoreManagedLines(strategy),
  );
  return { filePath, status };
}

export function removeManagedGitIgnoreFile(
  rootDir: string,
  deleteManagedFile: boolean,
): { filePath: string; status: GitIgnoreRemovalStatus } {
  const filePath = path.join(rootDir, '.gitignore');
  const status = removeManagedBlock(
    filePath,
    GITIGNORE_BLOCK_START,
    GITIGNORE_BLOCK_END,
    deleteManagedFile,
  );
  return { filePath, status };
}

export function syncGitAttributesFile(rootDir: string): {
  filePath: string;
  status: GitAttributesSyncStatus;
} {
  const filePath = path.join(rootDir, '.gitattributes');
  const status = upsertManagedBlock(
    filePath,
    GITATTRIBUTES_BLOCK_START,
    GITATTRIBUTES_BLOCK_END,
    DISTRIBUTABLE_GITATTRIBUTES_LINES,
  );
  return { filePath, status };
}

export function removeManagedGitAttributesFile(
  rootDir: string,
  deleteManagedFile: boolean,
): { filePath: string; status: GitAttributesRemovalStatus } {
  const filePath = path.join(rootDir, '.gitattributes');
  const status = removeManagedBlock(
    filePath,
    GITATTRIBUTES_BLOCK_START,
    GITATTRIBUTES_BLOCK_END,
    deleteManagedFile,
  );
  return { filePath, status };
}

export function syncAgentInstructionsFile(
  rootDir: string,
  filename: string,
): { filePath: string; status: AgentInstructionsSyncStatus } {
  const normalizedFilename = normalizeAgentInstructionsFilename(filename);
  const hostPath = path.join(rootDir, normalizedFilename);
  const blockPattern = getManagedBlockPattern();

  if (!fs.existsSync(hostPath)) {
    fs.writeFileSync(hostPath, `${ARCHSPINE_AGENT_BLOCK}\n`, 'utf-8');
    return { filePath: hostPath, status: 'created' };
  }

  const current = fs.readFileSync(hostPath, 'utf-8');
  if (blockPattern.test(current)) {
    const next = current.replace(blockPattern, ARCHSPINE_AGENT_BLOCK);
    if (next !== current) {
      fs.writeFileSync(hostPath, next.endsWith('\n') ? next : `${next}\n`, 'utf-8');
      return { filePath: hostPath, status: 'updated' };
    }
    return { filePath: hostPath, status: 'unchanged' };
  }

  const separator = current.length === 0 || current.endsWith('\n') ? '\n' : '\n\n';
  const next = `${current}${separator}${ARCHSPINE_AGENT_BLOCK}\n`;
  fs.writeFileSync(hostPath, next, 'utf-8');
  return { filePath: hostPath, status: 'appended' };
}

export function syncSearchIgnoreFile(rootDir: string): {
  filePath: string;
  status: SearchIgnoreSyncStatus;
} {
  const filePath = path.join(rootDir, SEARCH_IGNORE_PATH);
  const desired = `${SEARCH_IGNORE_CONTENT}\n`;

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, desired, 'utf-8');
    return { filePath, status: 'created' };
  }

  const current = fs.readFileSync(filePath, 'utf-8');
  if (current === desired) {
    return { filePath, status: 'unchanged' };
  }

  fs.writeFileSync(filePath, desired, 'utf-8');
  return { filePath, status: 'updated' };
}

export function syncSpineIgnoreFile(rootDir: string): {
  filePath: string;
  status: SpineIgnoreSyncStatus;
} {
  const filePath = path.join(rootDir, SPINEIGNORE_PATH);
  const status = upsertManagedBlock(
    filePath,
    SPINEIGNORE_BLOCK_START,
    SPINEIGNORE_BLOCK_END,
    SPINEIGNORE_RECOMMENDED_LINES,
  );
  return { filePath, status };
}

export function injectArchSpineScripts(rootDir: string): {
  filePath: string;
  status: PackageScriptStatus;
  addedScripts: string[];
} {
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return { filePath: packageJsonPath, status: 'missing-package-json', addedScripts: [] };
  }

  const raw = fs.readFileSync(packageJsonPath, 'utf-8');
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { filePath: packageJsonPath, status: 'invalid-package-json', addedScripts: [] };
  }

  const existingScripts =
    pkg.scripts && typeof pkg.scripts === 'object'
      ? { ...(pkg.scripts as Record<string, string>) }
      : {};
  const addedScripts: string[] = [];
  for (const [name, value] of Object.entries(ARCHSPINE_PACKAGE_SCRIPTS)) {
    if (!(name in existingScripts)) {
      existingScripts[name] = value;
      addedScripts.push(name);
    }
  }

  if (addedScripts.length === 0) {
    return { filePath: packageJsonPath, status: 'unchanged', addedScripts };
  }

  pkg.scripts = existingScripts;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
  return { filePath: packageJsonPath, status: 'updated', addedScripts };
}

export function removeManagedAgentInstructionsFile(
  rootDir: string,
  filename: string,
  deleteEmptyHostFile: boolean,
): { filePath: string; status: AgentInstructionsRemovalStatus } {
  const normalizedFilename = normalizeAgentInstructionsFilename(filename);
  const hostPath = path.join(rootDir, normalizedFilename);
  const blockPattern = getManagedBlockPattern();

  if (!fs.existsSync(hostPath)) {
    return { filePath: hostPath, status: 'not-found' };
  }

  const current = fs.readFileSync(hostPath, 'utf-8');
  if (!blockPattern.test(current)) {
    return { filePath: hostPath, status: 'unchanged' };
  }

  const next = current
    .replace(blockPattern, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (next.length === 0 && deleteEmptyHostFile) {
    fs.unlinkSync(hostPath);
    return { filePath: hostPath, status: 'deleted' };
  }

  fs.writeFileSync(hostPath, next.length > 0 ? `${next}\n` : '', 'utf-8');
  return { filePath: hostPath, status: 'updated' };
}

export function removeManagedSearchIgnoreFile(
  rootDir: string,
  deleteManagedFile: boolean,
): { filePath: string; status: SearchIgnoreRemovalStatus } {
  const filePath = path.join(rootDir, SEARCH_IGNORE_PATH);
  if (!fs.existsSync(filePath)) {
    return { filePath, status: 'not-found' };
  }

  const current = fs.readFileSync(filePath, 'utf-8');
  const trimmedCurrent = current.trim();
  if (trimmedCurrent.length === 0) {
    return { filePath, status: 'unchanged' };
  }

  if (deleteManagedFile && trimmedCurrent === SEARCH_IGNORE_CONTENT) {
    fs.unlinkSync(filePath);
    return { filePath, status: 'deleted' };
  }

  const managed = new Set(SEARCH_IGNORE_LINES);
  const remainingLines = current
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0 && !managed.has(line.trim()));

  if (
    remainingLines.length === current.split(/\r?\n/).filter((line) => line.trim().length > 0).length
  ) {
    return { filePath, status: 'unchanged' };
  }

  if (remainingLines.length === 0) {
    fs.unlinkSync(filePath);
    return { filePath, status: 'deleted' };
  }

  fs.writeFileSync(filePath, `${remainingLines.join('\n')}\n`, 'utf-8');
  return { filePath, status: 'updated' };
}

export function removeManagedSpineIgnoreFile(
  rootDir: string,
  deleteManagedFile: boolean,
): { filePath: string; status: SpineIgnoreRemovalStatus } {
  const filePath = path.join(rootDir, SPINEIGNORE_PATH);
  const status = removeManagedBlock(
    filePath,
    SPINEIGNORE_BLOCK_START,
    SPINEIGNORE_BLOCK_END,
    deleteManagedFile,
  );
  return { filePath, status };
}

export function removeArchSpineScripts(
  rootDir: string,
  trackedScripts: string[],
): {
  filePath: string;
  status: PackageScriptRemovalStatus;
  removedScripts: string[];
  skippedScripts: string[];
} {
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return {
      filePath: packageJsonPath,
      status: 'missing-package-json',
      removedScripts: [],
      skippedScripts: [],
    };
  }

  const raw = fs.readFileSync(packageJsonPath, 'utf-8');
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {
      filePath: packageJsonPath,
      status: 'invalid-package-json',
      removedScripts: [],
      skippedScripts: [],
    };
  }

  if (!pkg.scripts || typeof pkg.scripts !== 'object') {
    return {
      filePath: packageJsonPath,
      status: 'unchanged',
      removedScripts: [],
      skippedScripts: [],
    };
  }

  const scripts = { ...(pkg.scripts as Record<string, string>) };
  const removedScripts: string[] = [];
  const skippedScripts: string[] = [];

  for (const name of trackedScripts) {
    if (!(name in scripts)) {
      continue;
    }

    if (scripts[name] === ARCHSPINE_PACKAGE_SCRIPTS[name]) {
      delete scripts[name];
      removedScripts.push(name);
    } else {
      skippedScripts.push(name);
    }
  }

  if (removedScripts.length === 0) {
    return { filePath: packageJsonPath, status: 'unchanged', removedScripts, skippedScripts };
  }

  pkg.scripts = scripts;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
  return { filePath: packageJsonPath, status: 'updated', removedScripts, skippedScripts };
}
