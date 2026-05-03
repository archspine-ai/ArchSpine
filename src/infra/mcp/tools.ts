import * as fs from 'fs';
import * as path from 'path';
import { Manifest } from '../manifest.js';
import { Config } from '../config.js';
import { Scanner } from '../../engines/scanner.js';
import { RuleEngine } from '../../engines/rules.js';
import { loadRulesFromDir } from '../rules-loader.js';
import { MCPContextGate } from './context.js';
import { ArchSpineError, ErrorCodes, toArchSpineError } from '../../core/errors.js';
import { isCompatibleIndexDocument, readIndexDocument } from '../index-reader.js';
import type { SpineUnit } from '../../types/protocol.js';

export class SpineTools {
  private rootDir: string;
  private spineDir: string;
  private manifest: Manifest;
  private ruleEngine: RuleEngine;
  private contextGate?: MCPContextGate;

  constructor(rootDir: string, manifest?: Manifest, contextGate?: MCPContextGate) {
    this.rootDir = rootDir;
    this.spineDir = path.join(rootDir, '.spine');
    this.manifest = manifest || Manifest.open(rootDir);
    this.ruleEngine = new RuleEngine(rootDir);
    this.contextGate = contextGate;
  }

  public getToolDefinitions() {
    return [
      {
        name: 'spine_query_invariants',
        description:
          'Query architectural invariants (military-grade rules) that the codebase enforces. Use this before modifying critical paths to ensure you do not break architectural boundaries.',
        inputSchema: {
          type: 'object',
          properties: {
            invariantId: {
              type: 'string',
              description:
                'Optional ID of a specific invariant. If omitted, returns an overview of all active invariants from .spine/rules/.',
            },
            filePath: {
              type: 'string',
              description:
                'Optional relative file path. When provided, returns only the rules whose glob patterns match this file.',
            },
          },
        },
      },
      {
        name: 'spine_query_responsibilities',
        description:
          "Search for files handling specific responsibilities or roles within the system. Example keywords: 'authentication', 'database', 'routing'.",
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Keyword to search within file semantic roles and responsibilities.',
            },
          },
          required: ['keyword'],
        },
      },
      {
        name: 'spine_preview_scan',
        description:
          'Preview the effective ScanPolicy, ignore-chain order, and current scan boundary before large analysis or indexing work.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'spine_get_drift_history',
        description:
          "Get the semantic evolution history of a file. Call this when you see driftDetected: true in a file's index to understand how its responsibilities changed over time. Returns a list of drift events in reverse chronological order.",
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Repo-relative file path, e.g. src/infra/db.ts',
            },
            limit: {
              type: 'number',
              description: 'Max events to return (default: 5)',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'spine_get_file_context',
        description:
          '获取单个文件的完整治理上下文：匹配的架构规则、语义角色与职责、依赖关系、公共接口、导出符号、漂移信息。外部 agent 据此自行判断违规并执行修复。Use this before modifying any file to understand its architectural constraints.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: '仓库相对路径，例如 src/infra/db.ts',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'spine_get_view_data',
        description:
          '读取视图数据（风险热点或公共入口面），帮助 agent 确定治理优先级。风险热点基于 fan-in/fan-out/跨边界依赖/违规等信号加权计算。',
        inputSchema: {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              enum: ['risk-hotspots', 'public-surface'],
              description: '视图类型：risk-hotspots（风险热点）或 public-surface（公共入口面）',
            },
            limit: {
              type: 'number',
              description: '返回条数上限，默认返回全部',
            },
          },
          required: ['viewType'],
        },
      },
      {
        name: 'spine_get_sync_status',
        description:
          'Check whether the local .spine index is current. Returns how many files have changed since the last sync and whether the Atlas distribution snapshot is stale. Call this before trusting file context reads in a long session.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'spine_get_baseline_status',
        description:
          'Get the health status of the local .spine semantic baseline and distribution snapshot. Shows whether the baseline exists, whether the Atlas is stale, when the last sync ran, and what action (if any) the maintainer should take. Call this at the start of a session to verify the .spine data is trustworthy before reading architecture context.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'spine_get_violations_summary',
        description:
          'Get a summary of all active architectural rule violations tracked in the .spine runtime. Returns violation counts grouped by rule ID and the top offending files. Use this at the start of a governance or refactoring session to prioritize which files to inspect.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'spine_list_resource_templates',
        description:
          'List the discoverable Spine URI templates exposed by the MCP server. Use this to find folder and file resource patterns before reading them.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  public async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    // Meta tools that don't strictly require .spine to exist (or they handle the check themselves)
    if (name === 'spine_get_baseline_status' || name === 'spine_get_sync_status') {
      this.contextGate?.noteToolCall(name);
      return name === 'spine_get_baseline_status' ? this.getBaselineStatus() : this.getSyncStatus();
    }

    if (!fs.existsSync(this.spineDir)) {
      throw new ArchSpineError(
        ErrorCodes.McpRuntimeMissing,
        `Tool '${name}' cannot run because .spine is missing. Ask the user to run 'spine init' and 'spine build' first.`,
        { context: { toolName: name, spineDir: this.spineDir } },
      );
    }

    try {
      this.contextGate?.noteToolCall(name);
      switch (name) {
        case 'spine_query_invariants':
          return this.queryInvariants(
            args.invariantId as string | undefined,
            args.filePath as string | undefined,
          );
        case 'spine_query_responsibilities':
          return this.queryResponsibilities(args.keyword as string);
        case 'spine_preview_scan':
          return this.previewScan();
        case 'spine_get_drift_history':
          return this.getDriftHistory(args.filePath as string, args.limit as number | undefined);
        case 'spine_get_file_context':
          return this.getFileContext(args.filePath as string);
        case 'spine_get_view_data':
          return this.getViewData(args.viewType as string, args.limit as number | undefined);
        case 'spine_get_violations_summary':
          return this.getViolationsSummary();
        case 'spine_list_resource_templates':
          return this.listResourceTemplates();
        default:
          throw new ArchSpineError(
            ErrorCodes.McpToolUnknown,
            `Unknown MCP tool '${name}'. Call 'spine_list_resource_templates' or list tools first.`,
            { context: { toolName: name } },
          );
      }
    } catch (error) {
      throw toArchSpineError(
        error,
        ErrorCodes.McpToolExecutionFailed,
        `Tool '${name}' execution failed.`,
        { context: { toolName: name } },
      );
    }
  }

  private queryInvariants(invariantId?: string, filePath?: string): string {
    const rulesDir = path.join(this.spineDir, 'rules');
    if (!fs.existsSync(rulesDir)) {
      return 'No architectural rules defined in .spine/rules/.';
    }

    const loadedRules = loadRulesFromDir(rulesDir);
    if (loadedRules.length === 0) {
      return 'No rule files found.';
    }

    let filteredRules = loadedRules;

    if (filePath) {
      const matchedRules = this.ruleEngine.getRulesForFile(filePath);
      const matchedIds = new Set(
        matchedRules.map((block) => {
          const match = block.match(/\[Rule:\s*([^\]]+)\]/);
          return match ? match[1] : '';
        }),
      );
      filteredRules = loadedRules.filter(({ rule }) => matchedIds.has(rule.ruleId));
    }

    if (invariantId) {
      const exactRule = filteredRules.find(({ rule }) => rule.ruleId === invariantId);
      if (exactRule) {
        return `Rule: ${exactRule.rule.title}
Rule ID: ${exactRule.rule.ruleId}
Severity: ${exactRule.rule.severity}
Applies To: ${exactRule.rule.appliesTo.join(', ')}
Summary: ${exactRule.rule.summary}
Rationale: ${exactRule.rule.rationale || 'n/a'}

${exactRule.rule.bodyMarkdown}`.trim();
      }
      return `[WARN] Invariant '${invariantId}' not found${filePath ? ` for file ${filePath}` : ''}.`;
    }

    if (filePath && filteredRules.length === 0) {
      return `No architectural rules matched for file ${filePath}.`;
    }

    const summaries = filteredRules.map(({ filePath: sourcePath, rule }) => {
      const sourceName = path.basename(sourcePath);
      return `- ${rule.ruleId} (${sourceName}) [${rule.severity}]: ${rule.summary}`;
    });

    const header = filePath
      ? `Architectural Invariants matching ${filePath}:`
      : `Active Architectural Invariants:`;
    return `${header}\n${summaries.join('\n')}\nType an invariant ID into spine_query_invariants to see detailed rules.`;
  }

  private queryResponsibilities(keyword: string): string {
    if (typeof keyword !== 'string' || keyword.trim().length === 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_query_responsibilities' requires a non-empty 'keyword' argument.`,
        { context: { toolName: 'spine_query_responsibilities', keyword } },
      );
    }

    const manifestPath = path.join(this.spineDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new ArchSpineError(
        ErrorCodes.McpRuntimeBaselineIncomplete,
        `Tool 'spine_query_responsibilities' requires a runtime baseline. Run 'spine build' first.`,
        {
          context: {
            toolName: 'spine_query_responsibilities',
            manifestPath,
          },
        },
      );
    }

    const files = this.manifest.getTrackedFiles();

    const matches: string[] = [];
    const unreadableIndexes: string[] = [];
    const invalidIndexes: string[] = [];
    const incompatibleIndexes: string[] = [];
    const kwLower = keyword.toLowerCase();

    for (const filePath of files) {
      const indexPath = path.join(this.spineDir, 'index', `${filePath}.json`);
      if (!fs.existsSync(indexPath)) {
        continue;
      }

      try {
        const readResult = readIndexDocument<
          Record<string, unknown> & {
            schemaVersion?: unknown;
            semantic?: { role?: string; responsibilities?: string[] };
          }
        >(this.rootDir, indexPath);
        if (!isCompatibleIndexDocument(readResult)) {
          if (readResult.status === 'invalid-json') {
            invalidIndexes.push(filePath);
          } else if (readResult.status === 'incompatible-schema') {
            incompatibleIndexes.push(filePath);
          }
          continue;
        }
        const unit = readResult.data;
        const semantic = unit.semantic;
        if (!semantic) {
          continue;
        }

        let isMatch = false;
        if (semantic.role && semantic.role.toLowerCase().includes(kwLower)) {
          isMatch = true;
        }
        if (semantic.responsibilities) {
          for (const resp of semantic.responsibilities) {
            if (resp.toLowerCase().includes(kwLower)) {
              isMatch = true;
            }
          }
        }

        if (isMatch) {
          matches.push(`- /${filePath}: ${semantic.role}`);
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          invalidIndexes.push(filePath);
        } else {
          unreadableIndexes.push(filePath);
        }
      }
    }

    if (matches.length === 0 && invalidIndexes.length > 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolIndexInvalidContent,
        `One or more index entries contain invalid JSON while searching responsibilities. Run 'spine build' to rebuild .spine/index.`,
        {
          context: {
            toolName: 'spine_query_responsibilities',
            invalidIndexes,
          },
        },
      );
    }

    if (matches.length === 0 && incompatibleIndexes.length > 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolIndexInvalidContent,
        `One or more index entries use an incompatible schemaVersion while searching responsibilities. Run 'spine build' to rebuild .spine/index.`,
        {
          context: {
            toolName: 'spine_query_responsibilities',
            incompatibleIndexes,
          },
        },
      );
    }

    if (matches.length === 0 && unreadableIndexes.length > 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolIndexReadFailed,
        `One or more index entries could not be read while searching responsibilities. Run 'spine build' to rebuild .spine/index.`,
        {
          context: {
            toolName: 'spine_query_responsibilities',
            unreadableIndexes,
          },
        },
      );
    }

    if (matches.length === 0) {
      return `No files found matching the responsibility keyword '${keyword}'.`;
    }

    const warnings: string[] = [];
    if (invalidIndexes.length > 0) {
      warnings.push(
        `[WARN] Skipped ${invalidIndexes.length} index entr${invalidIndexes.length === 1 ? 'y' : 'ies'} with invalid JSON. Run 'spine build' if results look incomplete.`,
      );
    }
    if (incompatibleIndexes.length > 0) {
      warnings.push(
        `[WARN] Skipped ${incompatibleIndexes.length} index entr${incompatibleIndexes.length === 1 ? 'y' : 'ies'} with an incompatible schemaVersion. Run 'spine build' if results look incomplete.`,
      );
    }
    if (unreadableIndexes.length > 0) {
      warnings.push(
        `[WARN] Skipped ${unreadableIndexes.length} unreadable index entr${unreadableIndexes.length === 1 ? 'y' : 'ies'}. Run 'spine build' if results look incomplete.`,
      );
    }
    const warning = warnings.length > 0 ? `\n${warnings.join('\n')}` : '';

    return `Files matching '${keyword}':\n${matches.join('\n')}\nUse spine://file/{filePath} resource to fetch full contract specifics.${warning}`;
  }

  private previewScan(): string {
    const config = new Config(this.rootDir);
    const scanner = new Scanner(this.rootDir, config.getScanPolicy());
    return scanner.formatDryRunReport();
  }

  private getDriftHistory(filePath: string, limit?: number): string {
    if (typeof filePath !== 'string' || filePath.trim().length === 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_drift_history' requires a non-empty 'filePath' argument.`,
        { context: { toolName: 'spine_get_drift_history', filePath } },
      );
    }

    if (limit !== undefined && (!Number.isFinite(limit) || Math.floor(limit) < 1)) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_drift_history' requires 'limit' to be a positive integer when provided.`,
        { context: { toolName: 'spine_get_drift_history', filePath, limit } },
      );
    }

    const normalizedLimit = limit !== undefined ? Math.floor(limit) : 5;
    const events = this.manifest.getDriftHistory(filePath, normalizedLimit);
    return JSON.stringify(events, null, 2);
  }

  private getFileContext(filePath: string): string {
    if (typeof filePath !== 'string' || filePath.trim().length === 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_file_context' requires a non-empty 'filePath' argument.`,
        { context: { toolName: 'spine_get_file_context', filePath } },
      );
    }

    const indexPath = path.join(this.spineDir, 'index', `${filePath}.json`);

    const readResult = readIndexDocument<SpineUnit>(this.rootDir, indexPath);
    if (!isCompatibleIndexDocument(readResult)) {
      if (readResult.status === 'missing') {
        return JSON.stringify(
          {
            filePath,
            error: `No index data found for ${filePath}. Run 'spine build' or 'spine sync' first.`,
          },
          null,
          2,
        );
      }
      return JSON.stringify(
        {
          filePath,
          error: `Index data for ${filePath} is invalid (${readResult.status}). Run 'spine build' to rebuild.`,
        },
        null,
        2,
      );
    }

    const unit = readResult.data;

    const matchedRules = this.ruleEngine.getRulesForFile(filePath);

    const semantic = unit.semantic
      ? {
          role: unit.semantic.role,
          responsibilities: unit.semantic.responsibilities || [],
          publicSurface: unit.semantic.publicSurface || [],
          driftDetected: unit.semantic.driftDetected || false,
          driftReason: unit.semantic.driftReason || null,
          ruleViolations: unit.semantic.ruleViolations || [],
        }
      : null;

    const dependencies = unit.graph
      ? {
          dependsOn: (unit.graph.dependsOn || []).map((e) => ({
            targetPath: e.targetPath,
            relation: e.relation,
          })),
          dependedBy: (unit.graph.dependedBy || []).map((e) => ({
            targetPath: e.targetPath,
            relation: e.relation,
          })),
          fanIn: (unit.graph.dependedBy || []).length,
          fanOut: (unit.graph.dependsOn || []).length,
        }
      : null;

    const skeleton = unit.skeleton
      ? {
          exports: (unit.skeleton.exports || []).map((e) => e.name),
          structuralHints: unit.skeleton.structuralHints,
        }
      : null;

    const context = {
      filePath,
      identity: unit.identity
        ? {
            language: unit.identity.language,
            fileKind: unit.identity.fileKind,
          }
        : null,
      rules: matchedRules,
      semantic,
      dependencies,
      skeleton,
    };

    return JSON.stringify(context, null, 2);
  }

  private getViewData(viewType: string, limit?: number): string {
    const validTypes = ['risk-hotspots', 'public-surface'];
    if (!validTypes.includes(viewType)) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_view_data' requires 'viewType' to be one of: ${validTypes.join(', ')}.`,
        { context: { toolName: 'spine_get_view_data', viewType } },
      );
    }

    const viewPath = path.join(this.spineDir, 'view', `${viewType}.json`);
    if (!fs.existsSync(viewPath)) {
      return JSON.stringify(
        {
          viewType,
          error: `View data not found at ${viewPath}. Run 'spine build' or 'spine view generate' first.`,
        },
        null,
        2,
      );
    }

    try {
      const raw = JSON.parse(fs.readFileSync(viewPath, 'utf-8'));
      const items = raw.items || [];
      const sliced =
        limit !== undefined && Number.isFinite(limit) && limit > 0 ? items.slice(0, limit) : items;

      return JSON.stringify(
        {
          viewType: raw.viewType,
          generatedAt: raw.generatedAt,
          summary: raw.summary,
          itemCount: sliced.length,
          items: sliced,
        },
        null,
        2,
      );
    } catch (e) {
      return JSON.stringify(
        {
          viewType,
          error: `Failed to read view data: ${e instanceof Error ? e.message : String(e)}`,
        },
        null,
        2,
      );
    }
  }

  private async getSyncStatus(): Promise<string> {
    const { SyncService } = await import('../../services/sync-service.js');
    const syncService = new SyncService({
      rootDir: this.rootDir,
    });

    let status: { total: number; needingSync: number } = { total: 0, needingSync: 0 };
    if (fs.existsSync(this.spineDir)) {
      status = await syncService.status();
    }

    const atlasStale = this.manifest.isAtlasStale();
    const isFresh = status.needingSync === 0 && !atlasStale && fs.existsSync(this.spineDir);

    const recommendation = isFresh
      ? 'Index data is current. File context reads are reliable.'
      : [
          !fs.existsSync(this.spineDir) ? "Semantic baseline missing → run 'spine build'." : null,
          status.needingSync > 0
            ? `${status.needingSync} file(s) changed since last sync → run 'spine sync'.`
            : null,
          atlasStale
            ? "Atlas is stale (.spine/.stale present) → run 'spine publish' or 'spine build'."
            : null,
        ]
          .filter(Boolean)
          .join(' ');

    return JSON.stringify(
      {
        totalTracked: status.total,
        needingSync: status.needingSync,
        isAtlasStale: atlasStale,
        isFresh,
        recommendation,
      },
      null,
      2,
    );
  }

  private getBaselineStatus(): string {
    const manifestPath = path.join(this.spineDir, 'manifest.json');
    const indexDir = path.join(this.spineDir, 'index');
    const atlasDir = path.join(this.spineDir, 'atlas');
    const projectIndex = path.join(indexDir, 'project.json');

    const baselineExists = fs.existsSync(manifestPath);
    const isVirginState = this.manifest.isVirginState();
    const isAtlasStale = this.manifest.isAtlasStale();

    let lastSyncAt: string | null = null;
    let lastSyncMode: string | null = null;
    let indexedUnitCount: number | null = null;
    let activeViolations: number | null = null;

    if (baselineExists) {
      try {
        const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
          sync?: { lastSyncAt?: string; lastSyncMode?: string; indexedUnitCount?: number };
          health?: { activeViolations?: number };
        };
        lastSyncAt = raw.sync?.lastSyncAt ?? null;
        lastSyncMode = raw.sync?.lastSyncMode ?? null;
        indexedUnitCount = raw.sync?.indexedUnitCount ?? null;
        activeViolations = raw.health?.activeViolations ?? null;
      } catch {
        // manifest exists but unreadable
      }
    }

    const publishSnapshotReady =
      fs.existsSync(indexDir) && fs.existsSync(atlasDir) && fs.existsSync(projectIndex);

    let pendingAction: string | null = null;
    if (!baselineExists || isVirginState) {
      pendingAction = "Run 'spine build' to create the initial semantic baseline.";
    } else if (isAtlasStale && !publishSnapshotReady) {
      pendingAction = "Run 'spine build' to rebuild the full distributable snapshot.";
    } else if (isAtlasStale) {
      pendingAction = "Run 'spine publish' to refresh the Atlas distribution snapshot.";
    }

    return JSON.stringify(
      {
        baselineExists,
        isVirginState,
        isAtlasStale,
        publishSnapshotReady,
        lastSyncAt,
        lastSyncMode,
        indexedUnitCount,
        activeViolations,
        pendingAction,
      },
      null,
      2,
    );
  }

  private getViolationsSummary(): string {
    const violations = this.manifest.getActiveViolations();

    if (violations.length === 0) {
      return JSON.stringify(
        { totalViolations: 0, message: 'No active rule violations found.' },
        null,
        2,
      );
    }

    const byRuleId: Record<string, { count: number; severity: string }> = {};
    for (const v of violations) {
      if (!byRuleId[v.rule_id]) {
        byRuleId[v.rule_id] = { count: 0, severity: v.severity };
      }
      byRuleId[v.rule_id].count++;
    }

    const fileViolationCount: Record<string, number> = {};
    for (const v of violations) {
      fileViolationCount[v.file_path] = (fileViolationCount[v.file_path] ?? 0) + 1;
    }
    const topFiles = Object.entries(fileViolationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([filePath, count]) => ({ filePath, count }));

    return JSON.stringify(
      {
        totalViolations: violations.length,
        byRuleId,
        topFiles,
        recommendation:
          `${violations.length} active violation(s). ` +
          `Call spine_get_file_context on top files for details, or run 'spine check' for the full report.`,
      },
      null,
      2,
    );
  }

  private listResourceTemplates(): string {
    return JSON.stringify(
      [
        {
          uriTemplate: 'spine://project',
          name: 'Project Architecture topology',
          description:
            'Get the full project-level architecture overview and high-level module decomposition.',
        },
        {
          uriTemplate: 'spine://folder/{dirPath}',
          name: 'Folder Level Architecture',
          description:
            'Get the architecture and file responsibilities within a specific directory.',
        },
        {
          uriTemplate: 'spine://file/{filePath}',
          name: 'File Semantic Contract',
          description:
            'Get the semantic contract, architectural invariants, and structural skeleton for a specific file.',
        },
      ],
      null,
      2,
    );
  }
}
