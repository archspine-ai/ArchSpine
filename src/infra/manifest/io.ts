import * as fs from 'fs';
import * as path from 'path';
import { FileStatusSnapshot } from './types.js';
import { defaultRuntimeIO } from '../runtime-io.js';

export function getManifestPath(rootDir: string): string {
  return path.join(rootDir, '.spine', 'manifest.json');
}

export function getLanguageSnapshotPath(rootDir: string): string {
  return path.join(rootDir, '.spine', 'languages.json');
}

export function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

export function readJsonFileWithWarning<T>(
  filePath: string,
  warningBuilder: (reason: string) => string,
): T | null {
  try {
    return readJsonFile<T>(filePath);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    defaultRuntimeIO.warn(warningBuilder(reason));
    return null;
  }
}

export function getFileStatusSnapshot(filePath: string): FileStatusSnapshot {
  if (!fs.existsSync(filePath)) {
    return { mtime: 0, size: 0 };
  }
  const stat = fs.statSync(filePath);
  return {
    mtime: Math.floor(stat.mtimeMs),
    size: stat.size,
  };
}
