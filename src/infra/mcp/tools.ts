import * as fs from 'fs';
import * as path from 'path';
import { Manifest } from '../manifest.js';
import { Config } from '../config.js';
import { Scanner } from '../../engines/scanner.js';
import { loadRulesFromDir } from '../rules-loader.js';
import { MCPContextGate } from './context.js';
import { ArchSpineError, ErrorCodes, toArchSpineError } from '../../core/errors.js';
import { isCompatibleIndexDocument, readIndexDocument } from '../index-reader.js';

export class SpineTools {
  private rootDir: string;
  private spineDir: string;
  private manifest: Manifest;
  private contextGate?: MCPContextGate;

  constructor(rootDir: string, manifest?: Manifest, contextGate?: MCPContextGate) {
    this.rootDir = rootDir;
    this.spineDir = path.join(rootDir, '.spine');
    this.manifest = manifest || Manifest.open(rootDir);
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
          return this.queryInvariants(args.invariantId as string | undefined);
        case 'spine_query_responsibilities':
          return this.queryResponsibilities(args.keyword as string);
        case 'spine_preview_scan':
          return this.previewScan();
        case 'spine_get_drift_history':
          return this.getDriftHistory(args.filePath as string, args.limit as number | undefined);
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

  private queryInvariants(invariantId?: string): string {
    const rulesDir = path.join(this.spineDir, 'rules');
    if (!fs.existsSync(rulesDir)) {
      return 'No architectural rules defined in .spine/rules/.';
    }

    const loadedRules = loadRulesFromDir(rulesDir);
    if (loadedRules.length === 0) {
      return 'No rule files found.';
    }

    if (invariantId) {
      const exactRule = loadedRules.find(({ rule }) => rule.ruleId === invariantId);
      if (exactRule) {
        return `Rule: ${exactRule.rule.title}
Rule ID: ${exactRule.rule.ruleId}
Severity: ${exactRule.rule.severity}
Applies To: ${exactRule.rule.appliesTo.join(', ')}
Summary: ${exactRule.rule.summary}
Rationale: ${exactRule.rule.rationale || 'n/a'}

${exactRule.rule.bodyMarkdown}`.trim();
      }
      return `[WARN] Invariant '${invariantId}' not found.`;
    }

    const summaries = loadedRules.map(({ filePath, rule }) => {
      const sourceName = path.basename(filePath);
      return `- ${rule.ruleId} (${sourceName}) [${rule.severity}]: ${rule.summary}`;
    });

    return `Active Architectural Invariants:\n${summaries.join('\n')}\nType an invariant ID into spine_query_invariants to see detailed rules.`;
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
