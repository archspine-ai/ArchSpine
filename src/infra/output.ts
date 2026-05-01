import * as fs from 'fs';
import * as path from 'path';
import { SpineUnit, SpineFolderUnit, SpineProjectUnit } from '../types/protocol.js';
import { FileSystemManager } from '../utils/fs.js';
import { defaultRuntimeIO } from './runtime-io.js';

export interface OutputConfig {
  rootDir: string;
}

export class OutputManager {
  private rootDir: string;
  private spineDir: string;

  constructor(config: OutputConfig) {
    this.rootDir = config.rootDir;
    this.spineDir = path.join(this.rootDir, '.spine');
  }

  public saveIndex(relativeFilePath: string, data: SpineUnit): void {
    const indexPath = path.join(this.spineDir, 'index', `${relativeFilePath}.json`);
    this.ensureDir(path.dirname(indexPath));
    FileSystemManager.safeWriteFile(indexPath, JSON.stringify(data, null, 2));
  }

  public readIndex(relativeFilePath: string): SpineUnit | null {
    const indexPath = path.join(this.spineDir, 'index', `${relativeFilePath}.json`);
    if (!fs.existsSync(indexPath)) {
      return null;
    }
    try {
      const content = fs.readFileSync(indexPath, 'utf-8');
      return JSON.parse(content) as SpineUnit;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      defaultRuntimeIO.warn(`[OutputManager] Failed to read index ${relativeFilePath}: ${reason}`);
      return null;
    }
  }

  public saveFolderIndex(directory: string, data: SpineFolderUnit): void {
    const folderPath = directory === '' ? '' : directory;
    const indexPath = path.join(this.spineDir, 'index', folderPath, 'folder.json');
    this.ensureDir(path.dirname(indexPath));
    FileSystemManager.safeWriteFile(indexPath, JSON.stringify(data, null, 2));
  }

  public saveProjectIndex(data: SpineProjectUnit): void {
    const indexPath = path.join(this.spineDir, 'index', 'project.json');
    this.ensureDir(path.dirname(indexPath));
    FileSystemManager.safeWriteFile(indexPath, JSON.stringify(data, null, 2));
  }

  public saveDocs(relativeFilePath: string, locale: string, content: string): void {
    const baseName = relativeFilePath.endsWith('.md')
      ? relativeFilePath.slice(0, -3)
      : relativeFilePath;
    const docsPath = path.join(this.spineDir, 'atlas', locale, `${baseName}.md`);
    this.ensureDir(path.dirname(docsPath));
    FileSystemManager.safeWriteFile(docsPath, content);
  }

  public pruneAtlasLocales(locales: string[]): string[] {
    const atlasDir = path.join(this.spineDir, 'atlas');
    if (!fs.existsSync(atlasDir)) {
      return [];
    }

    const allowed = new Set(locales);
    const removed: string[] = [];

    for (const entry of fs.readdirSync(atlasDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (allowed.has(entry.name)) {
        continue;
      }

      fs.rmSync(path.join(atlasDir, entry.name), { recursive: true, force: true });
      removed.push(entry.name);
    }

    return removed.sort();
  }

  public saveGodDoc(fileName: string, content: string): void {
    const godPath = path.join(this.spineDir, fileName);
    this.ensureDir(path.dirname(godPath));
    FileSystemManager.safeWriteFile(godPath, content);
  }

  public saveDiagnostics(fileName: string, data: unknown): void {
    const diagnosticsPath = path.join(this.spineDir, 'diagnostics', fileName);
    this.ensureDir(path.dirname(diagnosticsPath));
    FileSystemManager.safeWriteFile(diagnosticsPath, JSON.stringify(data, null, 2));
  }

  public saveView(fileName: string, data: unknown): void {
    const viewPath = path.join(this.spineDir, 'view', fileName);
    this.ensureDir(path.dirname(viewPath));
    FileSystemManager.safeWriteFile(viewPath, JSON.stringify(data, null, 2));
  }

  public saveViewMarkdown(fileName: string, content: string): void {
    const viewPath = path.join(this.spineDir, 'view', 'pages', fileName);
    this.ensureDir(path.dirname(viewPath));
    FileSystemManager.safeWriteFile(viewPath, content);
  }

  public saveViewHtml(fileName: string, content: string): void {
    const viewPath = path.join(this.spineDir, 'view', fileName);
    this.ensureDir(path.dirname(viewPath));
    FileSystemManager.safeWriteFile(viewPath, content);
  }

  public deleteViewArtifacts(fileNames: string[]): void {
    for (const fileName of fileNames) {
      // Handle both root and pages/ for view artifacts (e.g. .json and .md)
      const isDoc = fileName.endsWith('.md');
      const subPath = isDoc ? ['view', 'pages', fileName] : ['view', fileName];
      const viewPath = path.join(this.spineDir, ...subPath);
      if (fs.existsSync(viewPath)) {
        fs.unlinkSync(viewPath);
      }
    }
  }

  public getIndexPath(relativeFilePath: string): string {
    return path.join(this.spineDir, 'index', `${relativeFilePath}.json`);
  }

  public deleteFile(relativeFilePath: string, locales: string[] = ['en-US']): void {
    const indexPath = this.getIndexPath(relativeFilePath);
    if (fs.existsSync(indexPath)) {
      fs.unlinkSync(indexPath);
    }

    for (const locale of locales) {
      const baseName = relativeFilePath.endsWith('.md')
        ? relativeFilePath.slice(0, -3)
        : relativeFilePath;
      const docsPath = path.join(this.spineDir, 'atlas', locale, `${baseName}.md`);
      if (fs.existsSync(docsPath)) {
        fs.unlinkSync(docsPath);
      }
    }
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
