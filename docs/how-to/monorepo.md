# Set Up a Monorepo

ArchSpine builds a single `.spine/` control plane at the repository root. This guide covers how to manage multiple packages within that single control plane.

## Current Behavior

- A single `.spine/` directory lives at the repository root
- `spine sync` indexes all source files in the repository that match the configured scan boundary
- The semantic index covers every package in the same index
- The knowledge graph models cross-package dependencies
- Views (agent briefing, architecture diagram, risk hotspots) span the entire repo

## Controlling Scan Boundaries with `.spineignore`

Use `.spineignore` to exclude packages or directories from indexing. The file uses gitignore-compatible patterns.

Create `.spineignore` at the repository root:

```text
# Exclude legacy packages that should not be indexed
packages/deprecated-app/**
packages/internal-tools/**

# Exclude generated code
packages/*/dist/**
packages/*/build/**

# Exclude test fixtures (already excluded by default, but explicit is fine)
packages/*/test/fixtures/**
```

Patterns are matched against file paths relative to the repository root. Standard gitignore syntax applies:

| Pattern                    | Matches                               |
| -------------------------- | ------------------------------------- |
| `packages/app/**`          | Everything under packages/app/        |
| `**/*.generated.ts`        | Any `.generated.ts` file anywhere     |
| `packages/*/dist/`         | dist/ inside any top-level package    |
| `!packages/app/important/` | Re-include a previously excluded path |

The `!` prefix re-includes paths excluded by a previous pattern.

### Preview the Scan Boundary

Before syncing, verify which files are in scope:

```bash
spine scan --dry-run
```

This prints the effective scan boundary and the ignore chain, showing which patterns excluded which files.

## Per-Package Rule Scoping

Architecture rules in `.spine/rules/` can target specific packages using the `appliesTo` glob:

```yaml
- ruleId: frontend-no-node-imports
  title: Frontend Must Not Import Node Modules
  summary: The web frontend package must not import Node.js-specific modules.
  appliesTo:
    - 'packages/frontend/**'
  severity: error
  rationale: Frontend code runs in the browser and cannot use Node.js APIs.
  bodyMarkdown: |
    Files in `packages/frontend/` must not import from `fs`, `path`, `os`,
    or any other Node.js built-in module.
```

```yaml
- ruleId: backend-no-dom-imports
  title: Backend Must Not Import DOM APIs
  summary: The API server package must not import browser-specific modules.
  appliesTo:
    - 'packages/api-server/**'
  severity: error
  rationale: Server code runs in Node.js and cannot use DOM APIs.
```

Rules can also be applied across all packages and then exclude specific ones:

```yaml
- ruleId: no-any-type
  title: No `any` Type in Source
  summary: All TypeScript files must avoid the `any` type.
  appliesTo:
    - 'packages/**/*.ts'
    - '!packages/legacy-migration/**'
    - '!**/*.d.ts'
  severity: warning
  rationale: The `any` type disables type checking and undermines TypeScript's safety guarantees.
```

## Per-Package Agent Briefing

Currently, ArchSpine produces a single agent briefing at `.spine/view/pages/agent-briefing.md` covering the entire repository. Per-package agent briefings are planned but not yet shipped.

**Workaround**: Describe per-package context in the agent instructions file (`CLAUDE.md`, `AGENTS.md`) at the package level:

```
packages/
├── frontend/
│   └── CLAUDE.md    # Frontend-specific architecture guide
├── api-server/
│   └── CLAUDE.md    # API server architecture guide
└── shared/
    └── CLAUDE.md    # Shared library conventions
```

The repository-root agent briefing covers the whole monorepo. Package-level instructions supplement it.

## Current Limitations

- **Single index, single config** -- All packages share one `.spine/config.json` and one `.spine/index/`. There is no per-package LLM configuration or per-package sync scope.
- **No per-package sync** -- `spine sync` always processes the full scan boundary. You cannot sync only `packages/api-server/`.
- **Single view set** -- Views (architecture diagram, risk hotspots, project health) span the entire repository. There are no per-package views.
- **Single LLM provider** -- All packages use the same LLM configuration. You cannot use different providers for different packages.

These limitations are on the roadmap for the next phase. The current design prioritizes a single control plane that provides cross-package visibility -- which is the primary value of running ArchSpine on a monorepo.

## Practical Recommendations

### Use `.spineignore` Liberally

Start broad, then exclude. Index the packages that AI agents need to understand. Omit legacy, experimental, and generated packages.

### Scope Rules Per Package

Use `appliesTo` globs to apply different governance standards to different packages. A frontend package may have different constraints than a backend service.

### Use Descriptive File Paths in Rules

Since the semantic index is shared, rule violation output includes the full file path. This helps identify which package a violation belongs to:

```
❌ frontend-no-node-imports: Frontend Must Not Import Node Modules [error]
   packages/frontend/src/components/data-loader.ts — imports 'fs' from Node.js
```

### Run Check on PRs

CI integration (see [CI Integration](./ci-integration)) runs `spine check` across all packages. Since violations include full paths, package owners can triage only the violations in their packages.
