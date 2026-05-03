# ArchSpine Ignore Policy

This document defines the scan-boundary model used by ArchSpine. The goal is not to ignore as much as possible, but to make scan decisions configurable, auditable, and predictable.

## 1. ScanPolicy model

ArchSpine describes file visibility through `scanPolicy`:

```json
{
  "scanPolicy": {
    "fileSource": "git-tracked",
    "ignoreChain": {
      "inheritGitIgnore": true,
      "projectIgnore": ".spineignore",
      "localIgnore": ".spineignore.local"
    }
  }
}
```

Default values:

- `fileSource: "git-tracked"`
- `ignoreChain.inheritGitIgnore: true`
- `ignoreChain.projectIgnore: ".spineignore"`
- `ignoreChain.localIgnore: ".spineignore.local"`

Supported `fileSource` values:

- `git-tracked`: scan only `git ls-files`
- `git-tracked-plus-untracked`: include tracked files plus `git ls-files --others --exclude-standard`
- `filesystem`: walk the filesystem directly for non-Git environments

## 2. Ignore chain

When `inheritGitIgnore=true`, the effective boundary is computed in this order:

1. protocol-level exclusions
2. `.gitignore`
3. `.spineignore`
4. `.spineignore.local` if present

Responsibilities:

- `.gitignore` handles repository hygiene
- `.spineignore` captures ArchSpine-specific semantic exclusions and may include a small init-time starter block for common low-value semantic noise such as secrets, caches, generated outputs, and repository-specific mirrors
- `.spineignore.local` is for local-only personal overrides and should not be committed

If `inheritGitIgnore=false`, the `.gitignore` step is skipped.

## 3. Protocol-level hard boundaries

These exclusions and inclusions are part of the runtime contract and should not be overridden by user rules.

Protocol exclusions:

- `.spine/cache.db*`
- `.spine/.lock`
- `.spine/index/`
- `.spine/atlas/`

Protocol inclusions:

- `.spine/rules/`
- `.spine/config.json`

Meaning:

- `.spine/` is not globally excluded anymore
- runtime caches and generated index artifacts are never scanned
- rules and config remain visible because they are governance inputs

## 4. File Size Limits

To protect LLM context windows and system memory, ArchSpine enforces a **2MB file size limit** for summarization tasks.
If a tracked source file exceeds 2MB, `spine sync` will intentionally throw an error and halt. This forces you to add the oversized file to `.spineignore` or `.gitignore`.
Files larger than 2MB are typically generated artifacts, massive datasets, or bundled code, which offer no semantic value for architectural governance and should be excluded from the semantic mirror.

## 5. What `.spineignore` is for

`.spineignore` should only contain rules that are unique to the semantic indexing layer, for example:

- large benchmark or fixture directories that are committed but should not be indexed
- committed snapshots or mirrors that carry no architecture value
- targeted exceptions re-included from Git ignore rules using `!`
- a small number of sensitive local-file exclusions such as `.env` when teams want them explicit in the ArchSpine boundary

During `spine init`, ArchSpine may create a commented starter block in `.spineignore` with a small set of recommended semantic exclusions. The default block is meant to improve repository compression for code-reading agents, not to maximize exclusion volume. It may include:

- common local secrets such as `.env`, `.env.*`, and certificate/key patterns
- common generated and cache directories that are usually low-value for code understanding
- repository-specific generated mirrors or logs when they are clearly secondary to source-of-truth inputs
- human-facing repository docs when those files already act as the authoritative readable surface

That block is intentionally editable and remains an onboarding default, not a protocol-level hard boundary.

`.spineignore` should usually not:

- duplicate noise already handled by `.gitignore`
- exclude repository automation that materially defines runtime or release behavior, such as `.github/workflows/**`
- exclude `tests/` or `__tests__/`
- exclude primary source roots such as `src/`, `app/`, `packages/`, or `modules/`

## 6. Visibility and audit

Preview the effective boundary with:

```bash
spine scan --dry-run
```

The command prints:

- current `fileSource`
- whether `.gitignore` inheritance is enabled
- ignore-chain order and rule counts
- the total files that would be scanned
- key exclusions and where they came from

The same capability is exposed through the MCP tool `spine_preview_scan`.
