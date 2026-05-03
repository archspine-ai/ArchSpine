# ArchSpine 1.0 Closure Plan

This plan documents how ArchSpine closes toward a stable `1.0.0` version with clear public contracts.

Core Principles:

- Better fewer features than false semantics.
- If the contract isn't clear, delay `1.0.0`.
- Eliminate contradictions between implementation, docs, schema, and examples before expanding capabilities.

## Completion Criteria

`1.0.0` is ready only when these public contracts are stable:

1. CLI behavior matches README / Runbook.
2. MCP tool names, resource URIs, and semantics match the runtime.
3. Rule format and parsing behavior are stable.
4. `.spine` layout, schema, examples, and protocol docs are consistent.
5. English and Chinese docs describe the same set of shipped behaviors.

## Current Status (2026-04-06)

Completed:

- Public version unified to `1.0.0`.
- README, Runbook, Protocol, and Chinese entries basically aligned with the current runtime.
- Rule system docs converged around YAML.
- `init` can complete bootstrap in new repos without `HEAD` noise.
- pre-commit hook no longer has a hard dependency on the consumer repo's own `dist/cli/index.js`.
- `spine info` provides a read-only diagnostic summary.
- Multiple rounds of CLI / MCP smoke tests completed on sample repos.

Recommended before `1.0.0`:

- Clean up historical `dist/` residues exposed in package previews.
- Perform another round of full validation on a real external repository.
- Freeze the public contract for "which commands depend on LLM and which do not".

## Working Batches

### Batch 1: Public Docs and Entries

- Unify versioning terminology in README, Runbook, and Protocol.
- Remove descriptions of non-existent MCP capabilities or unsupported providers.
- Unify `.spine/atlas/` naming.
- Ensure homepage entries reflect the current product.

### Batch 2: Rule System and MCP Contract

- Freeze YAML as the sole authoritative rule format.
- Validate rule query behavior for current MCP tools.
- Align docs, tests, and examples around the same MCP surface.

### Batch 3: Protocol, Schema, Examples

- Align `src/types/protocol.ts`, schemas, and examples.
- Clearly distinguish current specs from historical specs.
- Ensure machine-readable examples continue to pass validation.

### Batch 4: Runtime and E2E Validation

- Maintain smoke coverage for `init`, `sync`, `status`, `check`, `fix`, and `mcp start`.
- Validate on clean sample repositories.
- Verify consistency of `mode` default paths, advanced `prompt-tier=lite` overrides, legacy compatibility shims, and hook behavior.

### Batch 5: Release Closure

- Clean up historical links in public entries.
- Freeze public interfaces.
- Update package metadata and release notes.

## Release Gates

Do not release `1.0.0` until all the following are met:

- `npm run build`
- `npm test`
- `npm run validate`
- README, index, Runbook, and Protocol do not conflict.
- MCP contract frozen.
- Rule format and loading behavior frozen.
- `.spine` directory semantics frozen.
- Examples and schema aligned.
- At least one round of real external repository validation passed.

# ArchSpine v1.0.0 Release Validation Guide

This guide defines the repeatable validation path for a `v1.0.0` release candidate. It is a public checklist for verifying the shipped CLI, documentation, package surface, and release metadata before publishing.

## Product Gates

Run these checks from the repository root on the release candidate commit:

```bash
npm run build
npm run test:unit
npm run validate
npm run docs:build
npm run pack:check
```

Expected result:

- TypeScript sources compile into `dist/`.
- Product tests pass.
- Protocol schemas and examples validate.
- Public docs build.
- `npm pack --dry-run` includes only intended package files.

## Public Contract Checks

Verify the public docs and runtime surfaces describe the same behavior:

- README, docs homepage, runbook, CLI help, and Chinese mirrors use the same `sync` / `publish` / `build` boundaries.
- `spine sync` is documented as the machine-first JSON refresh path.
- `spine publish` is documented as the Atlas backfill boundary.
- `.spine/view/**` is explicitly marked experimental.
- `spine mcp start` is documented as a read-only semantic surface.
- `spine sync --retry-failed` and `spine sync --repair-violations` are documented as recovery commands, not normal first-run commands.

## External Repository Smoke

Run at least one realistic external-repository smoke before publishing. Prefer two repositories with different shapes, for example a small library and an application repository.

Recommended command path:

```bash
npx --yes archspine@latest try
npx --yes archspine@latest init
npx --yes archspine@latest build
npx --yes archspine@latest check
```

Record:

- repository type and primary languages
- Node.js version
- commands executed
- whether `.spine/index/**` was generated
- whether `check` output was actionable
- documentation mismatches or confusing prompts

## Release Metadata Checks

Before publishing, confirm:

- `package.json` version is `1.0.0`.
- `CHANGELOG.md` has a `1.0.0` entry.
- GitHub release notes match the changelog and README scope.
- `npm pack --dry-run` output matches the expected package surface.
- The npm dist tag and access scope are intentional.

## Non-Goals

This guide does not create release tags, publish to npm, or change package versions. It only defines the checks that should pass before those actions.
