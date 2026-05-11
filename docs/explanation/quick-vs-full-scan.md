---
outline: deep
---

# Quick Scan vs Full Scan

ArchSpine offers two scanning modes. They use different engines, cover different language sets, and produce different outputs. Choosing the right one depends on whether you need structural relationships only or a complete semantic index.

## Quick Scan

`spine scan --quick` is a standalone AST-only analysis that requires no LLM configuration.

### Engine

The quick scan uses regex-based import parsing, not a full AST parser. It reads each file line by line, matching import/require/use statements against language-specific patterns. This is fast but limited: it extracts only import relationships, not the full public surface of each file.

### Language Support

Quick scan covers 10 languages:

| Language         | Extension | Import Patterns Matched          |
| ---------------- | --------- | -------------------------------- |
| TypeScript       | `.ts`     | `import`, `require`, `import()`  |
| JavaScript       | `.js`     | `import`, `require`, `import()`  |
| TypeScript React | `.tsx`    | `import`, `require`, `import()`  |
| JavaScript React | `.jsx`    | `import`, `require`, `import()`  |
| Python           | `.py`     | `import`, `from ... import`      |
| Go               | `.go`     | `import` (single and multi-line) |
| Java             | `.java`   | `import`                         |
| Rust             | `.rs`     | `use`                            |
| Ruby             | `.rb`     | `require`, `require_relative`    |
| PHP              | `.php`    | `use`, `include`, `require`      |

### Skipped Directories

The quick scan skips `node_modules/`, `dist/`, `build/`, `.git/`, `.spine/`, `tests/`, `__tests__/`, `fixtures/`, `coverage/`, `out/`, and any directory starting with a dot.

The scan root defaults to `src/` if it exists; otherwise it uses the repository root.

### Output

The quick scan produces a single artifact:

- **Knowledge graph** (`.spine/view/data/knowledge-graph.json`): A dependency graph with nodes (files) and edges (import relationships). Each node carries a file path, label, language, fan-in count, and fan-out count. Edge types are recorded as `import` relationships.

The graph uses schema version `2.0.0`.

### Performance

Roughly **30 seconds** for a 50,000-line repository. Zero API cost. No LLM configuration required.

### When to Use Quick Scan

- CI gating — check for circular dependencies without spending LLM budget
- Before configuring an LLM provider — get immediate value from ArchSpine
- Rapid iteration — get a structural overview in seconds
- Large repositories where a full sync would be prohibitively expensive or time-consuming
- Environments where API keys or network access to LLM providers are unavailable

## Full Scan

Full scanning happens inside `spine sync` and `spine build`, not as a standalone command. It produces the complete semantic index.

### Engine

The full pipeline uses @ast-grep/napi for proper AST parsing. Instead of regex patterns, it builds a real abstract syntax tree for each file. This gives the Summarization stage access to:

- Exact function signatures and type definitions
- Exported symbols and their names
- Class declarations and inheritance relationships
- Complete import/export dependency graph

### Language Support

The full pipeline supports 14 language families. Language parsing packages load dynamically at runtime:

| Language   | Extensions                           | Package                   |
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

If a language package is unavailable, the pipeline reports a warning and skips files in that language without aborting.

### LLM Summarization

Full scanning includes the Summarization stage, which sends AST-derived context to the configured LLM provider. The LLM returns structured JSON describing each file's semantic role, responsibilities, dependencies, public surface, and file kind.

This is the most expensive phase in both time and cost. For a 200-file TypeScript repository on DeepSeek V3, the full build consumes roughly 14.9M input tokens and 2.5M output tokens at a cost of approximately $0.17.

### Output

Full scanning produces several artifacts:

| Artifact        | Location                   | Description                                                                                                                |
| --------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Semantic index  | `.spine/index/`            | One JSON file per source file with LLM-derived metadata                                                                    |
| Knowledge graph | `.spine/view/data/`        | Module-level dependency graph (from index, not regex)                                                                      |
| Views           | `.spine/view/pages/`       | 6 deterministic views (public surface, risk hotspots, architecture diagram, project health, agent briefing, change impact) |
| Manifest        | `.spine/index/config.json` | SHA-256 state snapshot for delta detection on subsequent runs                                                              |

### When to Use Full Scan

- Initial setup of ArchSpine on a repository
- After a major refactor that changed module boundaries
- Before a release or PR review — ensure the semantic index is up to date
- When you need agent-facing artifacts (agent briefing, public surface, risk hotspots)

## Decision Table

| Situation                              | Recommended Command    | LLM Needed | Duration             | Output                      |
| -------------------------------------- | ---------------------- | ---------- | -------------------- | --------------------------- |
| First time setting up ArchSpine        | `spine build`          | Yes        | ~7.5 min (200 files) | Full index + views          |
| Changed a few files during development | `spine sync`           | Yes        | Seconds to minutes   | Incremental index update    |
| Need dependency graph for CI           | `spine scan --quick`   | No         | ~30s                 | Knowledge graph only        |
| No LLM key available                   | `spine scan --quick`   | No         | ~30s                 | Knowledge graph only        |
| After a major refactor                 | `spine build`          | Yes        | ~7.5 min (200 files) | Full index + views          |
| Pre-commit hook                        | `spine sync --hook`    | Yes        | Fast                 | Incremental index, no views |
| Quick structural overview              | `spine scan --quick`   | No         | ~30s                 | Knowledge graph only        |
| Prepare `.spine/` for distribution     | `spine sync --publish` | Yes        | Minutes              | Full index + views          |

## Mixing Modes

Quick scan and full scan are not mutually exclusive. Run `spine scan --quick` early in a session for immediate structural awareness, then follow up with `spine sync` later for the full semantic index. The quick scan output (knowledge graph) coexists with the full pipeline's index files — they live in different paths under `.spine/`.

The quick scan knowledge graph uses schema version `2.0.0`, while the full pipeline's knowledge graph follows a different schema derived from the committed index. Both are available for querying and neither overwrites the other.
