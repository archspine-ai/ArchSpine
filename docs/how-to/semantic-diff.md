# Semantic Diff

Semantic diff compares the architecture of your codebase between two git refs (commits, branches, or tags). Unlike `git diff`, which shows line-level changes, semantic diff compares each file's _role_, _responsibilities_, _public surface_, and _dependencies_ as recorded in the `.spine/index/` directory.

Use semantic diff to answer questions like:

- Did this branch change any file's architectural role?
- Are there new drift events in this commit range?
- What happened to the public surface of changed files?

## Before You Start

Semantic diff reads from the `.spine/index/` directory, which is populated by `spine build` or `spine sync`. Make sure your repository has a synced index before running this tool. If the index is missing or stale, the comparison will be incomplete.

## Parameters

| Parameter  | Required | Type   | Default | Description                                      |
| ---------- | -------- | ------ | ------- | ------------------------------------------------ |
| `oldRef`   | Yes      | string | --      | Base git ref (commit SHA, branch name, or tag)   |
| `newRef`   | Yes      | string | --      | Target git ref (commit SHA, branch name, or tag) |
| `filePath` | No       | string | --      | Filter results to a single file                  |

Both `oldRef` and `newRef` accept any git ref format: `main`, `HEAD~3`, `feature/my-change`, `v1.2.3`, or a full commit SHA.

## Run via MCP

Call the `spine_get_semantic_diff` tool with the two refs:

```json
{
  "name": "spine_get_semantic_diff",
  "arguments": {
    "oldRef": "main",
    "newRef": "HEAD"
  }
}
```

To scope the diff to a single file:

```json
{
  "name": "spine_get_semantic_diff",
  "arguments": {
    "oldRef": "main",
    "newRef": "feature/my-change",
    "filePath": "src/services/view/view-service.ts"
  }
}
```

## Example Output

```json
{
  "oldRef": "main",
  "newRef": "HEAD",
  "changedFiles": [
    {
      "filePath": "src/services/auth-service.ts",
      "type": "modified",
      "roleChanged": true,
      "oldRole": "authentication-handler",
      "newRole": "identity-provider",
      "responsibilitiesChanged": true,
      "publicSurfaceChanged": false,
      "dependencyChanged": true,
      "driftDetected": false,
      "driftReason": null
    },
    {
      "filePath": "src/infra/db.ts",
      "type": "modified",
      "roleChanged": false,
      "oldRole": "database-adapter",
      "newRole": "database-adapter",
      "responsibilitiesChanged": false,
      "publicSurfaceChanged": true,
      "dependencyChanged": false,
      "driftDetected": true,
      "driftReason": "Public exports changed but role remained stable"
    },
    {
      "filePath": "src/cli/commands/deploy.ts",
      "type": "added",
      "roleChanged": false
    }
  ],
  "summary": {
    "totalChanges": 3,
    "roleChanges": 1,
    "surfaceChanges": 1,
    "dependencyChanges": 1,
    "driftEvents": 1
  }
}
```

Each entry in `changedFiles` includes:

| Field                     | Type    | Description                                     |
| ------------------------- | ------- | ----------------------------------------------- |
| `filePath`                | string  | Repo-relative path to the changed file          |
| `type`                    | string  | `added`, `removed`, or `modified`               |
| `roleChanged`             | boolean | Whether the file's semantic role changed        |
| `oldRole` / `newRole`     | string  | The role values before and after (if changed)   |
| `responsibilitiesChanged` | boolean | Whether responsibilities changed                |
| `publicSurfaceChanged`    | boolean | Whether public API exports changed              |
| `dependencyChanged`       | boolean | Whether dependencies changed                    |
| `driftDetected`           | boolean | Whether drift was detected in the new state     |
| `driftReason`             | string  | Explanation of why drift was detected (or null) |

The `summary` block gives aggregate counts:

| Field               | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `totalChanges`      | Total number of changed files in src/ and tests/       |
| `roleChanges`       | Files whose semantic role changed                      |
| `surfaceChanges`    | Files whose responsibilities or public surface changed |
| `dependencyChanges` | Files whose dependencies changed                       |
| `driftEvents`       | Files where drift was detected in the new state        |

## Use Cases

### Pre-Review Check

Before opening a pull request, compare your feature branch against `main` to check whether you accidentally changed a file's architectural role:

```json
{
  "name": "spine_get_semantic_diff",
  "arguments": {
    "oldRef": "main",
    "newRef": "feature/my-change"
  }
}
```

If `roleChanged` is `true` for any file you did not intend to restructure, investigate before requesting review.

### Refactoring Validation

After a refactoring session, confirm that only the expected files changed role or surface:

```json
{
  "name": "spine_get_semantic_diff",
  "arguments": {
    "oldRef": "HEAD~5",
    "newRef": "HEAD"
  }
}
```

Check that the `surfaceChanges` count matches your intended API changes and that no unexpected `driftEvents` appeared.

### Drift Inspection

When your CI reports drift in a specific file, use the `filePath` filter to inspect just that file:

```json
{
  "name": "spine_get_semantic_diff",
  "arguments": {
    "oldRef": "main",
    "newRef": "HEAD",
    "filePath": "src/infra/db.ts"
  }
}
```

The `driftReason` field explains why the index flagged the file.

## Limitations

- Semantic diff only inspects files tracked by the `.spine/index/` directory (source files in `src/` and `tests/`). Generated files, config files, and third-party dependencies are excluded.
- Added or removed files have minimal semantic data (no role comparison possible).
- If the `.spine/index/` data is inconsistent between refs (different scan policies or index schema versions), some entries may lack detail. Rebuild the index on both refs for the best comparison.
