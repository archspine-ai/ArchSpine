# Quick Scan

Quick Scan performs a pure AST (regex-based) analysis of your codebase. It parses import and export statements across 10 languages, builds a dependency graph, and reports file counts and language statistics. No LLM calls, no semantic inference. It completes in roughly 30 seconds for a 50,000-line repository.

## When to Use Quick Scan

Quick Scan is suited for these scenarios:

- **CI gating**: Run a fast health check on every pull request without adding LLM cost or latency.
- **Pre-commit checks**: Verify your dependency structure before committing.
- **Quick health checks**: Get a bird's-eye view of file counts, language distribution, and module interconnectivity.
- **Initial exploration**: Understand the shape of an unfamiliar repository in under a minute.

## Prerequisites

- Node.js >= 20
- An initialized ArchSpine project (`spine init` already ran)
- No LLM configuration required

Quick Scan does not require an LLM API key. It works entirely offline.

## Supported Languages

| Language         | Extension |
| ---------------- | --------- |
| TypeScript       | `.ts`     |
| JavaScript       | `.js`     |
| TypeScript React | `.tsx`    |
| JavaScript React | `.jsx`    |
| Python           | `.py`     |
| Go               | `.go`     |
| Java             | `.java`   |
| Rust             | `.rs`     |
| Ruby             | `.rb`     |
| PHP              | `.php`    |

## Run via CLI

```bash
spine scan --quick
```

**Expected output:**

```
Scanning repository (quick mode, no LLM)...
Quick scan complete: 342 files, 287 modules, 1842 dependencies
Languages: TypeScript (198), Python (62), Go (42), Rust (28), Java (12)
Output: .spine/view/data/knowledge-graph.json
```

The scan writes a knowledge graph to `.spine/view/data/knowledge-graph.json`. This file is consumed by graph query tools such as `spine_query_graph` and `spine_get_change_impact`.

## Run via MCP

Call the `spine_run_scan` tool with `mode: 'quick'`:

```json
{
  "name": "spine_run_scan",
  "arguments": {
    "mode": "quick"
  }
}
```

**Response:**

```json
{
  "mode": "quick",
  "scannedAt": "2026-05-09T12:00:00.000Z",
  "fileCount": 342,
  "languageStats": {
    "TypeScript": 198,
    "Python": 62,
    "Go": 42,
    "Rust": 28,
    "Java": 12
  },
  "status": "ok"
}
```

## What the Output Contains

The knowledge graph stored at `.spine/view/data/knowledge-graph.json` includes these fields:

| Field           | Description                                  |
| --------------- | -------------------------------------------- |
| `schemaVersion` | Always `2.0.0`                               |
| `generatedAt`   | ISO 8601 timestamp of scan start             |
| `viewType`      | Always `knowledge-graph`                     |
| `summary`       | Human-readable one-line summary              |
| `nodes`         | Each module: id, label, layer, fanIn, fanOut |
| `edges`         | Each dependency: from, to, type, compliant   |

Each node represents a single file. Edges represent resolved imports between files (relative imports only; external package imports are excluded).

## Limitations

Quick Scan trades depth for speed. Be aware of these constraints:

- **No semantic roles**: The scan cannot determine what a module _does_ (authentication, database, routing). It only sees imports and exports.
- **No dependency graph inference**: External packages, dynamic requires, and conditionally loaded modules are not resolved.
- **No drift detection**: Quick Scan does not compare the current state against any baseline. There is no concept of "drift" or "change tracking."
- **No rule evaluation**: Architectural rules from `.spine/rules/` are not checked. Use `spine check` for that.
- **Regex-based parsing**: Import extraction uses regular expressions, not a full parser. Some complex import patterns may be missed or incorrectly resolved.

## Quick Scan vs. Full Sync

|                      | Quick Scan   | Full Sync              |
| -------------------- | ------------ | ---------------------- |
| LLM required         | No           | Yes                    |
| Runtime              | ~30 seconds  | Minutes (varies)       |
| Semantic roles       | No           | Yes                    |
| Dependency graph     | Imports only | Full transitive        |
| Rule evaluation      | No           | Yes                    |
| Drift detection      | No           | Yes                    |
| CI-suitable          | Yes          | Depends on LLM latency |
| Offline-capable      | Yes          | No                     |
| Knowledge graph file | Updated      | Updated                |
| Semantic index       | Not updated  | Updated                |

Use Quick Scan when you need fast feedback without LLM dependency. Use Full Sync when you need semantic understanding, rule enforcement, or drift analysis.
