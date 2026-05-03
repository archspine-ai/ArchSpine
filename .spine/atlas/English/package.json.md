# ArchSpine Configuration Summary (package.json)

This document explains how the `package.json` controls the ArchSpine CLI toolchain — from package identity and runtime constraints to build pipelines and distribution.

## Project Identity
- **name**: `archspine` — used by npm registry and for referencing the package.
- **version**: `1.0.0` — semantic version for release compatibility.
- **description**: "Architectural Governance & Semantic Layer for the AI Era" — human-readable purpose.
- **author**: ArchSpine Team.
- **license**: Apache-2.0 — legal terms for use and contribution.
- **repository**, **homepage**, **bugs**: point to GitHub project and issue tracker.

## Entry Points and CLI
- **main**: `dist/cli/index.js` — module loaded when the package is required; must exist after build.
- **bin**: maps both `spine` and `archspine` to `dist/cli/index.js` — defines the two CLI commands.
- **type**: `"module"` — forces ECMAScript module semantics; affects how imports/exports are resolved.

## Environment Constraints
- **engines**: `node >=20.18.1 <21 || >=22` — ensures runtime stability; installation or execution fails if not satisfied.

## Distribution Files
The `files` array controls what gets published to npm. It includes:
- `dist/` (excluding mock and source map files)
- `schemas/` — protocol schema assets
- Documentation: English and Chinese markdown files, VitePress doc source, etc.
- License, changelog, code of conduct, contribution guide, security policy, support file.

Exclusions (via `!` prefix) prevent accidental publication of test mocks and source maps, reducing package size and avoiding sensitive data leak.

## Scripts — Automation Overview
Scripts are grouped by purpose:

### Build
- `build`: production build via `scripts/build.mjs`
- `dev:build`: development build

### Test (CI pipeline)
- `test:ci`: runs `build` then unit, schema, and e2e tests
- `test:unit`: Vitest unit tests
- `test:e2e`: Vitest end-to-end tests
- `test:schema`: schema compliance validation

### Documentation
- `docs:dev`, `docs:build`, `docs:preview`: VitePress workflows

### Lint & Format
- `lint` / `lint:fix`: ESLint on TypeScript files
- `format:check`: Prettier check on multiple file types

### Release & Validation
- `validate`: protocol asset validation
- `release:gate`: performs release readiness checks
- `publish:placeholder`: placeholder publication script
- `pack:check`: dry-run npm pack to preview distribution

### Convenience Commands
- `spine:init`, `spine:sync`, `spine:publish`, `spine:check`, `spine:fix` — direct shortcuts for CLI subcommands
- `start`: runs the compiled CLI directly
- `db:update-schema`: database schema update script

## Dependencies
- **devDependencies** currently include type definitions, testing tools (Vitest, ts-node), linting/formatting (ESLint, Prettier), AJV schema validation, and TypeScript itself.
- **Note**: No `dependencies` field is declared. If the CLI has runtime dependencies, they must be added to avoid missing module errors at runtime.

## Operational Risks & Stability Concerns
- **Engine mismatch**: Deploying on Node <20.18.1 or 21.x will fail. CI must enforce the correct Node version.
- **Missing build artifacts**: `main` and `bin` point to `dist/`. If `npm run build` is not executed before running the CLI, the package will fail to load.
- **Bin command conflicts**: Both `spine` and `archspine` point to the same script. If another package registers `spine`, there may be collisions.
- **File inclusion mistakes**: The `files` list must be kept in sync with actual build output and documentation directories. An overly restrictive set can break `npm pack`.
- **Dependency drift**: `devDependencies` are semver-ranged (e.g., `^5.0.0`). This allows minor/patch updates but can introduce breaking changes if ranges are too wide. Regularly run `npm audit` and update.
- **Missing runtime dependencies**: Since no `dependencies` are declared, any runtime imports (e.g., `better-sqlite3`, `commander`, `chalk`) must be either bundled into the build output or listed here. Otherwise, users installing the package will encounter missing module errors.
- **Security**: Excluding source maps and mock files reduces data exposure. However, the `README*`, `LICENSE`, and changelog are published — ensure they contain no secrets.

---