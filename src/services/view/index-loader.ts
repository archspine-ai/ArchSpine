import * as fs from 'fs';
import * as path from 'path';
import type { RuntimeIO } from '../../infra/runtime-io.js';
import type { SpineFolderUnit, SpineProjectUnit, SpineUnit } from '../../types/protocol.js';
import {
  isCompatibleIndexDocument,
  readIndexDocument,
  reportIndexReadIssueOnce,
} from '../../infra/index-reader.js';
import type { LoadedUnit } from './types.js';

const MAX_ARCH_DIAGRAM_FOLDERS = 12;

export class ViewIndexLoader {
  private indexedUnitsCache: LoadedUnit[] | null = null;

  constructor(
    private readonly rootDir: string,
    private readonly runtimeIO?: RuntimeIO,
  ) {}

  public getIndexedUnits(): LoadedUnit[] {
    if (this.indexedUnitsCache) {
      return this.indexedUnitsCache;
    }

    this.indexedUnitsCache = this.loadIndexedUnits();
    return this.indexedUnitsCache;
  }

  public loadProjectUnit(): SpineProjectUnit | null {
    const projectPath = path.join(this.rootDir, '.spine', 'index', 'project.json');
    if (!fs.existsSync(projectPath)) {
      return null;
    }

    try {
      const result = readIndexDocument<SpineProjectUnit>(this.rootDir, projectPath);
      if (isCompatibleIndexDocument(result)) {
        return result.data;
      }
      if (result.status !== 'missing') {
        reportIndexReadIssueOnce((message) => this.runtimeIO?.warn(message), result);
      }
      return null;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.runtimeIO?.warn(`[ViewIndexLoader] Failed to load project unit: ${reason}`);
      return null;
    }
  }

  public loadFolderUnits(): SpineFolderUnit[] {
    const indexRoot = path.join(this.rootDir, '.spine', 'index');
    if (!fs.existsSync(indexRoot)) {
      return [];
    }

    const folders: SpineFolderUnit[] = [];
    const walk = (dirPath: string): void => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
          continue;
        }
        if (!entry.isFile() || entry.name !== 'folder.json') {
          continue;
        }

        const result = readIndexDocument<SpineFolderUnit>(this.rootDir, fullPath);
        if (isCompatibleIndexDocument(result)) {
          folders.push(result.data);
        } else if (result.status !== 'missing') {
          reportIndexReadIssueOnce((message) => this.runtimeIO?.warn(message), result);
        }
      }
    };

    walk(indexRoot);
    return folders
      .sort(
        (a, b) => b.children.length - a.children.length || a.directory.localeCompare(b.directory),
      )
      .slice(0, MAX_ARCH_DIAGRAM_FOLDERS);
  }

  private loadIndexedUnits(): LoadedUnit[] {
    const indexRoot = path.join(this.rootDir, '.spine', 'index');
    if (!fs.existsSync(indexRoot)) {
      return [];
    }

    const loaded: LoadedUnit[] = [];
    const walk = (dirPath: string): void => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
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

        const result = readIndexDocument<SpineUnit>(this.rootDir, fullPath);
        if (isCompatibleIndexDocument(result)) {
          const unit = result.data;
          loaded.push({
            unit,
            lineCount: this.countLines(unit.identity.filePath),
          });
        } else if (result.status !== 'missing') {
          reportIndexReadIssueOnce((message) => this.runtimeIO?.warn(message), result);
        }
      }
    };

    walk(indexRoot);
    return loaded;
  }

  private countLines(relativeFilePath: string): number {
    const fullPath = path.join(this.rootDir, relativeFilePath);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      return 0;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.length === 0) {
      return 0;
    }
    return content.split('\n').length;
  }
}
