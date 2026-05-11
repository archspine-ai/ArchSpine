---
outline: deep
---

# MCP Server Reference

Complete reference for the ArchSpine MCP server. The server exposes 21 tools,
4 resource URI templates, and 2 prompts over STDIO transport using the
JSON-RPC protocol.

**Source:** `src/infra/mcp/server.ts`, `src/infra/mcp/tools.ts`,
`src/infra/mcp/resources.ts`, `src/infra/mcp/context.ts`.

## Server Overview

| Property         | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| **Transport**    | STDIO                                                      |
| **Protocol**     | JSON-RPC (via `@modelcontextprotocol/sdk`)                 |
| **Server name**  | `archspine-mcp`                                            |
| **Version**      | Current package version (`src/types/protocol/versions.ts`) |
| **Capabilities** | `resources`, `tools`, `prompts`                            |
| **Read-only**    | Yes. No tools write `.spine/` protocol artifacts.          |
| **Source**       | `src/infra/mcp/server.ts`                                  |

### Starting the Server

```bash
spine mcp start
```

This command instantiates `ArchSpineMCPServer`, registers tool, resource, and
prompt handlers, and connects via `StdioServerTransport`. Logs startup to
stderr.

### Prerequisites

Most tools require `.spine/` to exist and be initialized. The exceptions are
`spine_get_baseline_status` and `spine_get_sync_status`, which are meta-tools
that work without `.spine/`. Run `spine init` and `spine build` before using
the server.

---

## MCP Tools

All tools are defined in `SpineTools.getToolDefinitions()` in
`src/infra/mcp/tools.ts`. Tools are grouped into five categories: Query,
Context, Status, Views, and Actions.

### Query Tools

#### 1. `spine_query_invariants`

Query architectural invariants (rules) that the codebase enforces. Use this
before modifying critical paths to ensure architectural boundaries are not
broken.

**Parameters**

| Parameter     | Type     | Required | Default | Description                                                                           |
| ------------- | -------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| `invariantId` | `string` | No       | --      | ID of a specific rule. When omitted, returns all rules.                               |
| `filePath`    | `string` | No       | --      | Relative file path. When set, returns only rules whose glob patterns match this file. |

**Return schema:** Formatted text. When `invariantId` is provided and found,
returns a single rule with all fields (ID, title, severity, appliesTo,
summary, rationale, bodyMarkdown). Otherwise returns a list of rules in the
format `- ruleId (sourceFile) [severity]: summary`.

**Validation:** `filePath` is sanitized via `normalizeToolFilePath` -- rejects
null bytes, absolute paths, and path traversal (`..` segments).

**Prerequisites:** `.spine/rules/` directory must exist.

---

#### 2. `spine_query_responsibilities`

Search for files handling specific responsibilities or roles within the
system.

**Parameters**

| Parameter | Type     | Required | Default | Description                                                        |
| --------- | -------- | -------- | ------- | ------------------------------------------------------------------ |
| `keyword` | `string` | **Yes**  | --      | Keyword to search within file semantic roles and responsibilities. |

**Return schema:**

```
Files matching '<keyword>':
- /path/to/file.ts: Role name
```

**Behavior:**

1. Reads all tracked files from `manifest.json`.
2. For each file, reads its index entry from `.spine/index/<path>.json`.
3. Checks `semantic.role` and `semantic.responsibilities[]` for
   case-insensitive substring match.
4. Reports warnings for invalid, incompatible, or unreadable index entries.

**Prerequisites:** Requires a runtime baseline (`manifest.json`). Throws
`MCP_RUNTIME_BASELINE_INCOMPLETE` without one.

---

#### 3. `spine_search_symbols`

Search for code symbols (exports, functions, classes) by name across the
codebase. Uses exact match when possible, falls back to fuzzy substring
search.

**Parameters**

| Parameter | Type      | Required | Default | Description                                                         |
| --------- | --------- | -------- | ------- | ------------------------------------------------------------------- |
| `query`   | `string`  | **Yes**  | --      | Symbol name to search for. Performs substring match (LIKE %query%). |
| `exact`   | `boolean` | No       | `false` | When true, uses exact name match only (faster, uses DB index).      |
| `limit`   | `number`  | No       | `50`    | Maximum results to return.                                          |

**Return schema:**

```json
{
  "query": "<query-string>",
  "exact": false,
  "totalMatches": 5,
  "matches": [
    {
      "name": "Config",
      "filePath": "src/infra/config.ts"
    }
  ],
  "truncated": false
}
```

**Behavior:**

1. In exact mode, calls `manifest.resolveSymbol(query)` for O(1) lookup.
2. In fuzzy mode, calls `manifest.searchSymbols(query, limit)` for substring
   matching across all indexed symbols.
3. Returns a JSON object with query metadata, match count, and match array.

**Data source:** Resolves symbols from `manifest.json` index.

**Prerequisites:** Requires a runtime baseline (`manifest.json`). Returns an
empty match array if `.spine/` is not initialized.

---

#### 4. `spine_match_semantic`

Semantic keyword search across module roles, responsibilities, and
invariants. Supports comma-separated OR groups and space-separated AND terms.

**Parameters**

| Parameter | Type     | Required | Default | Description                                                                                                                                 |
| --------- | -------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`   | `string` | **Yes**  | --      | Search query. Comma = OR, space = AND within a group. Example: `"auth, database cache"` matches modules about auth OR (database AND cache). |
| `limit`   | `number` | No       | `50`    | Maximum matches to return.                                                                                                                  |

**Return schema:**

```json
{
  "query": "<query-string>",
  "totalMatches": 5,
  "matches": [
    {
      "moduleId": "src/infra/db",
      "path": "src/infra",
      "matchScore": 0.85,
      "matchFields": ["responsibilities", "role"]
    }
  ],
  "truncated": false
}
```

**Query syntax:**

- Comma-separated groups = OR logic: `"auth, database"` matches either.
- Space within a group = AND logic: `"database cache"` matches both.
- Comma + space = OR groups containing AND terms: `"auth, database cache"`
  matches auth OR (database AND cache).

**Data source:** `.spine/view/data/knowledge-graph.json`.

**Prerequisites:** Knowledge graph must exist (`spine sync`).

---

#### 5. `spine_query_graph`

Query the module-level knowledge graph. Filter dependency edges by source
module, target module, edge type, compliance status, or architectural layer.

**Parameters**

| Parameter   | Type      | Required | Default    | Description                                                                                           |
| ----------- | --------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `from`      | `string`  | No       | --         | Source module ID filter, e.g. `src/engines`.                                                          |
| `to`        | `string`  | No       | --         | Target module ID filter, e.g. `src/core`.                                                             |
| `type`      | `string`  | No       | `"import"` | Edge type filter.                                                                                     |
| `compliant` | `boolean` | No       | --         | When `true`, only compliant edges; when `false`, only violations.                                     |
| `layer`     | `string`  | No       | --         | Filter edges where source or target module belongs to this architectural layer, e.g. `core`, `infra`. |
| `limit`     | `number`  | No       | `50`       | Maximum edges to return.                                                                              |

**Return schema:**

```json
{
  "totalEdges": 120,
  "returnedEdges": 3,
  "edges": [
    {
      "from": "src/services",
      "to": "src/infra",
      "type": "import",
      "compliant": true
    }
  ],
  "nodeSummary": [
    {
      "id": "src/services",
      "path": "src/services",
      "layer": "services",
      "role": "runtime-orchestration",
      "fanIn": 2,
      "fanOut": 5
    }
  ],
  "truncated": false
}
```

**Data source:** `.spine/view/data/knowledge-graph.json`. Returns an error
JSON object if the knowledge graph file is missing or unreadable.

**Prerequisites:** Knowledge graph must exist (`spine sync`).

---

#### 6. `spine_get_module_context`

Get the full governance context for a single module: semantic role and
responsibilities, upstream/downstream dependencies, active rule violations,
and diagnostic flags (cycles, dead code, hub status).

**Parameters**

| Parameter    | Type     | Required | Default | Description                                                                          |
| ------------ | -------- | -------- | ------- | ------------------------------------------------------------------------------------ |
| `modulePath` | `string` | **Yes**  | --      | Relative file path or module ID, e.g. `src/engines/graph-query.ts` or `src/engines`. |

**Return schema:**

```json
{
  "moduleId": "src/engines",
  "semantic": {
    "role": "business-logic",
    "responsibilities": ["graph-querying", "rule-checking"],
    "invariants": ["no-direct-db-access"],
    "publicSurface": ["queryGraph", "matchSemantic"]
  },
  "graph": {
    "fanIn": 3,
    "fanOut": 7,
    "violationCount": 1
  },
  "upstream": [
    {
      "moduleId": "src/core",
      "path": "src/core",
      "layer": "core",
      "role": "domain-types",
      "distance": 1
    }
  ],
  "downstream": [
    {
      "moduleId": "src/services",
      "path": "src/services",
      "layer": "services",
      "role": "runtime-orchestration",
      "distance": 1
    }
  ],
  "violations": [
    {
      "from": "src/engines",
      "to": "src/infra/db",
      "ruleRef": "no-direct-db-access",
      "compliant": false
    }
  ],
  "diagnostics": {
    "cycles": [],
    "deadCode": [],
    "hubs": [{ "fanIn": 15, "percentile": 92 }]
  }
}
```

**Module resolution:** Uses longest-prefix matching to resolve file paths to
module IDs in the knowledge graph. Returns an error if no matching module is
found.

**Data sources:** Knowledge graph, diagnostics directory
(`cycles.json`, `dead-code.json`, `hubs.json`), violation edges from
`violationEdges()`.

**Prerequisites:** Knowledge graph and diagnostics must exist (`spine sync`).

---

### Context Tools

#### 7. `spine_get_file_context`

Get the full governance context for a single file: matched rules, semantic
role and responsibilities, dependencies, public interface, exports, and drift
information. Use this before modifying any file to understand its
architectural constraints.

**Parameters**

| Parameter  | Type     | Required | Default | Description                                 |
| ---------- | -------- | -------- | ------- | ------------------------------------------- |
| `filePath` | `string` | **Yes**  | --      | Repo-relative path, e.g. `src/infra/db.ts`. |

**Return schema:**

```json
{
  "filePath": "src/infra/db.ts",
  "identity": {
    "language": "typescript",
    "fileKind": "source"
  },
  "rules": [
    "[Rule: no-direct-db-access] (Severity: error)\nTitle: ...\nSummary: ...\nContent: ..."
  ],
  "semantic": {
    "role": "database-access-layer",
    "responsibilities": ["connection-management", "query-execution"],
    "publicSurface": ["connect", "query", "transaction"],
    "driftDetected": false,
    "driftReason": null,
    "ruleViolations": []
  },
  "dependencies": {
    "dependsOn": [{ "targetPath": "src/core/config.ts", "relation": "imports" }],
    "dependedBy": [{ "targetPath": "src/services/user-service.ts", "relation": "imported-by" }],
    "fanIn": 3,
    "fanOut": 2
  },
  "skeleton": {
    "exports": ["connect", "query", "transaction", "close"],
    "structuralHints": "class-based with singleton pattern"
  }
}
```

**Validation:** `filePath` is sanitized and asserted to stay within
`.spine/index/` directory.

**Prerequisites:** `.spine/index/<filePath>.json` must exist (`spine sync`).

---

#### 8. `spine_get_change_impact`

Analyze the downstream impact of changing a file or module. Returns all
modules that directly or transitively depend on the target, grouped by
distance.

**Parameters**

| Parameter  | Type     | Required | Default | Description                                                               |
| ---------- | -------- | -------- | ------- | ------------------------------------------------------------------------- |
| `file`     | `string` | **Yes**  | --      | Relative file path or module ID, e.g. `src/core/errors.ts` or `src/core`. |
| `maxDepth` | `number` | No       | `3`     | Maximum BFS depth for transitive dependency traversal.                    |

**Return schema:** A JSON impact report from `changeImpact()` in
`src/engines/graph-query.ts`. Contains all modules directly or transitively
depending on the target, grouped by distance.

**Data source:** `.spine/view/data/knowledge-graph.json`.

**Validation:** `file` is sanitized via `normalizeToolFilePath`.

**Prerequisites:** Knowledge graph must exist (`spine sync`).

---

#### 9. `spine_get_drift_history`

Get the semantic evolution history of a file in reverse chronological order.
Call this when `driftDetected: true` is present in a file's index to
understand how its responsibilities changed over time.

**Parameters**

| Parameter  | Type     | Required | Default | Description                                           |
| ---------- | -------- | -------- | ------- | ----------------------------------------------------- |
| `filePath` | `string` | **Yes**  | --      | Repo-relative file path, e.g. `src/infra/db.ts`.      |
| `limit`    | `number` | No       | `5`     | Maximum events to return. Must be a positive integer. |

**Return schema:**

```json
[
  {
    "id": "drift-abc123",
    "timestamp": "2026-04-15T10:30:00.000Z",
    "previousRole": "data-access",
    "newRole": "cache-layer",
    "reason": "Responsibility shift from direct DB access to caching"
  }
]
```

**Validation:** `filePath` is sanitized via `normalizeToolFilePath`. `limit`
must be a finite positive integer when provided.

**Prerequisites:** Drift events must be recorded in the manifest.

---

### Status Tools

#### 10. `spine_get_sync_status`

Check whether the local `.spine/` index is current. Returns the number of
files that have changed since the last sync and whether the semantic
distribution snapshot is stale.

**Parameters**

None.

**Return schema:**

```json
{
  "totalTracked": 142,
  "needingSync": 3,
  "isFresh": false,
  "recommendation": "3 file(s) changed since last sync -> run 'spine sync'."
}
```

**Meta-tool:** Works without `.spine/`. If `.spine/` is missing,
`totalTracked` and `needingSync` are 0.

---

#### 11. `spine_get_baseline_status`

Get the health status of the local `.spine/` semantic baseline and
distribution snapshot. Shows whether the baseline exists, whether the semantic
snapshot is stale, when the last sync ran, and what action the maintainer should take.

**Parameters**

None.

**Return schema:**

```json
{
  "baselineExists": true,
  "isVirginState": false,
  "publishSnapshotReady": true,
  "lastSyncAt": "2026-05-08T14:30:00.000Z",
  "lastSyncMode": "incremental",
  "indexedUnitCount": 142,
  "activeViolations": 5,
  "pendingAction": null
}
```

**Meta-tool:** Works without `.spine/`. Reads `manifest.json` and checks for
existence of `index/` and `project.json`.

---

#### 12. `spine_get_violations_summary`

Get a summary of all active architectural rule violations tracked in the
`.spine/` runtime. Returns violation counts grouped by rule ID and the top
offending files.

**Parameters**

None.

**Return schema:**

```json
{
  "totalViolations": 5,
  "byRuleId": {
    "no-direct-db-access": { "count": 3, "severity": "error" },
    "layered-imports": { "count": 2, "severity": "warning" }
  },
  "topFiles": [
    { "filePath": "src/engines/query.ts", "count": 2 },
    { "filePath": "src/services/legacy.ts", "count": 1 }
  ],
  "recommendation": "5 active violation(s). Call spine_get_file_context on top files for details, or run 'spine check' for the full report."
}
```

**Behavior:** Reads active violations from `manifest.json`. Groups by rule
ID, sorts top 5 offending files by count. Returns a zero-violations response
when no active violations exist.

---

#### 13. `spine_get_diagnostics`

Retrieve structural diagnostics for the codebase: dependency cycles, dead
code candidates, and architectural hubs. Use this to identify architecture
health risks before large refactors.

**Parameters**

| Parameter | Type                                               | Required | Default | Description                      |
| --------- | -------------------------------------------------- | -------- | ------- | -------------------------------- |
| `type`    | `"cycles"` \| `"dead-code"` \| `"hubs"` \| `"all"` | **Yes**  | --      | Diagnostic category to retrieve. |
| `limit`   | `number`                                           | No       | `200`   | Maximum entries per category.    |

**Return schema:**

```json
{
  "type": "all",
  "cycles": [{ "cycleId": "cycle-1", "nodes": ["src/a", "src/b", "src/c"] }],
  "cycleCount": 1,
  "deadCode": [
    { "moduleId": "src/legacy", "confidence": "high", "reason": "No incoming dependencies" }
  ],
  "deadCodeCount": 3,
  "hubs": [{ "moduleId": "src/core/config", "fanIn": 25, "percentile": 95 }],
  "hubCount": 5,
  "truncated": false
}
```

**Data source:** `.spine/view/data/diagnostics/cycles.json`,
`dead-code.json`, `hubs.json`. Returns an error JSON object if the
diagnostics directory is missing.

**Prerequisites:** Diagnostics must exist (`spine sync`).

---

#### 14. `spine_get_config`

Read ArchSpine configuration settings. Returns the full config summary when
no key is specified, or a specific config value when a key is provided.

**Parameters**

| Parameter | Type     | Required | Default | Description                                                                       |
| --------- | -------- | -------- | ------- | --------------------------------------------------------------------------------- |
| `key`     | `string` | No       | --      | Optional config key. One of `viewLayer`, `enabledViews`, `llmProvider`, or `all`. |

**Return schema:**

```json
{
  "viewLayer": "full",
  "enabledViews": ["public-surface", "risk-hotspots", "architecture-diagram"],
  "llmProvider": "anthropic"
}
```

When a specific key is provided, returns only that key's value:

```json
{
  "llmProvider": "anthropic"
}
```

**Data source:** `.spine/config.json`.

---

### Views Tools

#### 15. `spine_get_view_data`

Read pre-computed view data for any enabled view type. Views are generated
by deterministic algorithms with zero LLM cost.

**Parameters**

| Parameter  | Type     | Required | Default | Description                                                                                                                            |
| ---------- | -------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `viewType` | `string` | **Yes**  | --      | One of: `public-surface`, `risk-hotspots`, `architecture-diagram`, `project-health`, `agent-briefing`, `change-impact`.                |
| `limit`    | `number` | No       | --      | Maximum items to return (only applies to views with `items` or `modules` arrays).                                                      |
| `filter`   | `object` | No       | --      | Optional filters. Properties: `kind` (string), `layer` (string), `minScore` (number), `search` (string for free-text substring match). |
| `sort`     | `object` | No       | --      | Sort configuration. Properties: `field` — one of `"score"`, `"name"`, `"confidence"`.                                                  |
| `offset`   | `number` | No       | `0`     | Number of items to skip before returning results (for pagination).                                                                     |

**Return schema:**

```json
{
  "viewType": "risk-hotspots",
  "generatedAt": "2026-05-08T14:30:00.000Z",
  "summary": "Top risk hotspots by structural complexity",
  "itemsCount": 10,
  "totalCount": 25,
  "offset": 0,
  "truncated": true,
  "appliedFilters": {
    "minScore": 0.5
  },
  "appliedSort": "score",
  "items": [
    {
      "hotspotPath": "src/core/parser.ts",
      "totalScore": 0.85,
      "riskFactors": ["high-cyclomatic-complexity", "many-dependents"]
    }
  ]
}
```

**Validation:** `viewType` must be one of the six valid types. Returns an
error if the view file does not exist.

**Data source:** `.spine/view/data/<viewType>.json`.

**View types:**

| View Type              | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `public-surface`       | Fast repo entry surface map for readers and agents.             |
| `risk-hotspots`        | Structurally risky files with transparent score breakdowns.     |
| `architecture-diagram` | Full-sync deterministic architecture diagram metadata.          |
| `project-health`       | Human-readable project health report with topology and metrics. |
| `agent-briefing`       | One-page project briefing for AI agents.                        |
| `change-impact`        | Pre-computed BFS impact radius for every module.                |

---

#### 16. `spine_list_resource_templates`

List the discoverable `spine://` URI templates exposed by the MCP server.
Use this to discover folder and file resource patterns before reading them.

**Parameters**

None.

**Return schema:**

```json
[
  {
    "uriTemplate": "spine://project",
    "name": "Project Architecture topology",
    "description": "Get the full project-level architecture overview."
  },
  {
    "uriTemplate": "spine://folder/{dirPath}",
    "name": "Folder Level Architecture",
    "description": "Get the architecture and file responsibilities within a specific directory."
  },
  {
    "uriTemplate": "spine://file/{filePath}",
    "name": "File Semantic Contract",
    "description": "Get the semantic contract, architectural invariants, and structural skeleton for a specific file."
  },
  {
    "uriTemplate": "spine://view/{viewType}",
    "name": "View Data",
    "description": "Get the pre-computed view data for any enabled view type."
  }
]
```

---

#### 17. `spine_preview_scan`

Preview the effective ScanPolicy, ignore-chain order, and current scan
boundary before running a large analysis or indexing operation.

**Parameters**

None.

**Return schema:** Text report from `Scanner.formatDryRunReport()`. Shows
which files and directories are included or excluded, the effective
ignore-chain order, and the current scan boundary.

**Behavior:** Instantiates a `Scanner` with the current configuration's scan
policy and prints the dry-run report. Works without `.spine/`.

---

### Actions Tools

#### 18. `spine_run_scan`

Run a scan of the codebase. Quick mode (default) uses AST-based analysis and
completes in under 30 seconds. Full mode runs the complete scan pipeline
including gitignore and protocol rules.

**Parameters**

| Parameter | Type     | Required | Default   | Description                                                                 |
| --------- | -------- | -------- | --------- | --------------------------------------------------------------------------- |
| `mode`    | `string` | No       | `"quick"` | Scan mode: `"quick"` (AST-only, ~30s) or `"full"` (complete scan pipeline). |

**Return schema:**

```json
{
  "mode": "quick",
  "scannedAt": "2026-05-09T10:00:00.000Z",
  "fileCount": 142,
  "languageStats": {
    ".ts": 120,
    ".json": 22
  },
  "status": "ok"
}
```

On failure:

```json
{
  "mode": "full",
  "status": "error",
  "error": "Error message"
}
```

**Prerequisites:** Requires `.spine/` to exist for full mode.

---

#### 19. `spine_run_sync`

Trigger an incremental sync to refresh the semantic index
(`.spine/index/`) and regenerate enabled views (`.spine/view/`). Call this
after `spine_get_sync_status` shows files needing sync, or after making code
changes outside the current session.

**Parameters**

None.

**Return schema:**

```json
{
  "status": "ok",
  "message": "Sync complete: 142 processed, 0 skipped, 0 failed",
  "stats": {
    "processed": 142,
    "skipped": 0,
    "failed": 0
  }
}
```

On failure:

```json
{
  "status": "error",
  "error": "Error message"
}
```

**Prerequisites:** Requires `.spine/` to exist.

---

#### 20. `spine_get_semantic_diff`

Compare the semantic architecture between two git refs (commits, branches,
tags). Shows which files changed role, responsibilities, public surface, or
had drift events. Use this before merging a PR to understand architectural
impact.

**Parameters**

| Parameter  | Type     | Required | Default | Description                                                                       |
| ---------- | -------- | -------- | ------- | --------------------------------------------------------------------------------- |
| `oldRef`   | `string` | **Yes**  | --      | Base git ref (commit SHA, branch name, or tag), e.g. `"main"` or `"HEAD~1"`.      |
| `newRef`   | `string` | **Yes**  | --      | Target git ref, e.g. `"feature/my-change"` or `"HEAD"`.                           |
| `filePath` | `string` | No       | --      | Optional file path filter. When set, only returns results for this specific file. |

**Return schema:**

```json
{
  "oldRef": "main",
  "newRef": "feature/my-change",
  "changedFiles": [
    {
      "filePath": "src/services/user-service.ts",
      "type": "modified",
      "roleChanged": true,
      "oldRole": "data-access",
      "newRole": "business-logic",
      "responsibilitiesChanged": true,
      "publicSurfaceChanged": false,
      "dependencyChanged": true,
      "driftDetected": true,
      "driftReason": "Responsibility migration"
    }
  ],
  "summary": {
    "totalChanges": 5,
    "roleChanges": 1,
    "surfaceChanges": 2,
    "dependencyChanges": 3,
    "driftEvents": 1
  }
}
```

**Behavior:** Runs `git diff --name-status` between the two refs, then
compares `.spine/index/` data for modified files from both refs using
`git show`. Only analyzes source files under `src/` and `tests/`.

**Prerequisites:** Must be in a git repository with `.spine/` data committed.

---

#### 21. `spine_check_operation`

Before reading or modifying a file, check whether the operation would violate
any architecture rules. Returns whether the operation is allowed, along with
warnings and violations.

**Parameters**

| Parameter      | Type     | Required | Default | Description                                                              |
| -------------- | -------- | -------- | ------- | ------------------------------------------------------------------------ |
| `filePath`     | `string` | **Yes**  | --      | Repo-relative file path of the file being operated on.                   |
| `operation`    | `string` | **Yes**  | --      | One of: `"read"`, `"write"`, `"delete"`, `"rename"`, `"import"`.         |
| `importTarget` | `string` | No       | --      | Required when `operation` is `"import"`. The target file being imported. |

**Return schema:**

```json
{
  "allowed": true,
  "warnings": [],
  "violations": []
}
```

When a violation is detected:

```json
{
  "allowed": false,
  "warnings": [],
  "violations": [
    {
      "ruleId": "no-direct-db-access",
      "severity": "error",
      "reason": "Import from \"src/services\" to \"src/infra/db\" violates architectural rules."
    }
  ]
}
```

**Validation checks:**

1. File existence warning for `read` operations on non-existent files.
2. High-fan-in hub detection: warns when writing to or deleting files in
   modules with more than 10 dependents.
3. Cross-layer import violation detection via pre-computed knowledge graph
   edges (only for `import` operations with `importTarget`).

**Prerequisites:** Knowledge graph must exist for hub and import checks.

---

## MCP Resources

The MCP server registers 4 `spine://` URI templates, defined in
`src/infra/mcp/resources.ts`. Resources are read via
`ReadResourceRequestSchema`.

### Resource List

| URI                        | Name                          | MIME Type          | Description                                                        |
| -------------------------- | ----------------------------- | ------------------ | ------------------------------------------------------------------ |
| `spine://project`          | Project Architecture topology | `application/json` | Full project-level architecture overview.                          |
| `spine://folder/{dirPath}` | Folder Level Architecture     | `application/json` | Architecture and file responsibilities within a directory.         |
| `spine://file/{filePath}`  | File Semantic Contract        | `application/json` | Semantic contract, invariants, and structural skeleton for a file. |
| `spine://view/{viewType}`  | View Data                     | `application/json` | Pre-computed view data for any enabled view type.                  |

### Resource Path Resolution

Each resource URI resolves to a file in `.spine/`:

| URI                        | Resolution path                                                                 |
| -------------------------- | ------------------------------------------------------------------------------- |
| `spine://project`          | `.spine/docs/en-US/project.md` (preferred) or `.spine/index/project.json`       |
| `spine://folder/{dirPath}` | `.spine/docs/en-US/<dirPath>/folder.md` or `.spine/index/<dirPath>/folder.json` |
| `spine://file/{filePath}`  | `.spine/index/<filePath>.json`                                                  |
| `spine://view/{viewType}`  | `.spine/view/data/<viewType>.json`                                              |

### View Types for `spine://view/{viewType}`

Supported view types for the view resource:

| View Type              | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `public-surface`       | Fast repo entry surface map for readers and agents.             |
| `risk-hotspots`        | Structurally risky files with transparent score breakdowns.     |
| `architecture-diagram` | Full-sync deterministic architecture diagram metadata.          |
| `project-health`       | Human-readable project health report with topology and metrics. |
| `agent-briefing`       | One-page project briefing for AI agents.                        |
| `change-impact`        | Pre-computed BFS impact radius for every module.                |

### Resource Validation

All path parameters (dirPath, filePath, viewType) are validated against:

- Null byte injection.
- Invalid percent-encoding.
- Absolute paths (both POSIX and Windows).
- Path traversal (`..` segments).
- Resolution outside `.spine/` directory.

For `spine://file/{filePath}`, the index document is validated for schema
compatibility. Data stripping is applied to remove `provenance`,
`skeleton.declaredSymbols`, and empty `graph.symbolEdges` to prevent agent
context bloat.

### Resource Error Codes

| Error Code                     | Condition                                                   |
| ------------------------------ | ----------------------------------------------------------- |
| `MCP_RESOURCE_INVALID_URI`     | Malformed URI, null bytes, absolute path, or path traversal |
| `MCP_RESOURCE_NOT_FOUND`       | Resolved file does not exist                                |
| `MCP_RESOURCE_INVALID_CONTENT` | File exists but content is invalid or schema-incompatible   |
| `MCP_CONTEXT_ACCESS_DENIED`    | Context gate blocked access                                 |
| `MCP_READ_FAILED`              | General read failure                                        |

---

## MCP Prompts

The MCP server registers two prompts, defined in `src/infra/mcp/server.ts`.
Prompts are invoked via `GetPromptRequestSchema`.

### `architectural_context`

Guides an agent through gathering architectural context before modifying a
file. The returned messages direct the agent to call three tools in sequence.

**Parameters**

| Parameter  | Type     | Required | Description                                                        |
| ---------- | -------- | -------- | ------------------------------------------------------------------ |
| `filePath` | `string` | **Yes**  | Relative file path to get context for, e.g. `src/services/foo.ts`. |

**Returned messages:** A single user message containing step-by-step
instructions:

1. Call `spine_get_file_context` with the given file path to understand the
   file's purpose and applicable rules.
2. Call `spine_get_change_impact` with the given file path to understand
   what other modules depend on this file.
3. Call `spine_check_operation` with the given file path and
   `operation="write"` to check for rule violations.

### `pre_write_checklist`

Runs a standardized safety checklist before writing to a file. The returned
messages direct the agent to validate the operation, check context, and
assess impact.

**Parameters**

| Parameter      | Type     | Required | Description                                                              |
| -------------- | -------- | -------- | ------------------------------------------------------------------------ |
| `filePath`     | `string` | **Yes**  | Relative file path to check.                                             |
| `operation`    | `string` | **Yes**  | The operation to perform: `read`, `write`, `delete`, `rename`, `import`. |
| `importTarget` | `string` | No       | Required when `operation` is `"import"`. The file being imported.        |

**Returned messages:** A single user message containing a checklist:

1. Call `spine_check_operation` with the given file path and operation. If
   violations are returned, do not proceed.
2. Call `spine_get_file_context` with the given file path to read the file's
   role, responsibilities, and matching architectural rules.
3. (Only for `write` or `delete` operations) Call `spine_get_change_impact`
   with the given file path to understand affected modules.

---

## MCP Context Gate

The context gate controls whether resources can be read without first priming
context. Defined in `src/infra/mcp/context.ts`.

### Modes

| Mode            | Behavior                                                                             |
| --------------- | ------------------------------------------------------------------------------------ |
| `off`           | No priming required. All resources are accessible immediately.                       |
| `project-first` | Must read `spine://project` before accessing folder or file resources.               |
| `search-first`  | Must call one of the search-priming tools before accessing folder or file resources. |

### Search-Priming Tools

When context mode is `search-first`, calling any of these tools primes the
context:

1. `spine_query_invariants`
2. `spine_query_responsibilities`
3. `spine_preview_scan`
4. `spine_get_sync_status`
5. `spine_get_baseline_status`
6. `spine_get_violations_summary`

The context mode is set in `.spine/config.json` at `mcp.contextMode`,
defaulting to `"off"`.

### Gate Rules

| Resource Kind | `off`   | `project-first` (unprimed) | `project-first` (primed) | `search-first` (unprimed) | `search-first` (primed) |
| ------------- | ------- | -------------------------- | ------------------------ | ------------------------- | ----------------------- |
| `project`     | Allowed | Allowed + primes           | Allowed                  | Allowed                   | Allowed                 |
| `folder`      | Allowed | Blocked                    | Allowed                  | Blocked                   | Allowed                 |
| `file`        | Allowed | Blocked                    | Allowed                  | Blocked                   | Allowed                 |

---

## Error Codes

All MCP error codes are defined in `src/core/errors.ts`.

### Tool Error Codes

| Error Code                        | Condition                                         |
| --------------------------------- | ------------------------------------------------- |
| `MCP_RUNTIME_MISSING`             | `.spine/` directory does not exist.               |
| `MCP_RUNTIME_BASELINE_INCOMPLETE` | Runtime baseline incomplete (no `manifest.json`). |
| `MCP_TOOL_UNKNOWN`                | Unknown tool name passed to `executeTool`.        |
| `MCP_TOOL_INVALID_ARGUMENTS`      | Invalid or missing required arguments.            |
| `MCP_TOOL_INDEX_READ_FAILED`      | Failed to read an index entry.                    |
| `MCP_TOOL_INDEX_INVALID_CONTENT`  | Invalid JSON or incompatible schema in index.     |
| `MCP_TOOL_EXECUTION_FAILED`       | General tool execution failure.                   |

### Resource Error Codes

| Error Code                     | Condition                                                   |
| ------------------------------ | ----------------------------------------------------------- |
| `MCP_RESOURCE_INVALID_URI`     | Malformed URI, null bytes, absolute path, or path traversal |
| `MCP_RESOURCE_NOT_FOUND`       | Resolved file does not exist                                |
| `MCP_RESOURCE_INVALID_CONTENT` | File exists but content is invalid or schema-incompatible   |
| `MCP_CONTEXT_ACCESS_DENIED`    | Context gate blocked access                                 |
| `MCP_READ_FAILED`              | General read failure                                        |
