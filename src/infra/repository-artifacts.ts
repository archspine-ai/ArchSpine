import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

export interface ManagedBlockMarkers {
  start: string;
  end: string;
}

export function readManagedFileBlock(
  filePath: string,
  markers: ManagedBlockMarkers,
): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const startIdx = content.indexOf(markers.start);
  const endIdx = content.indexOf(markers.end);
  if (startIdx === -1 || endIdx === -1) {
    return null;
  }

  return content.slice(startIdx, endIdx + markers.end.length);
}

export function managedBlockIncludesAll(block: string | null, requiredEntries: string[]): boolean {
  if (block === null) {
    return false;
  }
  return requiredEntries.every((entry) => block.includes(entry));
}

export function listTrackedSnapshotFiles(rootDir: string): string[] {
  try {
    const output = execFileSync(
      'git',
      [
        'ls-files',
        '--cached',
        '--',
        '.spine/index',
        '.spine/manifest.json',
        '.spine/languages.json',
        '.spine/diagnostics',
      ],
      {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    );

    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch {
    return [];
  }
}

export function snapshotOutputsPresent(rootDir: string): boolean {
  const spineDir = path.join(rootDir, '.spine');
  return (
    fs.existsSync(path.join(spineDir, 'index', 'project.json')) ||
    fs.existsSync(path.join(spineDir, 'manifest.json')) ||
    fs.existsSync(path.join(spineDir, 'languages.json'))
  );
}
