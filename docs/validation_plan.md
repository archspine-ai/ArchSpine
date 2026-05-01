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
