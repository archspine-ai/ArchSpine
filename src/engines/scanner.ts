import * as path from 'path';
import * as fs from 'fs';
import ignore from 'ignore';
import { DEFAULT_SCAN_POLICY, ScanPolicy } from '../core/scan-policy.js';
import { defaultScannerGitClient, type ScannerGitClient } from './scanner-git.js';
import {
  buildDryRunGroupedCounts,
  collectNotableExclusions,
  createScannerMatcher,
  formatDryRunReport,
  normalizeScannerPath,
  normalizeScannerPattern,
  splitScannerOutput,
  uniqueScannerPaths,
} from './scanner-utils.js';
import { defaultRuntimeIO } from '../infra/runtime-io.js';

export interface ScanResult {
  allFiles: string[];
  changedFiles: string[];
}

interface IgnoreLayerReport {
  label: string;
  path?: string;
  applied: boolean;
  rulesCount: number;
  rules: string[];
}

export interface ScanDryRunReport {
  fileSource: ScanPolicy['fileSource'];
  inheritGitIgnore: boolean;
  ignoreChain: IgnoreLayerReport[];
  protocolInclusions: string[];
  protocolExclusions: string[];
  wouldScan: string[];
  groupedCounts: Array<{ label: string; count: number; protocolIncluded: boolean }>;
  notableExclusions: Array<{ pattern: string; source: string; reason?: string }>;
}

export class Scanner {
  private rootDir: string;
  private policy: ScanPolicy;
  private ignorer: ReturnType<typeof ignore>;
  private ignoreChain: IgnoreLayerReport[] = [];
  private hardExclusionMatchers: Array<(input: string) => boolean> = [];
  private protocolInclusionMatchers: Array<(input: string) => boolean> = [];
  private gitPrefix: string | null | undefined;
  private gitClient: ScannerGitClient;

  constructor(
    rootDir: string,
    policy: ScanPolicy = DEFAULT_SCAN_POLICY,
    gitClient: ScannerGitClient = defaultScannerGitClient,
  ) {
    this.rootDir = rootDir;
    this.policy = policy;
    this.gitClient = gitClient;
    this.ignorer = ignore();
    this.ignoreChain.push({
      label: 'builtin protocol exclusions',
      applied: true,
      rulesCount: this.policy.protocolExclusions.length,
      rules: [...this.policy.protocolExclusions],
    });

    if (this.policy.ignoreChain.inheritGitIgnore) {
      this.addIgnoreFile('.gitignore');
    }

    this.addIgnoreFile(this.policy.ignoreChain.projectIgnore);
    this.addIgnoreFile(this.policy.ignoreChain.localIgnore);

    for (const inclusion of this.policy.protocolInclusions) {
      const normalizedInclusion = this.normalizePattern(inclusion);
      const parentSegments = normalizedInclusion.split('/').filter(Boolean);
      if (parentSegments.length > 1) {
        for (let i = 1; i < parentSegments.length; i++) {
          this.ignorer.add(`!${parentSegments.slice(0, i).join('/')}/`);
        }
      }
      this.ignorer.add(`!${inclusion}`);
    }

    this.hardExclusionMatchers = this.policy.protocolExclusions.map((pattern) =>
      this.createMatcher(pattern),
    );
    this.protocolInclusionMatchers = this.policy.protocolInclusions.map((pattern) =>
      this.createMatcher(pattern),
    );
  }

  private normalizeFilePath(file: string): string {
    return normalizeScannerPath(file);
  }

  private normalizePattern(pattern: string): string {
    return normalizeScannerPattern(pattern);
  }

  private createMatcher(pattern: string): (input: string) => boolean {
    return createScannerMatcher(this.normalizePattern(pattern));
  }

  private addIgnoreFile(fileName: string): void {
    const ignorePath = path.join(this.rootDir, fileName);
    if (!fs.existsSync(ignorePath)) {
      this.ignoreChain.push({
        label: fileName,
        path: fileName,
        applied: false,
        rulesCount: 0,
        rules: [],
      });
      return;
    }

    const content = fs.readFileSync(ignorePath, 'utf-8');
    const rules = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'));

    this.ignorer.add(content);
    this.ignoreChain.push({
      label: fileName,
      path: fileName,
      applied: true,
      rulesCount: rules.length,
      rules,
    });
  }

  private isProtocolIncluded(file: string): boolean {
    return this.protocolInclusionMatchers.some((matcher) => matcher(file));
  }

  private isHardExcluded(file: string): boolean {
    if (this.isProtocolIncluded(file)) {
      return false;
    }
    return this.hardExclusionMatchers.some((matcher) => matcher(file));
  }

  private canDirectoryContainProtocolInclusions(dirPath: string): boolean {
    const normalizedDir = dirPath.endsWith('/') ? dirPath : `${dirPath}/`;
    return this.policy.protocolInclusions.some((pattern) => {
      const normalizedPattern = this.normalizePattern(pattern);
      return normalizedPattern.startsWith(normalizedDir);
    });
  }

  private splitLines(output: string): string[] {
    return splitScannerOutput(output);
  }

  private runGit(args: readonly string[]): string {
    return this.gitClient.run(args, {
      cwd: this.rootDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  }

  private getGitPrefix(): string {
    if (this.gitPrefix !== undefined) {
      return this.gitPrefix || '';
    }

    try {
      this.gitPrefix = this.normalizeFilePath(this.runGit(['rev-parse', '--show-prefix']).trim());
      return this.gitPrefix || '';
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      defaultRuntimeIO.warn(
        `[Scanner] Unable to resolve git prefix, continuing without prefix normalization: ${reason}`,
      );
      this.gitPrefix = null;
      return '';
    }
  }

  private normalizeGitOutputPaths(files: string[]): string[] {
    const prefix = this.getGitPrefix();
    if (!prefix) {
      return files;
    }

    const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
    return files
      .map((file) =>
        file.startsWith(normalizedPrefix) ? file.slice(normalizedPrefix.length) : file,
      )
      .map((file) => this.normalizeFilePath(file))
      .filter(Boolean);
  }

  private unique(files: string[]): string[] {
    return uniqueScannerPaths(files);
  }

  private execGit(args: readonly string[]): string[] {
    try {
      return this.normalizeGitOutputPaths(this.splitLines(this.runGit(args)));
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      defaultRuntimeIO.warn(
        `[Scanner] Git command failed (${args.join(' ')}), returning empty result: ${reason}`,
      );
      return [];
    }
  }

  private execGitLsFiles(): string[] {
    return this.execGit(['ls-files']);
  }

  private execGitLsOthers(): string[] {
    return this.execGit(['ls-files', '--others', '--exclude-standard']);
  }

  private getBootstrapFiles(): string[] {
    return this.filterIgnored([...this.execGitLsFiles(), ...this.execGitLsOthers()]);
  }

  private execGitChangedFiles(): string[] {
    try {
      return this.normalizeGitOutputPaths(
        this.splitLines(this.runGit(['diff', 'HEAD', '--name-only', '--', '.'])),
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      defaultRuntimeIO.warn(
        `[Scanner] Failed to resolve changed files from git diff; falling back to tracked files: ${reason}`,
      );
      return this.execGitLsFiles();
    }
  }

  private walkFileSystem(currentDir: string = this.rootDir): string[] {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = this.normalizeFilePath(path.relative(this.rootDir, absolutePath));
      if (!relativePath) {
        continue;
      }

      if (entry.isDirectory()) {
        const dirPathForIgnore = relativePath + '/';
        const hasForcedInclusions = this.canDirectoryContainProtocolInclusions(dirPathForIgnore);
        if (
          (this.ignorer.ignores(dirPathForIgnore) || this.isHardExcluded(dirPathForIgnore)) &&
          !hasForcedInclusions
        ) {
          continue;
        }
        files.push(...this.walkFileSystem(absolutePath));
      } else if (entry.isFile()) {
        if (this.ignorer.ignores(relativePath) || this.isHardExcluded(relativePath)) {
          continue;
        }
        files.push(relativePath);
      }
    }

    return files;
  }

  private filterIgnored(files: string[]): string[] {
    const validFiles = this.unique(files).filter((line) => line.trim() !== '');
    if (validFiles.length === 0) {
      return [];
    }
    return this.ignorer
      .filter(validFiles)
      .filter((file) => !this.isHardExcluded(file))
      .filter((file) => {
        const absolutePath = path.join(this.rootDir, file);
        if (!fs.existsSync(absolutePath)) {
          return true;
        }
        try {
          return !fs.statSync(absolutePath).isDirectory();
        } catch {
          return true;
        }
      });
  }

  public getAllFiles(): string[] {
    switch (this.policy.fileSource) {
      case 'git-tracked-plus-untracked':
        return this.getBootstrapFiles();
      case 'filesystem':
        return this.filterIgnored(this.walkFileSystem());
      case 'git-tracked':
      default: {
        const trackedFiles = this.filterIgnored(this.execGitLsFiles());
        if (trackedFiles.length > 0) {
          return trackedFiles;
        }
        const bootstrapFiles = this.getBootstrapFiles();
        if (bootstrapFiles.length > 0) {
          return bootstrapFiles;
        }
        return this.filterIgnored(this.walkFileSystem());
      }
    }
  }

  public getAllTrackedFiles(): string[] {
    return this.getAllFiles();
  }

  public getChangedFiles(): string[] {
    switch (this.policy.fileSource) {
      case 'git-tracked-plus-untracked':
        return this.filterIgnored([...this.execGitChangedFiles(), ...this.execGitLsOthers()]);
      case 'filesystem':
        return this.getAllFiles();
      case 'git-tracked':
      default:
        return this.filterIgnored(this.execGitChangedFiles());
    }
  }

  public getFileLastCommit(filePath: string): string | null {
    try {
      const output = this.runGit(['log', '-n', '1', '--oneline', '--', filePath]);
      return output.trim() || null;
    } catch {
      return null;
    }
  }

  public getBranchName(): string {
    try {
      return this.runGit(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
    } catch {
      return 'unknown';
    }
  }

  public getGitStatusInfo(): string {
    try {
      return this.runGit(['status', '--short']).trim();
    } catch {
      return '';
    }
  }

  public filterFiles(files: string[], extensions: string[]): string[] {
    return files.filter((file) => extensions.includes(path.extname(file)));
  }

  public getDryRunReport(): ScanDryRunReport {
    const wouldScan = this.getAllFiles();

    return {
      fileSource: this.policy.fileSource,
      inheritGitIgnore: this.policy.ignoreChain.inheritGitIgnore,
      ignoreChain: this.ignoreChain,
      protocolInclusions: [...this.policy.protocolInclusions],
      protocolExclusions: [...this.policy.protocolExclusions],
      wouldScan,
      groupedCounts: buildDryRunGroupedCounts(wouldScan, (file) => this.isProtocolIncluded(file)),
      notableExclusions: collectNotableExclusions(this.ignoreChain, this.policy.protocolExclusions),
    };
  }

  public formatDryRunReport(): string {
    return formatDryRunReport(this.getDryRunReport());
  }
}
