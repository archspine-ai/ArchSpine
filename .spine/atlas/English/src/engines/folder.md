## Core Engine (`engine/`)

The `engine/` directory is the operational backbone of ArchSpine. It hosts all core services that transform raw file system data into structured architectural knowledge, enforce rules, generate diagnostics, and produce reports. The modules are logically grouped into several key implementation areas:

### Scanning & Discovery
- **`scanner.ts`** – Discovers all repository files using layered ignore rules (`.gitignore`, `.spineignore`, protocol exclusions) and optional git diff integration for incremental scanning. Returns a `ScanResult` with all and changed files.
- **`scanner-utils.ts`** – Provides path normalization, picomatch-based pattern matching, dry-run report formatting, and grouping counts for scanner output.
- **`scanner-git.ts`** – Defines a `ScannerGitClient` interface with a synchronous git command execution implementation, used by the scanner to detect changed files.

### Aggregation & Index Management
- **`aggregator.ts`** – Traverses `.spine/index` and `.spine/atlas` directories, reads and validates spine index documents, and constructs structured `SpineUnit` collections (`SpineFolderUnit`, `SpineProjectUnit`) for downstream sync and view generation. Integrates with an LLM client for semantic enrichment.

### Rule Engine & Context Analysis
- **`rules.ts`** – Loads, stores, and matches architectural rules (`SpineRuleDocument`) against file paths using glob patterns (including negation). Provides a public API for downstream enforcement.
- **`context.ts`** – Resolves relative import targets to absolute paths, extracts architectural rule keywords from file skeletons, computes relevance scores for dependency candidates, and produces structured diagnostics.
- **`context-path-resolver.ts`** – Utility that resolves relative import source strings to absolute filesystem paths, consulting language extension registries for existence checking.
- **`context-relevance.ts`** – Scores dependency candidates and target paths using rule keywords, symbol evidence, and path distance heuristics. Computes composite relevance scores combining multiple signals.

### Fix Generation
- **`fix.ts`** – Public API facade re-exporting `FixService`, `runFix`, and `FixRunSummary`.
- **`fix-prompt.ts`** – Generates LLM prompt templates for architectural violation fixes, formatting violation context into structured instructional prompts.

### Reporting, Diagnostics & Governance
- **`god.ts`** – Orchestrates generation of a comprehensive architectural dossier (“God Mode report”) from `.spine/index` data, producing a Markdown report with file counts, role distribution, and per-file details.
- **`info.ts`** – Generates a system info and health report, loading project manifest, configuration, secrets, and LLM settings. Checks for unauthorised mutations via spine-gate and reports sync status, language snapshots, and usage statistics.
- **`usage.ts`** – Generates formatted usage and audit reports from the Manifest data store, displaying token counts, estimated costs, and violation rows for governance visibility.
- **`check.ts`** – Public API barrel module for the check subsystem, re-exporting `CheckService`, `runCheck`, and `ValidationSummary`.

The engine modules are designed to work together as a pipeline: scanning discovers files, the aggregator builds structured units, the rule engine matches constraints, context analysis resolves dependencies and scores relevance, fix generation provides automated corrections, and the reporting modules deliver comprehensive diagnostics and governance insight.