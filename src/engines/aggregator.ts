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

interface ValidatedSummaryFields {
  role: string;
  responsibility: string;
}

/** Defensive coercion of LLM output into expected string fields. Never throws. */
function validateSummaryFields(json: Record<string, unknown>): ValidatedSummaryFields {
  const role = typeof json.role === 'string' && json.role.trim() ? json.role.trim() : 'Unnamed';
  const responsibility =
    typeof json.responsibility === 'string' && json.responsibility.trim()
      ? json.responsibility.trim()
      : 'No description available';
  return { role, responsibility };
}

export class Aggregator {
  private rootDir: string;
  private spineIndexDir: string;
  private llmClient: LLMClient;

  /**
   * In-memory cache of folder.json content scoped to one sync run.
   * Keyed by directory path relative to .spine/index. Avoids re-reading
   * the same folder.json during needsDirectoryAggregation's semantic
   * comparison pass.
   */
  private folderCache = new Map<string, SpineFolderUnit>();

  constructor(rootDir: string, llmClient: LLMClient) {
    this.rootDir = rootDir;
    this.spineIndexDir = path.join(rootDir, '.spine', 'index');
    this.llmClient = llmClient;
  }

  private getProvenance(): SpineProvenance {
    return {
      indexedAt: new Date().toISOString(),
      generatorVersion: GENERATOR_VERSION,
      pipelineStages: ['ast', 'llm'],
    };
  }

  /**
   * Compare a child entry's current semantic content against what was
   * previously recorded in the parent folder.json. Returns true if the
   * child's role has meaningfully changed, requiring parent re-aggregation.
   */
  private hasChildSemanticChange(
    dirPath: string,
    existingFolder: SpineFolderUnit,
    childEntryName: string,
  ): boolean {
    const indexDirPath = path.join(this.spineIndexDir, dirPath);
    const childFullPath = path.join(indexDirPath, childEntryName);

    const stat = fs.statSync(childFullPath);

    // Index entries for source files carry a ".json" suffix (e.g. "cli-utils.ts.json")
    // but folder.json children use the original source path (e.g. "src/cli/cli-utils.ts").
    // Directories are stored with their plain name in both places.
    const childSourcePath = stat.isDirectory()
      ? childEntryName
      : childEntryName.replace(/\.json$/i, '');
    const relativeChildPath = path.join(dirPath, childSourcePath);

    const existingChild = existingFolder.children.find((c) => c.filePath === relativeChildPath);
    if (!existingChild) {
      return true; // New child or structural change
    }

    if (stat.isDirectory()) {
      const childFolderJson = path.join(childFullPath, 'folder.json');
      if (!fs.existsSync(childFolderJson)) {
        return true;
      }
      const result = readIndexDocument<SpineFolderUnit>(this.rootDir, childFolderJson);
      if (!isCompatibleIndexDocument(result)) {
        return true; // Can't read child → conservative
      }
      const newRole = result.data.role || 'N/A';
      return existingChild.role !== newRole;
    }

    // Child is a per-file JSON (file-<hash>.json)
    const result = readIndexDocument<SpineUnit>(this.rootDir, childFullPath);
    if (!isCompatibleIndexDocument(result)) {
      return true; // Can't read child → conservative
    }
    const newRole = result.data.semantic?.role || 'N/A';
    return existingChild.role !== newRole;
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

    // Lazily loaded from cache or disk — only read when at least one child
    // appears newer by mtime, avoiding unnecessary I/O for unchanged dirs.
    let existingFolder: SpineFolderUnit | undefined;

    const ensureExistingFolder = (): SpineFolderUnit | undefined => {
      if (existingFolder) {
        return existingFolder;
      }
      const cached = this.folderCache.get(dirPath);
      if (cached) {
        existingFolder = cached;
        return existingFolder;
      }
      const result = readIndexDocument<SpineFolderUnit>(this.rootDir, folderJsonPath);
      if (isCompatibleIndexDocument(result)) {
        existingFolder = result.data;
        this.folderCache.set(dirPath, existingFolder);
        return existingFolder;
      }
      return undefined;
    };

    const entries = fs.readdirSync(indexDirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const childFolderJsonPath = path.join(indexDirPath, entry.name, 'folder.json');
        if (
          fs.existsSync(childFolderJsonPath) &&
          fs.statSync(childFolderJsonPath).mtimeMs > folderMtimeMs
        ) {
          const folder = ensureExistingFolder();
          if (!folder?.children || folder.children.length === 0) {
            return true; // No existing children to compare against
          }
          if (this.hasChildSemanticChange(dirPath, folder, entry.name)) {
            return true;
          }
          // mtime changed but semantic role unchanged → not a real change
          continue;
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
        const folder = ensureExistingFolder();
        if (!folder?.children || folder.children.length === 0) {
          return true;
        }
        if (this.hasChildSemanticChange(dirPath, folder, entry.name)) {
          return true;
        }
        // mtime changed but semantic role unchanged → not a real change
      }
    }

    return false;
  }

  public needsProjectAggregation(): boolean {
    if (!fs.existsSync(this.spineIndexDir)) {
      return false;
    }

    const projectJsonPath = path.join(this.spineIndexDir, 'project.json');
    if (!fs.existsSync(projectJsonPath)) {
      return true;
    }

    const allFolders: string[] = [];
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const fullPath = path.join(dir, entry.name);
        const folderJsonPath = path.join(fullPath, 'folder.json');
        if (fs.existsSync(folderJsonPath)) {
          allFolders.push(fullPath);
        }
        walk(fullPath);
      }
    };

    walk(this.spineIndexDir);

    const folderUnits: SpineFolderUnit[] = allFolders.flatMap((folderPath) => {
      const result = readIndexDocument<SpineFolderUnit>(
        this.rootDir,
        path.join(folderPath, 'folder.json'),
      );
      if (isCompatibleIndexDocument(result)) {
        return [result.data];
      }
      return [];
    });

    const currentModules = folderUnits.map((content) => ({
      directory: content.directory,
      role: content.role,
      childCount: content.children.length,
    }));

    const projectResult = readIndexDocument<SpineProjectUnit>(this.rootDir, projectJsonPath);
    if (!isCompatibleIndexDocument(projectResult)) {
      return true;
    }

    const existingModules = projectResult.data.modules;

    if (existingModules.length !== currentModules.length) {
      return true;
    }

    const sortedExisting = [...existingModules].sort((a, b) =>
      a.directory.localeCompare(b.directory),
    );
    const sortedCurrent = [...currentModules].sort((a, b) =>
      a.directory.localeCompare(b.directory),
    );

    for (let i = 0; i < sortedExisting.length; i++) {
      const a = sortedExisting[i];
      const b = sortedCurrent[i];
      if (a.directory !== b.directory || a.role !== b.role || a.childCount !== b.childCount) {
        return true;
      }
    }

    return false;
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

    const summary = await this.llmClient.generateFolderSummary(dirPath, childrenInfo);

    const validatedFields = validateSummaryFields(summary.json as Record<string, unknown>);

    const folderUnit: SpineFolderUnit = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      directory: dirPath || '',
      role: validatedFields.role,
      responsibility: validatedFields.responsibility,
      children,
      provenance: this.getProvenance(),
    };

    const targetJsonPath = path.join(indexDirPath, 'folder.json');
    FileSystemManager.safeWriteFile(targetJsonPath, JSON.stringify(folderUnit, null, 2));

    // Refresh the semantic cache so parent directories can skip re-reading
    // this folder.json during their own needsDirectoryAggregation check.
    this.folderCache.set(dirPath, folderUnit);

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

    const modules = folderUnits
      .map((content) => ({
        directory: content.directory,
        role: content.role,
        childCount: content.children.length,
      }))
      .sort((a, b) => a.directory.localeCompare(b.directory));

    const modulesInfo = folderUnits
      .map((f) => `- ${f.directory || 'root'}: ${f.role}\n  Responsibilities: ${f.responsibility}`)
      .join('\n');

    const summary = await this.llmClient.generateProjectSummary(
      path.basename(this.rootDir),
      modulesInfo,
    );

    const validatedFields = validateSummaryFields(summary.json as Record<string, unknown>);

    const projectUnit: SpineProjectUnit = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      projectName: path.basename(this.rootDir),
      role: validatedFields.role,
      responsibility: validatedFields.responsibility,
      modules,
      provenance: this.getProvenance(),
    };

    const targetJsonPath = path.join(this.spineIndexDir, 'project.json');
    FileSystemManager.safeWriteFile(targetJsonPath, JSON.stringify(projectUnit, null, 2));

    return summary.usage;
  }
}
