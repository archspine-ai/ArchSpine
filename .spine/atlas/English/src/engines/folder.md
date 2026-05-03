# ArchSpine Core Engine Module

This directory houses the core engine of the ArchSpine mirror system. It provides scanning, context resolution, rule enforcement, and reporting capabilities. The components collectively implement the system's operational logic, including file system scanning with ignore rules and git diff integration, architectural rule loading and matching, dependency and relevance analysis using path heuristics and symbol evidence, context resolution for architectural diagnostics, generation of violation fix prompts and reports, system health and usage reporting, and aggregation of spine index data into structured unit collections.

## Notable Components

The module is organized into several functional groups:

### Scanning and File Discovery
- **`scanner.ts`** — Core file system scanner that discovers, filters, and reports repository files using layered ignore rules (`.gitignore`, `.spineignore`), `picomatch` pattern matching, and git diff integration for incremental scans. Generates `ScanResult` objects with both full and changed file lists.
- **`scanner-utils.ts`** — Utility module providing path normalization, `picomatch`-based pattern matching, and dry-run report formatting for scan operations.
- **`scanner-git.ts`** — Git command execution client interface and default implementation delegating to `child_process.execFileSync`.

### Rule Engine
- **`rules.ts`** — Loads, stores, and matches architectural rules (`SpineRuleDocument`) against file paths using glob patterns (including negation via `!`). Leverages `picomatch` for efficient pattern matching.

### Context and Relevance Analysis
- **`context.ts`** — Architectural context resolution engine that resolves relative import targets, extracts rule keywords from source skeletons, computes relevance scores, and generates structured diagnostics for dependency candidates.
- **`context-path-resolver.ts`** — Path resolution utility that resolves relative import source strings to absolute file paths, consulting `LangRegistry` for valid extensions.
- **`context-relevance.ts`** — Relevance scoring engine for dependency candidates and target paths using rule-derived keywords, symbol evidence, and path distance heuristics.

### Reporting and Diagnostics
- **`fix.ts`** and **`fix-prompt.ts`** — Public API facade for the fix service and an LLM prompt template generator for architectural violation fixes.
- **`check.ts`** — Public API barrel module re-exporting `CheckService`, `runCheck`, and `ValidationSummary`.
- **`info.ts`** — Generates comprehensive system info and health reports, inspecting manifest, config, secrets, and LLM configuration. Detects protected output mutations and reports sync status.
- **`usage.ts`** — Generates formatted usage and audit reports from the Manifest data store, including token counts, estimated costs, and violation details.
- **`god.ts`** — CLI orchestrator for generating a comprehensive architectural dossier (God Mode report) from `.spine/index`, producing a Markdown report with file ledger entries.

### Aggregation
- **`aggregator.ts`** — Core engine class that traverses the `.spine/index` and `.spine/atlas` directories, reads and validates spine index documents, and constructs structured `SpineUnit` collections (e.g., `SpineFolderUnit`, `SpineProjectUnit`) for downstream sync and view operations.

## Key Implementation Areas

- **Scanning & Ignore Logic**: The scanner subsystem integrates multiple ignore layers and git diff for incremental updates.
- **Rule Matching & Enforcement**: The rules engine supports rich glob patterns and negation for precise architectural rule application.
- **Context Resolution**: The context pipeline resolves imports, extracts keywords, and scores relevance to provide actionable diagnostics.
- **Reporting**: Multiple reporting modules cover health, usage, violations, and comprehensive architecture dossiers.
- **Aggregation**: The aggregator transforms raw spine data into structured collections used by the sync and view layers.