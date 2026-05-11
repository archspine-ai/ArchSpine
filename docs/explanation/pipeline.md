---
outline: deep
---

# Sync Pipeline

## Why a Staged Pipeline

`spine sync` breaks its work into sequential stages. Each stage has a single responsibility, and each persists its progress independently. This design exists because LLM-based code analysis is slow, expensive, and prone to network failures. If the connection drops during summarization for file 38 of 100, the next run picks up at the last completed stage instead of starting over.

The pipeline contains six stages, grouped into three conceptual phases:

| Phase  | Stages                                  | LLM Needed | Purpose                                            |
| ------ | --------------------------------------- | ---------- | -------------------------------------------------- |
| Scan   | Reconcile, Scan/Cleanup, AST Extraction | No         | Discover files, detect changes, extract structures |
| Index  | Summarization                           | Yes        | Produce semantic index entries                     |
| Derive | State Commit, Post-Commit Derivation    | No         | Write index, compute views                         |

## Scanning

Scanning has two responsibilities: file discovery and structure extraction.

### File Discovery

The scanner resolves every file tracked by your VCS and filters for supported extensions. The full pipeline (sync/build) supports these languages via @ast-grep/napi:

| Language   | Extensions                           | AST Package               |
| ---------- | ------------------------------------ | ------------------------- |
| TypeScript | `.ts`, `.tsx`                        | Built into @ast-grep/napi |
| JavaScript | `.js`, `.jsx`                        | Built into @ast-grep/napi |
| Python     | `.py`                                | @ast-grep/lang-python     |
| Go         | `.go`                                | @ast-grep/lang-go         |
| Rust       | `.rs`                                | @ast-grep/lang-rust       |
| Java       | `.java`                              | @ast-grep/lang-java       |
| C          | `.c`, `.h`                           | @ast-grep/lang-c          |
| C++        | `.cpp`, `.cc`, `.cxx`, `.hpp`, `.hh` | @ast-grep/lang-cpp        |
| Swift      | `.swift`                             | @ast-grep/lang-swift      |
| PHP        | `.php`                               | @ast-grep/lang-php        |
| Ruby       | `.rb`                                | @ast-grep/lang-ruby       |
| Kotlin     | `.kt`, `.kts`                        | @ast-grep/lang-kotlin     |
| Scala      | `.scala`, `.sc`                      | @ast-grep/lang-scala      |
| Elixir     | `.ex`, `.exs`                        | @ast-grep/lang-elixir     |

Language support is dynamic. Packages like `@ast-grep/lang-python` load at runtime. If a package is unavailable, the pipeline reports a warning and skips files in that language without blocking the rest of the scan.

### Structure Extraction (AST)

After file discovery, the AST Extraction stage parses each changed file using language-specific parsers from @ast-grep/napi. This produces the file's public surface as structured JSON: exports, function signatures, type definitions, and import statements.

This stage covers all 14 language families listed above and feeds the raw structural data to the Summarization stage. It does not call any LLM.

### Quick Scan

`spine scan --quick` is a standalone, lightweight alternative that uses regex-based parsing, not a full AST. It covers 10 languages and runs in roughly 30 seconds for a 50,000-line repository with zero LLM cost.

```
spine scan --quick
```

The quick scan produces a dependency graph (nodes + edges) stored as `.spine/view/data/knowledge-graph.json`. It skips `tests/`, `fixtures/`, `node_modules/`, `dist/`, `build/`, `.git/`, `.spine/`, `coverage/`, `out/`, and directories starting with a dot.

Details: [Quick Scan vs Full Scan](./quick-vs-full-scan)

## Delta Detection

The pipeline does not re-process every file on every run. Delta detection identifies exactly what changed.

### SHA-256 Hash Comparison

After the first full build, every index entry stores the SHA-256 hash of its source file. The Reconcile stage compares each file's current hash against the stored hash in the manifest. Files with a matching hash are skipped entirely — no AST parsing, no LLM call.

### Git Diff for Incremental Sync

For incremental sync (`spine sync`), the scanner also queries git to find changed, added, or deleted files. This gives the pipeline an early signal of what needs attention.

### Hybrid Discovery

The Scan and Cleanup stage combines both approaches. It starts with git-suggested changes, then scans all tracked files for hash mismatches. This catches files that were modified without changing the working tree (for example, after a rebase or checkout). The stage also cleans up orphan index entries for files that were deleted.

| Method       | Source        | Role                                |
| ------------ | ------------- | ----------------------------------- |
| SHA-256 hash | Manifest file | Primary delta detector on every run |
| Git diff     | Working tree  | Early signal for incremental sync   |
| Hybrid       | Both          | Default for `spine sync`            |

## Indexing

Indexing is the most expensive phase in both time and cost. The Summarization stage sends each changed file's AST-derived context — imports, exports, function signatures, type definitions — to the configured LLM provider.

The LLM returns structured JSON for each file:

- **Semantic role**: what the file does and its place in the module
- **Responsibilities**: the key behaviors or invariants the file maintains
- **Dependencies**: which other modules this file depends on
- **Public surface**: exported APIs, types, and configuration
- **File kind**: source, test, configuration, documentation, or asset

This semantic index becomes the canonical record of every file's purpose. The pipeline stores it in `.spine/index/<file-path>.json`.

The Summarization stage uses checkpoint/resume. If the process is interrupted, the next run resumes from the last checkpoint rather than re-sending every outstanding file to the LLM.

## View Derivation

After the index is committed, the Post-Commit Derivation stage computes derived artifacts from the committed index. This stage calls **zero LLM** — it is pure computation over structured data.

Alongside the six views listed below, this stage also produces:

- **Reverse index**: which files reference a given symbol
- **Module aggregation**: rolled-up module boundaries and responsibilities
- **Knowledge graph**: module-level dependency graph (distinct from the quick-scan graph)
- **SPINE.md**: self-describing entry point for AI agents discovering the control plane

### The Six Views

| View                 | Outputs                                    | Description                                                                         |
| -------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| Public Surface       | `public-surface.json`, `public-surface.md` | Fast repo entry surface map for readers and agents                                  |
| Risk Hotspots        | `risk-hotspots.json`, `risk-hotspots.md`   | Structurally risky files with transparent score breakdowns                          |
| Architecture Diagram | `.json`, `.html`, `.svg`                   | Full-sync deterministic SVG architecture diagram                                    |
| Project Health       | `project-health.md`                        | Human-readable health report with topology, cycles, dead code, hubs, and violations |
| Agent Briefing       | `agent-briefing.md`                        | One-page project briefing for AI agents                                             |
| Change Impact        | `change-impact.json`, `change-impact.md`   | Pre-computed BFS impact radius for every module                                     |

All six views are deterministic: given the same index, they produce the same output. None of them call an LLM.

## Pipeline Commands

ArchSpine provides three distinct commands for different scenarios.

### `spine sync` — Incremental Sync

The default command for day-to-day use. It detects changes via SHA-256 hash comparison and git diff, processes only changed files, and produces JSON-only index updates (no Markdown regeneration).

```
spine sync
```

Use `spine sync` when:

- You changed a few files during development
- You want to refresh the semantic index quickly
- You are running in a pre-commit or post-commit hook (`spine sync --hook`)

### `spine build` — Full Rebuild

Processes every file in the repository regardless of change status. Generates Markdown documentation alongside JSON index entries.

```
spine build
```

Use `spine build` when:

- Setting up ArchSpine on a new repository for the first time
- After a major refactor that affected many files
- The semantic index state is corrupted or inconsistent
- You need a clean architectural snapshot as a baseline

### `spine scan --quick` — AST-Only Scan

A standalone lightweight scan that runs without any LLM configuration. Uses regex-based parsing across 10 languages and produces only a knowledge graph.

```
spine scan --quick
```

Use `spine scan --quick` when:

- You only need a dependency graph for CI gating
- You have not configured an LLM provider yet
- You want a fast overview of module structure

### Why Separate Commands

Three commands exist because LLM calls are expensive. A full build might take 7.5 minutes and consume $0.17 in API cost (on DeepSeek V3) for a 200-file TypeScript repository. A quick scan costs nothing. An incremental sync falls somewhere in between.

- **Make cheap operations the default**: `spine sync` is the default command because most development sessions change only a handful of files.
- **Keep the expensive path explicit**: `spine build` requires a deliberate choice, signaling that processing will take a while.
- **Offer a zero-cost baseline**: `spine scan --quick` works without any LLM configuration, making it suitable for CI, onboarding, and environments where API keys are not available.
