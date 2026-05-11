import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Manifest } from '../manifest.js';
import { Config } from '../config.js';
import { Scanner } from '../../engines/scanner.js';
import { RuleEngine } from '../../engines/rules.js';
import { loadRulesFromDir } from '../rules-loader.js';
import { MCPContextGate } from './context.js';
import { ArchSpineError, ErrorCodes, toArchSpineError } from '../../core/errors.js';
import { isCompatibleIndexDocument, readIndexDocument } from '../index-reader.js';
import { normalizeToolFilePath, assertPathWithinParent } from './tool-utils.js';
import type { SpineUnit } from '../../types/protocol.js';
import {
  upstreamOf,
  downstreamOf,
  violationEdges,
  changeImpact,
  matchSemantic,
} from '../../engines/graph-query.js';
import type { KnowledgeGraph, KnowledgeGraphNode } from '../../engines/dependency-graph.js';

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

  /**
   * Validate a filePath received from MCP tool input. Rejects null bytes,
   * absolute paths, and path traversal (..) segments. Returns the normalized
   * relative path on success.
   */
  private normalizeToolFilePath(toolName: string, rawPath: string): string {
    return normalizeToolFilePath(toolName, rawPath);
  }

  private assertPathWithinParent(toolName: string, resolvedPath: string, parentDir: string): void {
    return assertPathWithinParent(toolName, resolvedPath, parentDir);
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
        name: 'spine_search_symbols',
        description:
          'Search for code symbols (exports, functions, classes) by name across the codebase. Uses exact match when possible, falls back to fuzzy substring search. Returns matching symbol names and their file paths. Use this to find where a specific function, class, or export is defined.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Symbol name to search for. Performs substring match (LIKE %query%).',
            },
            exact: {
              type: 'boolean',
              description:
                'When true, uses exact name match only (faster, uses DB index). Default false (fuzzy substring search).',
            },
            limit: {
              type: 'number',
              description: 'Max results to return (default: 50).',
            },
          },
          required: ['query'],
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
          '读取任意预计算视图数据（公共入口面、风险热点、架构图、项目健康、Agent 简报、变更影响）。所有视图基于确定性算法，零 LLM 成本。',
        inputSchema: {
          type: 'object',
          properties: {
            viewType: {
              type: 'string',
              enum: [
                'public-surface',
                'risk-hotspots',
                'architecture-diagram',
                'project-health',
                'agent-briefing',
                'change-impact',
              ],
              description:
                '视图类型：public-surface（公共入口面）、risk-hotspots（风险热点）、architecture-diagram（架构图元数据）、project-health（项目健康）、agent-briefing（Agent 简报）、change-impact（变更影响）',
            },
            limit: {
              type: 'number',
              description: '返回条数上限（仅对包含 items/modules 数组的视图生效），默认返回全部',
            },
            filter: {
              type: 'object',
              description:
                'Optional filters applied to view items. Only items matching ALL specified filters are returned.',
              properties: {
                kind: {
                  type: 'string',
                  description:
                    'Filter by entry kind (e.g. "cli", "mcp", "public-module", "route", "config", "schema"). Only applies to views with kind/type fields on items.',
                },
                layer: {
                  type: 'string',
                  description:
                    'Filter by architectural layer (e.g. "infra", "services", "cli"). Only applies to views with layer fields on items.',
                },
                minScore: {
                  type: 'number',
                  description:
                    'Minimum totalScore threshold. Only items with totalScore >= minScore are returned.',
                },
                search: {
                  type: 'string',
                  description:
                    'Free-text search across item summaries, paths, and symbol names (case-insensitive substring match).',
                },
              },
            },
            sort: {
              type: 'object',
              description: 'Sort configuration for view items.',
              properties: {
                field: {
                  type: 'string',
                  description:
                    'Field to sort by: "score" (totalScore descending), "name" (entrypoint/hotspotPath alphabetically), "confidence" (confidence descending).',
                  enum: ['score', 'name', 'confidence'],
                },
              },
            },
            offset: {
              type: 'number',
              description:
                'Number of items to skip before returning results (for pagination). Use with limit.',
            },
          },
          required: ['viewType'],
        },
      },
      {
        name: 'spine_get_sync_status',
        description:
          'Check whether the local .spine index is current. Returns how many files have changed since the last sync and whether the semantic snapshot is stale. Call this before trusting file context reads in a long session.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'spine_get_baseline_status',
        description:
          'Get the health status of the local .spine semantic baseline and distribution snapshot. Shows whether the baseline exists, whether the semantic snapshot is stale, when the last sync ran, and what action (if any) the maintainer should take. Call this at the start of a session to verify the .spine data is trustworthy before reading architecture context.',
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
      {
        name: 'spine_query_graph',
        description:
          'Query the module-level knowledge graph. Filter dependency edges by source module, target module, edge type, compliance status, or architectural layer. Returns matching edges with a node summary. Call spine_get_module_context for full detail on a single module.',
        inputSchema: {
          type: 'object',
          properties: {
            from: {
              type: 'string',
              description: 'Optional source module ID filter (e.g. "src/engines").',
            },
            to: {
              type: 'string',
              description: 'Optional target module ID filter (e.g. "src/core").',
            },
            type: {
              type: 'string',
              description: 'Edge type filter. Default "import".',
              default: 'import',
            },
            compliant: {
              type: 'boolean',
              description: 'When true, returns only compliant edges; when false, only violations.',
            },
            layer: {
              type: 'string',
              description:
                'Filter edges where either source or target module belongs to this architectural layer (e.g. "core", "infra").',
            },
            limit: {
              type: 'number',
              description: 'Max edges to return (default: 50).',
            },
          },
        },
      },
      {
        name: 'spine_get_diagnostics',
        description:
          'Retrieve structural diagnostics for the codebase: dependency cycles, dead code candidates, and architectural hubs. Use this to identify architecture health risks before large refactors.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['cycles', 'dead-code', 'hubs', 'all'],
              description:
                'Diagnostic category: "cycles" (circular dependencies), "dead-code" (unreferenced modules), "hubs" (high fan-in modules), or "all" (merge all three).',
            },
            limit: {
              type: 'number',
              description: 'Max entries per category (default: 200).',
            },
          },
          required: ['type'],
        },
      },
      {
        name: 'spine_match_semantic',
        description:
          'Semantic keyword search across module roles, responsibilities, and invariants. Supports comma-separated OR groups and space-separated AND terms. Returns ranked module matches with match scores and field-level detail.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description:
                'Search query. Comma = OR, space = AND within a group. Example: "auth, database cache" matches modules about auth OR (database AND cache).',
            },
            limit: {
              type: 'number',
              description: 'Max matches to return (default: 50).',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'spine_get_change_impact',
        description:
          'Analyze the downstream impact of changing a file or module. Returns all modules that directly or transitively depend on the target, grouped by distance, with affected architectural rules. Use this before modifying shared modules.',
        inputSchema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              description:
                'Relative file path or module ID to analyze (e.g. "src/core/errors.ts" or "src/core").',
            },
            maxDepth: {
              type: 'number',
              description: 'Max BFS depth for transitive dependency traversal (default: 3).',
            },
          },
          required: ['file'],
        },
      },
      {
        name: 'spine_get_module_context',
        description:
          'Get the full governance context for a single module: semantic role and responsibilities, upstream/downstream dependencies, active rule violations, and diagnostic flags (cycles, dead code, hub status). Aggregates data from the knowledge graph and diagnostics.',
        inputSchema: {
          type: 'object',
          properties: {
            modulePath: {
              type: 'string',
              description:
                'Relative file path or module ID to query (e.g. "src/engines/graph-query.ts" or "src/engines").',
            },
          },
          required: ['modulePath'],
        },
      },
      {
        name: 'spine_get_semantic_diff',
        description:
          'Compare the semantic architecture between two git refs (commits, branches, tags). Shows which files changed role, responsibilities, public surface, or had drift events. Use this before merging a PR to understand architectural impact.',
        inputSchema: {
          type: 'object',
          properties: {
            oldRef: {
              type: 'string',
              description:
                'Base git ref (commit SHA, branch name, or tag), e.g. "main" or "HEAD~1"',
            },
            newRef: {
              type: 'string',
              description: 'Target git ref, e.g. "feature/my-change" or "HEAD"',
            },
            filePath: {
              type: 'string',
              description:
                'Optional file path filter. If provided, only returns results for this specific file.',
            },
          },
          required: ['oldRef', 'newRef'],
        },
      },
      {
        name: 'spine_check_operation',
        description:
          'Before reading or modifying a file, check whether the operation would violate any architecture rules. Returns allowed + warnings + violations. Use this to avoid accidental architecture breaches when importing modules or modifying critical paths.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description:
                'Repo-relative file path of the file being operated on, e.g. "src/cli/commands/deploy.ts"',
            },
            operation: {
              type: 'string',
              enum: ['read', 'write', 'delete', 'rename', 'import'],
              description: 'The operation to check: read, write, delete, rename, or import',
            },
            importTarget: {
              type: 'string',
              description:
                'Required for operation=import. The target file being imported, e.g. "src/infra/db.ts"',
            },
          },
          required: ['filePath', 'operation'],
        },
      },
      {
        name: 'spine_run_scan',
        description:
          'Run a scan of the codebase. Quick mode (default) uses AST only and completes in under 30 seconds. Full mode runs the complete scan pipeline. Use this when you need to refresh the knowledge graph or index.',
        inputSchema: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['quick', 'full'],
              description: 'Scan mode: "quick" (AST-only, ~30s) or "full" (complete scan pipeline)',
            },
          },
        },
      },
      {
        name: 'spine_run_sync',
        description:
          'Trigger an incremental sync to refresh the semantic index (.spine/index/) and regenerate enabled views (.spine/view/). Call this after checking spine_get_sync_status shows files needing sync, or after making code changes outside the current session.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'spine_get_config',
        description:
          'Read ArchSpine configuration settings. Returns the full config when no key is specified, or a specific config value when a key is provided. Use this to check which views are enabled, what LLM provider is configured, and what rules are active.',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description:
                'Optional config key to read. If omitted, returns the full configuration summary.',
              enum: ['viewLayer', 'enabledViews', 'llmProvider', 'all'],
            },
          },
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
        case 'spine_search_symbols':
          return this.searchSymbols(
            args.query as string,
            args.exact as boolean | undefined,
            args.limit as number | undefined,
          );
        case 'spine_preview_scan':
          return this.previewScan();
        case 'spine_get_drift_history':
          return this.getDriftHistory(args.filePath as string, args.limit as number | undefined);
        case 'spine_get_file_context':
          return this.getFileContext(args.filePath as string);
        case 'spine_get_view_data':
          return this.getViewData(
            args.viewType as string,
            args.limit as number | undefined,
            args.filter as
              | { kind?: string; layer?: string; minScore?: number; search?: string }
              | undefined,
            args.sort as { field?: string } | undefined,
            args.offset as number | undefined,
          );
        case 'spine_get_violations_summary':
          return this.getViolationsSummary();
        case 'spine_list_resource_templates':
          return this.listResourceTemplates();
        case 'spine_query_graph':
          return this.queryGraph(
            args.from as string | undefined,
            args.to as string | undefined,
            args.type as string | undefined,
            args.compliant as boolean | undefined,
            args.layer as string | undefined,
            args.limit as number | undefined,
          );
        case 'spine_get_diagnostics':
          return this.getDiagnostics(args.type as string, args.limit as number | undefined);
        case 'spine_match_semantic':
          return this.matchSemanticTool(args.query as string, args.limit as number | undefined);
        case 'spine_get_change_impact':
          return this.getChangeImpact(args.file as string, args.maxDepth as number | undefined);
        case 'spine_get_module_context':
          return this.getModuleContext(args.modulePath as string);
        case 'spine_get_semantic_diff':
          return this.getSemanticDiff(
            args.oldRef as string,
            args.newRef as string,
            args.filePath as string | undefined,
          );
        case 'spine_check_operation':
          return this.checkOperation(
            args.filePath as string,
            args.operation as string,
            args.importTarget as string | undefined,
          );
        case 'spine_run_scan':
          return this.runScan(args.mode as string | undefined);
        case 'spine_run_sync':
          return this.runSync();
        case 'spine_get_config':
          return this.getConfig(args.key as string | undefined);
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
      const safePath = this.normalizeToolFilePath('spine_query_invariants', filePath);
      const matchedRules = this.ruleEngine.getRulesForFile(safePath);
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

  private searchSymbols(query: string, exact?: boolean, limit?: number): string {
    if (typeof query !== 'string' || query.trim().length === 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_search_symbols' requires a non-empty 'query' argument.`,
        { context: { toolName: 'spine_search_symbols', query } },
      );
    }

    const effectiveLimit =
      limit !== undefined && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 50;

    if (exact) {
      const files = this.manifest.resolveSymbol(query);
      if (files.length === 0) {
        return JSON.stringify(
          {
            query,
            exact: true,
            matches: [],
            message: `Symbol '${query}' not found in any indexed file.`,
          },
          null,
          2,
        );
      }
      return JSON.stringify(
        {
          query,
          exact: true,
          totalMatches: files.length,
          matches: files.map((f) => ({ name: query, filePath: f })),
        },
        null,
        2,
      );
    }

    const results = this.manifest.searchSymbols(query, effectiveLimit);
    if (results.length === 0) {
      return JSON.stringify(
        {
          query,
          exact: false,
          matches: [],
          message: `No symbols found matching '${query}'.`,
        },
        null,
        2,
      );
    }

    const sliced = results.slice(0, effectiveLimit);

    const output: Record<string, unknown> = {
      query,
      exact: false,
      totalMatches: results.length,
      matches: sliced,
    };

    if (results.length > effectiveLimit) {
      output.truncated = true;
      output.truncationNote = `Results truncated (${sliced.length} of ${results.length}). Use a more specific query or increase limit.`;
    }

    return JSON.stringify(output, null, 2);
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

    const safePath = this.normalizeToolFilePath('spine_get_drift_history', filePath);

    if (limit !== undefined && (!Number.isFinite(limit) || Math.floor(limit) < 1)) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_drift_history' requires 'limit' to be a positive integer when provided.`,
        { context: { toolName: 'spine_get_drift_history', filePath: safePath, limit } },
      );
    }

    const normalizedLimit = limit !== undefined ? Math.floor(limit) : 5;
    const events = this.manifest.getDriftHistory(safePath, normalizedLimit);
    return JSON.stringify(events, null, 2);
  }

  private getSemanticDiff(oldRef: string, newRef: string, filePath?: string): string {
    const result: {
      oldRef: string;
      newRef: string;
      changedFiles: Array<{
        filePath: string;
        type: 'added' | 'removed' | 'modified';
        roleChanged?: boolean;
        oldRole?: string;
        newRole?: string;
        responsibilitiesChanged?: boolean;
        publicSurfaceChanged?: boolean;
        dependencyChanged?: boolean;
        driftDetected?: boolean;
        driftReason?: string | null;
      }>;
      summary: {
        totalChanges: number;
        roleChanges: number;
        surfaceChanges: number;
        dependencyChanges: number;
        driftEvents: number;
      };
    } = {
      oldRef,
      newRef,
      changedFiles: [],
      summary: {
        totalChanges: 0,
        roleChanges: 0,
        surfaceChanges: 0,
        dependencyChanges: 0,
        driftEvents: 0,
      },
    };

    try {
      const diffOutput = execSync(`git diff --name-status ${oldRef}...${newRef}`, {
        cwd: this.rootDir,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      })
        .toString()
        .trim();

      if (!diffOutput) {
        return JSON.stringify(
          {
            error: `No changes between ${oldRef} and ${newRef}. Are both valid refs?`,
          },
          null,
          2,
        );
      }

      const lines = diffOutput.split('\n').filter(Boolean);
      const maxFiles = filePath ? 200 : 50;

      for (const line of lines.slice(0, maxFiles)) {
        const [status, ...pathParts] = line.trim().split(/\s+/);
        const changedPath = pathParts.join(' ');

        // Filter to source files only (skip node_modules, .spine, etc.)
        if (!changedPath.startsWith('src/') && !changedPath.startsWith('tests/')) {
          continue;
        }
        if (changedPath.includes('node_modules')) {
          continue;
        }

        let type: 'added' | 'removed' | 'modified';
        if (status === 'A') {
          type = 'added';
        } else if (status === 'D') {
          type = 'removed';
        } else {
          type = 'modified';
        }

        const entry: {
          filePath: string;
          type: 'added' | 'removed' | 'modified';
          roleChanged?: boolean;
          oldRole?: string;
          newRole?: string;
          responsibilitiesChanged?: boolean;
          publicSurfaceChanged?: boolean;
          dependencyChanged?: boolean;
          driftDetected?: boolean;
          driftReason?: string | null;
        } = {
          filePath: changedPath,
          type,
        };

        // For modified files, check the .spine/index/ data from both refs
        if (type === 'modified') {
          try {
            const oldContent = execSync(
              `git show ${oldRef}:.spine/index/${changedPath}.json 2>/dev/null || true`,
              { cwd: this.rootDir, encoding: 'utf-8' },
            )
              .toString()
              .trim();

            const newContent = execSync(
              `git show ${newRef}:.spine/index/${changedPath}.json 2>/dev/null || true`,
              { cwd: this.rootDir, encoding: 'utf-8' },
            )
              .toString()
              .trim();

            if (oldContent && newContent) {
              try {
                const oldParsed = JSON.parse(oldContent);
                const newParsed = JSON.parse(newContent);
                const oldSemantic: Record<string, unknown> | undefined = oldParsed.semantic;
                const newSemantic: Record<string, unknown> | undefined = newParsed.semantic;

                if (oldSemantic?.role !== newSemantic?.role) {
                  entry.roleChanged = true;
                  entry.oldRole = oldSemantic?.role as string | undefined;
                  entry.newRole = newSemantic?.role as string | undefined;
                  result.summary.roleChanges++;
                }

                if (
                  JSON.stringify(oldSemantic?.responsibilities) !==
                  JSON.stringify(newSemantic?.responsibilities)
                ) {
                  entry.responsibilitiesChanged = true;
                  result.summary.surfaceChanges++;
                }

                if (
                  JSON.stringify(oldSemantic?.publicSurface) !==
                  JSON.stringify(newSemantic?.publicSurface)
                ) {
                  entry.publicSurfaceChanged = true;
                  result.summary.surfaceChanges++;
                }

                if (newSemantic?.driftDetected) {
                  entry.driftDetected = true;
                  entry.driftReason = (newSemantic.driftReason as string | null) || null;
                  result.summary.driftEvents++;
                }
              } catch {
                // JSON parse errors on index content — skip detailed diff
              }
            }
          } catch {
            // git show failed for this file — skip
          }
        }

        result.changedFiles.push(entry);
      }

      result.summary.totalChanges = result.changedFiles.length;
    } catch (e: unknown) {
      return JSON.stringify(
        { error: `Failed to compute diff: ${e instanceof Error ? e.message : String(e)}` },
        null,
        2,
      );
    }

    // Filter to specific file if requested
    if (filePath) {
      result.changedFiles = result.changedFiles.filter((f) => f.filePath === filePath);
    }

    return JSON.stringify(result, null, 2);
  }

  private getFileContext(filePath: string): string {
    if (typeof filePath !== 'string' || filePath.trim().length === 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_file_context' requires a non-empty 'filePath' argument.`,
        { context: { toolName: 'spine_get_file_context', filePath } },
      );
    }

    const safePath = this.normalizeToolFilePath('spine_get_file_context', filePath);
    const indexPath = path.join(this.spineDir, 'index', `${safePath}.json`);
    this.assertPathWithinParent(
      'spine_get_file_context',
      indexPath,
      path.join(this.spineDir, 'index'),
    );

    const readResult = readIndexDocument<SpineUnit>(this.rootDir, indexPath);
    if (!isCompatibleIndexDocument(readResult)) {
      if (readResult.status === 'missing') {
        return JSON.stringify(
          {
            filePath: safePath,
            error: `No index data found for ${safePath}. Run 'spine build' or 'spine sync' first.`,
          },
          null,
          2,
        );
      }
      return JSON.stringify(
        {
          filePath: safePath,
          error: `Index data for ${safePath} is invalid (${readResult.status}). Run 'spine build' to rebuild.`,
        },
        null,
        2,
      );
    }

    const unit = readResult.data;

    const matchedRules = this.ruleEngine.getRulesForFile(safePath);

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

  private getViewData(
    viewType: string,
    limit?: number,
    filter?: { kind?: string; layer?: string; minScore?: number; search?: string },
    sort?: { field?: string },
    offset?: number,
  ): string {
    const validTypes = [
      'risk-hotspots',
      'public-surface',
      'architecture-diagram',
      'project-health',
      'agent-briefing',
      'change-impact',
    ];
    if (!validTypes.includes(viewType)) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_view_data' requires 'viewType' to be one of: ${validTypes.join(', ')}.`,
        { context: { toolName: 'spine_get_view_data', viewType } },
      );
    }

    const viewPath = path.join(this.spineDir, 'view', 'data', `${viewType}.json`);
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

      // Apply limit to items[] or modules[] array if present, otherwise return full envelope
      const listKey = Array.isArray(raw.items)
        ? 'items'
        : Array.isArray(raw.modules)
          ? 'modules'
          : null;

      if (listKey) {
        let items = raw[listKey] as Record<string, unknown>[];

        // Apply filters
        if (filter) {
          if (filter.kind) {
            items = items.filter((item) => item.kind === filter!.kind);
          }
          if (filter.layer) {
            items = items.filter((item) => item.layer === filter!.layer);
          }
          if (filter.minScore !== undefined && filter.minScore > 0) {
            items = items.filter((item) => {
              const score = (item.totalScore as number) ?? (item.confidence as number) ?? 0;
              return score >= filter!.minScore!;
            });
          }
          if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            items = items.filter((item) => {
              const searchable = [
                item.summary,
                item.entrypoint,
                item.hotspotPath,
                item.id,
                ...(Array.isArray(item.symbols) ? (item.symbols as string[]) : []),
                ...(Array.isArray(item.riskFactors) ? (item.riskFactors as string[]) : []),
              ]
                .filter(Boolean)
                .join(' ');
              return searchable.toLowerCase().includes(searchLower);
            });
          }
        }

        // Apply sort
        if (sort?.field) {
          const sortField = sort.field;
          items = [...items].sort((a, b) => {
            if (sortField === 'score') {
              return ((b.totalScore as number) ?? 0) - ((a.totalScore as number) ?? 0);
            }
            if (sortField === 'name') {
              const nameA = (a.entrypoint || a.hotspotPath || a.id || '') as string;
              const nameB = (b.entrypoint || b.hotspotPath || b.id || '') as string;
              return nameA.localeCompare(nameB);
            }
            if (sortField === 'confidence') {
              return ((b.confidence as number) ?? 0) - ((a.confidence as number) ?? 0);
            }
            return 0;
          });
        }

        const totalCount = items.length;

        // Apply offset pagination
        const effectiveOffset =
          offset !== undefined && Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0;
        if (effectiveOffset > 0) {
          items = items.slice(effectiveOffset);
        }

        // Apply limit
        const effectiveLimit =
          limit !== undefined && Number.isFinite(limit) && limit > 0
            ? Math.floor(limit)
            : items.length;
        const sliced = items.slice(0, effectiveLimit);

        return JSON.stringify(
          {
            viewType: raw.viewType || viewType,
            generatedAt: raw.generatedAt,
            summary: raw.summary,
            [`${listKey}Count`]: sliced.length,
            totalCount,
            offset: effectiveOffset,
            truncated: sliced.length < items.length,
            appliedFilters: filter && Object.keys(filter).length > 0 ? filter : undefined,
            appliedSort: sort?.field || undefined,
            [listKey]: sliced,
          },
          null,
          2,
        );
      }

      // No list key — return full envelope as-is (e.g. architecture-diagram metadata)
      return JSON.stringify(raw, null, 2);
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

    const isFresh = status.needingSync === 0 && fs.existsSync(this.spineDir);

    const recommendation = isFresh
      ? 'Index data is current. File context reads are reliable.'
      : [
          !fs.existsSync(this.spineDir) ? "Semantic baseline missing → run 'spine build'." : null,
          status.needingSync > 0
            ? `${status.needingSync} file(s) changed since last sync → run 'spine sync'.`
            : null,
        ]
          .filter(Boolean)
          .join(' ');

    return JSON.stringify(
      {
        totalTracked: status.total,
        needingSync: status.needingSync,
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
    const projectIndex = path.join(indexDir, 'project.json');

    const baselineExists = fs.existsSync(manifestPath);
    const needsInit = this.manifest.needsInitialSync();

    let lastSyncAt: string | null = null;
    let lastSyncMode: string | null = null;
    let indexedUnitCount: number | null = null;
    let activeViolations: number | null = null;

    if (baselineExists) {
      try {
        const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
          sync?: { lastSyncAt?: string; lastSyncMode?: string; indexedUnitCount?: number };
        };
        lastSyncAt = raw.sync?.lastSyncAt ?? null;
        lastSyncMode = raw.sync?.lastSyncMode ?? null;
        indexedUnitCount = raw.sync?.indexedUnitCount ?? null;
      } catch {
        // manifest exists but unreadable
      }
    }

    // Query live DB for active violations (not the stale manifest.json snapshot).
    activeViolations = this.manifest.getActiveViolations().length;

    const publishSnapshotReady = fs.existsSync(indexDir) && fs.existsSync(projectIndex);

    let pendingAction: string | null = null;
    if (!baselineExists || needsInit) {
      pendingAction = "Run 'spine build' or 'spine sync' to initialize the project index.";
    } else if (!publishSnapshotReady) {
      pendingAction = "Run 'spine build' to rebuild the full distributable snapshot.";
    }

    return JSON.stringify(
      {
        baselineExists,
        needsInitialSync: needsInit,
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

  /**
   * Before reading or modifying a file, check whether the operation would
   * violate any architecture rules. Returns JSON with allowed, warnings, and
   * violations fields.
   */
  private checkOperation(filePath: string, operation: string, importTarget?: string): string {
    const validOperations = ['read', 'write', 'delete', 'rename', 'import'];
    if (!validOperations.includes(operation)) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_check_operation' requires 'operation' to be one of: ${validOperations.join(', ')}.`,
        { context: { toolName: 'spine_check_operation', operation } },
      );
    }

    const normalizedPath = this.normalizeToolFilePath('spine_check_operation', filePath);
    const fullPath = path.join(this.rootDir, normalizedPath);

    if (operation === 'import' && !importTarget) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_check_operation' requires 'importTarget' when operation is 'import'.`,
        {
          context: {
            toolName: 'spine_check_operation',
            filePath: normalizedPath,
            operation,
          },
        },
      );
    }

    const warnings: string[] = [];
    const violations: Array<{ ruleId: string; severity: string; reason: string }> = [];

    // 1. Check if file exists
    if (operation === 'read' && !fs.existsSync(fullPath)) {
      warnings.push(`File "${normalizedPath}" does not exist.`);
    }

    // 2. Load knowledge graph for hotspot and import violation checks
    const { graph } = this.loadKnowledgeGraph();
    if (graph) {
      // 2a. High-fan-in hub detection
      const moduleId = this.resolveToModuleId(graph, normalizedPath);
      if (moduleId) {
        const hubNode = graph.nodes.find(
          (n: KnowledgeGraphNode) => n.id === moduleId && n.fanIn > 10,
        );
        if (hubNode && (operation === 'write' || operation === 'delete')) {
          warnings.push(
            `"${normalizedPath}" is in a high-fan-in hub module "${moduleId}" (${hubNode.fanIn} dependents). Changes here have broad impact.`,
          );
        }
      }

      // 2b. Cross-layer import violation check via pre-computed knowledge graph edges
      if (operation === 'import' && importTarget) {
        const normalizedImport = this.normalizeToolFilePath('spine_check_operation', importTarget);
        const sourceModule = this.resolveToModuleId(graph, normalizedPath);
        const targetModule = this.resolveToModuleId(graph, normalizedImport);

        if (sourceModule && targetModule && sourceModule !== targetModule) {
          const violationEdge = graph.edges.find(
            (e) => e.from === sourceModule && e.to === targetModule && !e.compliant,
          );
          if (violationEdge) {
            violations.push({
              ruleId: violationEdge.ruleRef || 'unknown-rule',
              severity: 'error',
              reason:
                violationEdge.message ||
                `Import from "${sourceModule}" to "${targetModule}" violates architectural rules.`,
            });
          }
        }
      }
    }

    const allowed = violations.length === 0;

    return JSON.stringify({ allowed, warnings, violations }, null, 2);
  }

  /**
   * spine_run_scan: run a scan of the codebase. Quick mode (default) uses pure
   * AST-based (regex) analysis. Full mode creates a full Scanner instance that
   * respects the scan policy, gitignore, and protocol rules.
   */
  private async runScan(mode?: string): Promise<string> {
    try {
      if (mode === 'full') {
        const { Config } = await import('../../infra/config.js');
        const { Scanner } = await import('../../engines/scanner.js');
        const config = new Config(this.rootDir);
        const scanner = new Scanner(this.rootDir, config.getScanPolicy());
        const files = scanner.getAllTrackedFiles();

        const scannedAt = new Date().toISOString();
        const languageStats: Record<string, number> = {};

        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          languageStats[ext] = (languageStats[ext] || 0) + 1;
        }

        return JSON.stringify(
          {
            mode: 'full',
            scannedAt,
            fileCount: files.length,
            languageStats,
            status: 'ok',
          },
          null,
          2,
        );
      }

      // Default: quick scan (AST-only, no LLM)
      const { runQuickScan } = await import('../../engines/quick-scan.js');
      const result = runQuickScan(this.rootDir);

      return JSON.stringify(
        {
          mode: 'quick',
          scannedAt: result.scannedAt,
          fileCount: result.fileCount,
          languageStats: result.languageStats,
          status: 'ok',
        },
        null,
        2,
      );
    } catch (error) {
      return JSON.stringify(
        {
          mode: mode || 'quick',
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        },
        null,
        2,
      );
    }
  }

  /**
   * spine_run_sync: trigger an incremental sync to refresh the semantic index
   * and regenerate enabled views.
   */
  private async runSync(): Promise<string> {
    try {
      const { SyncService } = await import('../../services/sync-service.js');
      const syncService = new SyncService({
        rootDir: this.rootDir,
      });
      const stats = await syncService.sync();

      return JSON.stringify(
        {
          status: 'ok',
          message: `Sync complete: ${stats.processed} processed, ${stats.skipped} skipped, ${stats.failed} failed`,
          stats,
        },
        null,
        2,
      );
    } catch (error) {
      return JSON.stringify(
        {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        },
        null,
        2,
      );
    }
  }

  /**
   * spine_get_config: read ArchSpine configuration settings. Returns the full
   * config when no key is specified, or a specific config value when a key is
   * provided.
   */
  private getConfig(key?: string): string {
    const configPath = path.join(this.spineDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      return JSON.stringify(
        { error: `Config file not found at ${configPath}. Run 'spine init' first.` },
        null,
        2,
      );
    }

    try {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      if (key && key !== 'all') {
        const value = raw[key];
        if (value === undefined) {
          return JSON.stringify(
            {
              error: `Config key '${key}' not found. Available keys: viewLayer, enabledViews, llmProvider.`,
            },
            null,
            2,
          );
        }
        return JSON.stringify({ [key]: value }, null, 2);
      }

      // Return a curated summary of the full config
      const summary: Record<string, unknown> = {};
      const interestingKeys = ['viewLayer', 'enabledViews', 'llmProvider'];
      for (const k of interestingKeys) {
        if (raw[k] !== undefined) {
          summary[k] = raw[k];
        }
      }

      return JSON.stringify(summary, null, 2);
    } catch (error) {
      return JSON.stringify(
        {
          error: `Failed to read config: ${error instanceof Error ? error.message : String(error)}`,
        },
        null,
        2,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Graph query tools (S07)
  // -------------------------------------------------------------------------

  /**
   * Resolve a relative file path to the best-matching module ID in the
   * knowledge graph using longest-prefix matching.
   */
  private resolveToModuleId(graph: KnowledgeGraph, filePath: string): string | null {
    const nodeMap = new Map<string, KnowledgeGraphNode>();
    for (const node of graph.nodes) {
      nodeMap.set(node.id, node);
    }
    if (nodeMap.has(filePath)) {
      return filePath;
    }
    let bestMatch: string | null = null;
    let bestLen = 0;
    for (const node of graph.nodes) {
      const prefix = node.path + '/';
      if (filePath === node.path || filePath.startsWith(prefix)) {
        if (node.path.length > bestLen) {
          bestLen = node.path.length;
          bestMatch = node.id;
        }
      }
    }
    return bestMatch;
  }

  /**
   * Load the knowledge graph from .spine/view/data/knowledge-graph.json.
   * Returns null with an error message when the file is missing or unreadable.
   */
  private loadKnowledgeGraph(): { graph: KnowledgeGraph | null; error?: string } {
    const graphPath = path.join(this.spineDir, 'view', 'data', 'knowledge-graph.json');
    if (!fs.existsSync(graphPath)) {
      return { graph: null, error: 'Knowledge graph not found. Please run spine sync first.' };
    }
    try {
      const graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8')) as KnowledgeGraph;
      return { graph };
    } catch (e) {
      return {
        graph: null,
        error: `Failed to read knowledge graph: ${e instanceof Error ? e.message : String(e)}`,
      };
    }
  }

  /**
   * spine_query_graph: filter module-level dependency edges and return a
   * matching slice with a node summary.
   */
  private queryGraph(
    from?: string,
    to?: string,
    type?: string,
    compliant?: boolean,
    layer?: string,
    limit?: number,
  ): string {
    const effectiveType = type || 'import';
    const effectiveLimit =
      limit !== undefined && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 50;
    const effectiveCompliant = compliant !== undefined ? Boolean(compliant) : undefined;

    const { graph, error } = this.loadKnowledgeGraph();
    if (!graph) {
      return JSON.stringify({ error }, null, 2);
    }

    const nodeMap = new Map<string, KnowledgeGraphNode>();
    for (const node of graph.nodes) {
      nodeMap.set(node.id, node);
    }

    const filtered = graph.edges.filter((e) => {
      if (e.type !== effectiveType) {
        return false;
      }
      if (from !== undefined && e.from !== from) {
        return false;
      }
      if (to !== undefined && e.to !== to) {
        return false;
      }
      if (effectiveCompliant !== undefined && e.compliant !== effectiveCompliant) {
        return false;
      }
      if (layer !== undefined) {
        const fromNode = nodeMap.get(e.from);
        const toNode = nodeMap.get(e.to);
        if (fromNode?.layer !== layer && toNode?.layer !== layer) {
          return false;
        }
      }
      return true;
    });

    const totalCount = filtered.length;
    const sliced = filtered.slice(0, effectiveLimit);

    // Collect unique node IDs referenced in the result edges
    const referencedIds = new Set<string>();
    for (const e of sliced) {
      referencedIds.add(e.from);
      referencedIds.add(e.to);
    }

    const nodeSummary: {
      id: string;
      path: string;
      layer: string;
      role: string;
      fanIn: number;
      fanOut: number;
    }[] = [];
    for (const id of referencedIds) {
      const node = nodeMap.get(id);
      if (node) {
        nodeSummary.push({
          id: node.id,
          path: node.path,
          layer: node.layer,
          role: node.role,
          fanIn: node.fanIn,
          fanOut: node.fanOut,
        });
      }
    }

    const result: Record<string, unknown> = {
      totalEdges: totalCount,
      returnedEdges: sliced.length,
      edges: sliced,
      nodeSummary,
    };

    if (totalCount > effectiveLimit) {
      result.truncated = true;
      result.truncationNote = `结果已截断(${sliced.length} of ${totalCount})，请缩小查询范围`;
    }

    return JSON.stringify(result, null, 2);
  }

  /**
   * spine_get_diagnostics: return structural diagnostics (cycles, dead-code,
   * hubs) from pre-computed .spine/view/data/diagnostics/*.json files.
   */
  private getDiagnostics(type: string, limit?: number): string {
    const validTypes = ['cycles', 'dead-code', 'hubs', 'all'];
    if (!validTypes.includes(type)) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_diagnostics' requires 'type' to be one of: ${validTypes.join(', ')}.`,
        { context: { toolName: 'spine_get_diagnostics', type } },
      );
    }

    const effectiveLimit =
      limit !== undefined && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 200;

    const diagDir = path.join(this.spineDir, 'view', 'data', 'diagnostics');
    if (!fs.existsSync(diagDir)) {
      return JSON.stringify(
        {
          error: 'Diagnostics data not found. Please run spine sync first.',
        },
        null,
        2,
      );
    }

    let cycles: unknown[] = [];
    let deadCode: unknown[] = [];
    let hubs: unknown[] = [];

    if (type === 'cycles' || type === 'all') {
      const p = path.join(diagDir, 'cycles.json');
      if (fs.existsSync(p)) {
        try {
          cycles = JSON.parse(fs.readFileSync(p, 'utf-8'));
        } catch {
          cycles = [];
        }
      }
    }
    if (type === 'dead-code' || type === 'all') {
      const p = path.join(diagDir, 'dead-code.json');
      if (fs.existsSync(p)) {
        try {
          deadCode = JSON.parse(fs.readFileSync(p, 'utf-8'));
        } catch {
          deadCode = [];
        }
      }
    }
    if (type === 'hubs' || type === 'all') {
      const p = path.join(diagDir, 'hubs.json');
      if (fs.existsSync(p)) {
        try {
          hubs = JSON.parse(fs.readFileSync(p, 'utf-8'));
        } catch {
          hubs = [];
        }
      }
    }

    const result: Record<string, unknown> = { type };
    let anyTruncated = false;

    function applyLimit(items: unknown[], key: string, countKey: string): void {
      const total = items.length;
      const sliced = items.slice(0, effectiveLimit);
      result[key] = sliced;
      result[countKey] = total;
      if (total > effectiveLimit) {
        anyTruncated = true;
        result[`${key}Truncated`] = true;
      }
    }

    if (type === 'cycles' || type === 'all') {
      applyLimit(cycles, 'cycles', 'cycleCount');
    }
    if (type === 'dead-code' || type === 'all') {
      applyLimit(deadCode, 'deadCode', 'deadCodeCount');
    }
    if (type === 'hubs' || type === 'all') {
      applyLimit(hubs, 'hubs', 'hubCount');
    }

    if (anyTruncated) {
      result.truncated = true;
      result.truncationNote = '结果已截断，请缩小查询范围（调整 limit 参数）';
    }

    return JSON.stringify(result, null, 2);
  }

  /**
   * spine_match_semantic: run keyword search over module semantics and return
   * ranked matches.
   */
  private matchSemanticTool(query: string, limit?: number): string {
    if (typeof query !== 'string' || query.trim().length === 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_match_semantic' requires a non-empty 'query' argument.`,
        { context: { toolName: 'spine_match_semantic', query } },
      );
    }

    const { graph, error } = this.loadKnowledgeGraph();
    if (!graph) {
      return JSON.stringify({ error }, null, 2);
    }

    const results = matchSemantic(graph, query);
    const effectiveLimit =
      limit !== undefined && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 50;

    const totalCount = results.length;
    const sliced = results.slice(0, effectiveLimit);

    const output: Record<string, unknown> = {
      query,
      totalMatches: totalCount,
      matches: sliced,
    };

    if (totalCount > effectiveLimit) {
      output.truncated = true;
      output.truncationNote = `结果已截断(${sliced.length} of ${totalCount})，请缩小查询范围`;
    }

    return JSON.stringify(output, null, 2);
  }

  /**
   * spine_get_change_impact: analyze which modules would be affected by a
   * change to the given file or module.
   */
  private getChangeImpact(file: string, maxDepth?: number): string {
    if (typeof file !== 'string' || file.trim().length === 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_change_impact' requires a non-empty 'file' argument.`,
        { context: { toolName: 'spine_get_change_impact', file } },
      );
    }

    const safePath = this.normalizeToolFilePath('spine_get_change_impact', file);

    const { graph, error } = this.loadKnowledgeGraph();
    if (!graph) {
      return JSON.stringify({ error }, null, 2);
    }

    const effectiveMaxDepth =
      maxDepth !== undefined && Number.isFinite(maxDepth) && maxDepth > 0
        ? Math.floor(maxDepth)
        : 3;

    const report = changeImpact(graph, safePath, effectiveMaxDepth);

    return JSON.stringify(report, null, 2);
  }

  /**
   * spine_get_module_context: aggregate semantic, dependency, violation, and
   * diagnostic information for a single module.
   */
  private getModuleContext(modulePath: string): string {
    if (typeof modulePath !== 'string' || modulePath.trim().length === 0) {
      throw new ArchSpineError(
        ErrorCodes.McpToolInvalidArguments,
        `Tool 'spine_get_module_context' requires a non-empty 'modulePath' argument.`,
        { context: { toolName: 'spine_get_module_context', modulePath } },
      );
    }

    const safePath = this.normalizeToolFilePath('spine_get_module_context', modulePath);

    const { graph, error } = this.loadKnowledgeGraph();
    if (!graph) {
      return JSON.stringify({ error }, null, 2);
    }

    // Resolve file path → module ID
    const moduleId = this.resolveToModuleId(graph, safePath);
    if (!moduleId) {
      return JSON.stringify({ error: `No module found matching path: ${safePath}` }, null, 2);
    }

    const nodeMap = new Map<string, KnowledgeGraphNode>();
    for (const node of graph.nodes) {
      nodeMap.set(node.id, node);
    }
    const node = nodeMap.get(moduleId);
    if (!node) {
      return JSON.stringify({ error: `Module node not found: ${moduleId}` }, null, 2);
    }

    // Semantic info
    const semantic = {
      role: node.role,
      responsibilities: node.responsibilities,
      invariants: node.invariants,
      publicSurface: node.publicSurface,
    };

    // Dependency traversal
    const upstream = upstreamOf(graph, moduleId);
    const downstream = downstreamOf(graph, moduleId);

    // Violations involving this module
    const violations = violationEdges(graph).filter(
      (v) => v.from === moduleId || v.to === moduleId,
    );

    // Diagnostic flags
    const diagDir = path.join(this.spineDir, 'view', 'data', 'diagnostics');
    const cycleIds: string[] = [];
    const deadCodeMarks: { confidence: string; reason: string }[] = [];
    const hubMarks: { fanIn: number; percentile: number }[] = [];

    if (fs.existsSync(diagDir)) {
      // Cycles
      const cyclesPath = path.join(diagDir, 'cycles.json');
      if (fs.existsSync(cyclesPath)) {
        try {
          const cyclesData = JSON.parse(fs.readFileSync(cyclesPath, 'utf-8')) as {
            cycleId: string;
            nodes: string[];
          }[];
          for (const c of cyclesData) {
            if (c.nodes?.includes(moduleId)) {
              cycleIds.push(c.cycleId);
            }
          }
        } catch {
          // ignore unreadable diagnostics
        }
      }

      // Dead code
      const deadCodePath = path.join(diagDir, 'dead-code.json');
      if (fs.existsSync(deadCodePath)) {
        try {
          const deadCodeData = JSON.parse(fs.readFileSync(deadCodePath, 'utf-8')) as {
            moduleId: string;
            confidence: string;
            reason: string;
          }[];
          for (const d of deadCodeData) {
            if (d.moduleId === moduleId) {
              deadCodeMarks.push({ confidence: d.confidence, reason: d.reason });
            }
          }
        } catch {
          // ignore
        }
      }

      // Hubs
      const hubsPath = path.join(diagDir, 'hubs.json');
      if (fs.existsSync(hubsPath)) {
        try {
          const hubsData = JSON.parse(fs.readFileSync(hubsPath, 'utf-8')) as {
            moduleId: string;
            fanIn: number;
            percentile: number;
          }[];
          for (const h of hubsData) {
            if (h.moduleId === moduleId) {
              hubMarks.push({ fanIn: h.fanIn, percentile: h.percentile });
            }
          }
        } catch {
          // ignore
        }
      }
    }

    const result = {
      moduleId,
      semantic,
      graph: {
        fanIn: node.fanIn,
        fanOut: node.fanOut,
        violationCount: node.violationCount,
      },
      upstream: upstream.map((m) => ({
        moduleId: m.moduleId,
        path: m.path,
        layer: m.layer,
        role: m.role,
        distance: m.distance,
      })),
      downstream: downstream.map((m) => ({
        moduleId: m.moduleId,
        path: m.path,
        layer: m.layer,
        role: m.role,
        distance: m.distance,
      })),
      violations,
      diagnostics: {
        cycles: cycleIds,
        deadCode: deadCodeMarks,
        hubs: hubMarks,
      },
    };

    return JSON.stringify(result, null, 2);
  }
}
