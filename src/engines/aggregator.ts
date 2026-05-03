import * as fs from 'fs';
import * as path from 'path';
import {
  CURRENT_SCHEMA_VERSION,
  GENERATOR_VERSION,
  SpineUnit,
  SpineFolderUnit,
  SpineProjectUnit,
  SpineProvenance,
  FileKind,
} from '../types/protocol.js';
import type { LLMClient, UsageInfo } from '../infra/llm.js';
import { FileSystemManager } from '../utils/fs.js';
import {
  isCompatibleIndexDocument,
  readIndexDocument,
  reportIndexReadIssueOnce,
} from '../infra/index-reader.js';

// eslint-disable-next-line no-console -- Index read diagnostics use console.warn
const logIndexIssue = (message: string) => console.warn(message);

export class Aggregator {
  private rootDir: string;
  private spineIndexDir: string;
  private spineDocsDir: string;
  private llmClient: LLMClient;
  private targetLocales: string[];
  private writeAtlasDocs: boolean;

  constructor(
    rootDir: string,
    llmClient: LLMClient,
    targetLocales: string[] = ['en-US'],
    writeAtlasDocs: boolean = true,
  ) {
    this.rootDir = rootDir;
    this.spineIndexDir = path.join(rootDir, '.spine', 'index');
    this.spineDocsDir = path.join(rootDir, '.spine', 'atlas');
    this.llmClient = llmClient;
    this.targetLocales = targetLocales;
    this.writeAtlasDocs = writeAtlasDocs;
  }

  private getProvenance(): SpineProvenance {
    return {
      indexedAt: new Date().toISOString(),
      generatorVersion: GENERATOR_VERSION,
      pipelineStages: ['ast', 'llm'],
    };
  }

  public needsDirectoryAggregation(dirPath: string): boolean {
    const indexDirPath = path.join(this.spineIndexDir, dirPath);
    if (!fs.existsSync(indexDirPath)) {
      return false;
    }

    const folderJsonPath = path.join(indexDirPath, 'folder.json');
    if (!fs.existsSync(folderJsonPath)) {
      return true;
    }

    const folderMtimeMs = fs.statSync(folderJsonPath).mtimeMs;
    const entries = fs.readdirSync(indexDirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const childFolderJsonPath = path.join(indexDirPath, entry.name, 'folder.json');
        if (
          fs.existsSync(childFolderJsonPath) &&
          fs.statSync(childFolderJsonPath).mtimeMs > folderMtimeMs
        ) {
          return true;
        }
        continue;
      }

      if (
        entry.isFile() &&
        entry.name.endsWith('.json') &&
        entry.name !== 'folder.json' &&
        entry.name !== 'project.json' &&
        fs.statSync(path.join(indexDirPath, entry.name)).mtimeMs > folderMtimeMs
      ) {
        return true;
      }
    }

    return false;
  }

  public needsProjectAggregation(): boolean {
    if (!fs.existsSync(this.spineIndexDir)) {
      return false;
    }

    const projectJsonPath = path.join(this.spineIndexDir, 'project.json');
    let latestFolderMtimeMs = 0;

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const fullPath = path.join(dir, entry.name);
        const folderJsonPath = path.join(fullPath, 'folder.json');
        if (fs.existsSync(folderJsonPath)) {
          latestFolderMtimeMs = Math.max(latestFolderMtimeMs, fs.statSync(folderJsonPath).mtimeMs);
        }
        walk(fullPath);
      }
    };

    walk(this.spineIndexDir);

    if (latestFolderMtimeMs === 0) {
      return false;
    }

    if (!fs.existsSync(projectJsonPath)) {
      return true;
    }

    return latestFolderMtimeMs > fs.statSync(projectJsonPath).mtimeMs;
  }

  /**
   * Aggregate directory summaries (L2).
   */
  public async aggregateDirectory(dirPath: string): Promise<UsageInfo | undefined> {
    const indexDirPath = path.join(this.spineIndexDir, dirPath);
    if (!fs.existsSync(indexDirPath)) {
      return undefined;
    }

    const entries = fs.readdirSync(indexDirPath, { withFileTypes: true });
    const childUnits: Array<SpineUnit | SpineFolderUnit> = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const folderJsonPath = path.join(indexDirPath, entry.name, 'folder.json');
        if (fs.existsSync(folderJsonPath)) {
          const result = readIndexDocument<SpineFolderUnit>(this.rootDir, folderJsonPath);
          if (isCompatibleIndexDocument(result)) {
            childUnits.push(result.data);
          } else if (result.status !== 'missing') {
            reportIndexReadIssueOnce(logIndexIssue, result);
          }
        }
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.json') &&
        entry.name !== 'folder.json' &&
        entry.name !== 'project.json'
      ) {
        const filePath = path.join(indexDirPath, entry.name);
        const result = readIndexDocument<SpineUnit>(this.rootDir, filePath);
        if (isCompatibleIndexDocument(result)) {
          childUnits.push(result.data);
        } else if (result.status !== 'missing') {
          reportIndexReadIssueOnce(logIndexIssue, result);
        }
      }
    }

    const children = childUnits.map((content) => {
      if ('directory' in content) {
        return {
          filePath: content.directory,
          role: content.role || 'N/A',
          fileKind: 'folder' as FileKind,
        };
      } else {
        return {
          filePath: content.identity?.filePath || 'unknown',
          role: content.semantic?.role || 'N/A',
          fileKind: content.identity?.fileKind || 'other',
        };
      }
    });

    // Prepare info for LLM
    const childrenInfo = childUnits
      .map((u) => {
        if ('directory' in u) {
          return `- [Folder] ${u.directory}: ${u.role}\n  Responsibilities: ${u.responsibility || 'N/A'}`;
        } else {
          return `- [File] ${path.basename(u.identity?.filePath || 'unknown')}: ${u.semantic?.role || 'N/A'}\n  Responsibilities: ${(u.semantic?.responsibilities || []).join(', ')}`;
        }
      })
      .join('\n');

    const summary = await this.llmClient.generateFolderSummary(
      dirPath,
      childrenInfo,
      this.targetLocales,
    );

    const folderUnit: SpineFolderUnit = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      directory: dirPath || '',
      role: summary.json.role,
      responsibility: summary.json.responsibility,
      children,
      provenance: this.getProvenance(),
    };

    const targetJsonPath = path.join(indexDirPath, 'folder.json');
    FileSystemManager.safeWriteFile(targetJsonPath, JSON.stringify(folderUnit, null, 2));

    if (this.writeAtlasDocs) {
      for (const locale of this.targetLocales) {
        const content = summary.markdown[locale] || `Failed to generate docs for ${locale}`;
        const targetMdPath = path.join(this.spineDocsDir, locale, dirPath, 'folder.md');
        FileSystemManager.safeWriteFile(targetMdPath, content);
      }
    }
    return summary.usage;
  }

  /**
   * Root level summary (L3).
   */
  public async aggregateProject(): Promise<UsageInfo | undefined> {
    const allFolders: string[] = [];
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dir, entry.name);
          if (fs.existsSync(path.join(fullPath, 'folder.json'))) {
            allFolders.push(fullPath);
          }
          walk(fullPath);
        }
      }
    };
    if (fs.existsSync(this.spineIndexDir)) {
      walk(this.spineIndexDir);
    }

    const folderUnits: SpineFolderUnit[] = allFolders.flatMap((folderPath) => {
      const result = readIndexDocument<SpineFolderUnit>(
        this.rootDir,
        path.join(folderPath, 'folder.json'),
      );
      if (isCompatibleIndexDocument(result)) {
        return [result.data];
      }
      if (result.status !== 'missing') {
        reportIndexReadIssueOnce(logIndexIssue, result);
      }
      return [];
    });

    const modules = folderUnits.map((content) => ({
      directory: content.directory,
      role: content.role,
      childCount: content.children.length,
    }));

    const modulesInfo = folderUnits
      .map((f) => `- ${f.directory || 'root'}: ${f.role}\n  Responsibilities: ${f.responsibility}`)
      .join('\n');

    const summary = await this.llmClient.generateProjectSummary(
      path.basename(this.rootDir),
      modulesInfo,
      this.targetLocales,
    );

    const projectUnit: SpineProjectUnit = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      projectName: path.basename(this.rootDir),
      role: summary.json.role,
      responsibility: summary.json.responsibility,
      modules,
      provenance: this.getProvenance(),
    };

    const targetJsonPath = path.join(this.spineIndexDir, 'project.json');
    FileSystemManager.safeWriteFile(targetJsonPath, JSON.stringify(projectUnit, null, 2));

    if (this.writeAtlasDocs) {
      for (const locale of this.targetLocales) {
        const content = summary.markdown[locale] || `Failed to generate docs for ${locale}`;
        const targetMdPath = path.join(this.spineDocsDir, locale, 'project.md');
        FileSystemManager.safeWriteFile(targetMdPath, content);
      }
    }

    return summary.usage;
  }
}
