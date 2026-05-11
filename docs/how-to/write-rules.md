# Write Architecture Rules

Rules in `.spine/rules/*.yml` define architecture invariants that `spine check` audits against your codebase. This guide covers the rule format in depth with patterns drawn from real-world use.

## Rule File Format

Each `.yml` file in `.spine/rules/` contains a list of rule objects. Files are loaded in alphabetical order; rule evaluation is independent of file boundaries.

````yaml
- ruleId: unique-rule-id
  title: Human-Readable Title
  summary: One-line description shown in check output
  appliesTo:
    - 'src/services/**'
    - '!src/services/**/*.test.ts'
  severity: error
  rationale: Why this constraint matters for maintainability
  bodyMarkdown: |
    ## What This Rule Checks

    Detailed explanation of the constraint. Markdown is rendered in check
    output and generated documentation.

    ### Examples

    **Correct**:
    ```typescript
    import { SyncService } from '../services/sync-service.js';
    ```

    **Incorrect**:
    ```typescript
    import { db } from '../infra/db.js';
    ```
````

### Field Reference

| Field          | Required | Type                               | Description                                                                           |
| -------------- | -------- | ---------------------------------- | ------------------------------------------------------------------------------------- |
| `ruleId`       | Yes      | string                             | Unique kebab-case identifier within the file                                          |
| `title`        | Yes      | string                             | Short human-readable title                                                            |
| `summary`      | Yes      | string                             | One-line description shown in `spine check` output                                    |
| `appliesTo`    | Yes      | string[]                           | Picomatch glob patterns. Files matching any pattern are checked. `!` prefix excludes. |
| `severity`     | Yes      | `error` \| `warning` \| `advisory` | Violation severity                                                                    |
| `rationale`    | No       | string                             | Why the constraint exists                                                             |
| `bodyMarkdown` | No       | string                             | Extended markdown description                                                         |

## Glob Patterns In Detail

`appliesTo` uses [picomatch](https://github.com/micromatch/picomatch) globs. Patterns are evaluated against the file path relative to the repository root.

### Inclusion Patterns

```yaml
appliesTo:
  - 'src/**' # All files under src/
  - 'src/services/*.ts' # Top-level .ts files in src/services/
  - 'src/**/*.test.ts' # All .test.ts files recursively in src/
  - 'src/cli/commands/*.ts' # All .ts files in src/cli/commands/
```

### Exclusion Patterns

Prefix with `!` to exclude. Exclusion patterns are evaluated after inclusions:

```yaml
appliesTo:
  - 'src/**' # Include all source
  - '!src/types/protocol/**' # But exclude generated protocol types
  - '!src/**/*.test.ts' # And exclude test files
  - '!src/**/__fixtures__/**' # And exclude test fixtures
```

### Common Patterns

```yaml
# Target a specific layer
appliesTo:
  - "src/cli/**"

# Target multiple layers
appliesTo:
  - "src/services/**"
  - "src/engines/**"

# Everything except tests and generated code
appliesTo:
  - "src/**"
  - "!src/types/protocol/**"
  - "!tests/**"

# Only TypeScript files
appliesTo:
  - "src/**/*.ts"
  - "!src/**/*.d.ts"
```

## Severity Levels

### `error`

Blocks `spine check` (non-zero exit). Use for hard constraints that must never be violated.

```yaml
severity: error
```

Use cases:

- Layer boundary violations (e.g., CLI importing infra directly)
- Security-critical patterns (e.g., hardcoded credentials)
- Breaking API contract changes

### `warning`

Reported but does not fail the check. Use for conventions you want to enforce gradually.

```yaml
severity: warning
```

Use cases:

- Naming conventions
- Deprecated API usage
- Missing documentation

### `advisory`

Informational only. Use for suggestions and best practices.

```yaml
severity: advisory
```

Use cases:

- Performance recommendations
- Style preferences
- Optional patterns

## Rule Patterns from ArchSpine's Own Rules

These patterns come from the rules ArchSpine applies to its own codebase.

### Layer Boundary Rule

Checks that a layer does not import from layers it should not depend on:

```yaml
- ruleId: cli-entrypoint-separation
  title: CLI Entrypoint Separation
  summary: CLI modules must not absorb pipeline or persistence logic from services, core, engines, or infra.
  appliesTo:
    - 'src/cli/**'
  severity: error
  rationale: Keep command routing thin so runtime behavior remains reusable and testable outside the CLI.
  bodyMarkdown: |
    CLI modules under `src/cli/` should stay as entrypoints and command
    adapters. They must not absorb pipeline or persistence logic that belongs
    in `src/services/`, `src/core/`, `src/engines/`, or `src/infra/`.
```

### Import Dependency Rule

Checks that modules within a layer only import from allowed layers:

```yaml
- ruleId: engine-independence
  title: Engine Independence
  summary: Engine modules must not import CLI entrypoints or depend on service-level orchestration.
  appliesTo:
    - 'src/engines/**'
  severity: error
  rationale: Engines form the reusable analytical backbone. They should not depend on presentation or orchestration concerns.
  bodyMarkdown: |
    Engine modules should provide reusable analysis and transformation logic
    without importing CLI entrypoints. They should stay decoupled from
    service-level orchestration where practical.
```

### Naming Convention Rule

```yaml
- ruleId: interface-prefix
  title: Interface Prefix Convention
  summary: Internal interfaces must start with the character 'I'.
  appliesTo:
    - 'src/types/**/*.ts'
  severity: warning
  rationale: Consistent interface naming helps differentiate interfaces from types and classes.
  bodyMarkdown: |
    All TypeScript interfaces in `src/types/` must use the `I` prefix.

    **Correct**: `IUserRepository`, `ISyncContext`
    **Incorrect**: `UserRepository`, `SyncContext`
```

### Test Convention Rule

```yaml
- ruleId: test-file-suffix
  title: Test File Suffix
  summary: Test files must end with .test.ts or .spec.ts.
  appliesTo:
    - 'tests/**'
  severity: error
  rationale: Consistent naming ensures test runners discover files correctly.
  bodyMarkdown: |
    All files under `tests/` must end with `.test.ts` or `.spec.ts`.
    Helper files and fixtures should use other extensions or live outside
    the test directory.
```

## Organizing Rule Files

Start with one file per concern. Split when a file grows beyond 5-7 rules.

```
.spine/rules/
├── layered-architecture.yml   # Layer boundary constraints
├── naming-conventions.yml      # Naming and style conventions
├── documentation.yml           # Documentation requirements
├── security.yml                # Security-sensitive patterns
└── dependency-rules.yml        # Import/dependency constraints
```

The loader reads all `.yml` files in `.spine/rules/`. File names are not significant for evaluation; they are for human organization.

## Testing Rules

After writing or changing a rule, verify it catches what you expect:

```bash
# Run the full check
spine check

# Check specific files (use scan to preview what files a rule matches)
spine scan --dry-run
```

Iterate on the `appliesTo` globs until the rule targets exactly the files you intend. Use `--dry-run` with `spine scan` to see the effective scan boundary without persisting anything.

## Storing Rules in Version Control

Rules in `.spine/rules/` are human-reviewed control plane files. Commit them to Git alongside your source code. They are not generated artifacts -- they are the governance inputs that `spine check` evaluates against.

```bash
git add .spine/rules/service-boundary.yml
git commit -m "feat(rules): add service layer boundary rule"
```
