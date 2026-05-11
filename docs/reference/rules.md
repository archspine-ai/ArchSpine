---
outline: deep
---

# Rules Reference

Complete reference for `.spine/rules/*.yml` and `.spine/rules/*.md` architecture rule files.

**Source:** `src/types/protocol/rules.ts` (schema), `src/infra/rules-loader.ts` (loading), `src/engines/rules.ts` (matching).

## Schema

```typescript
interface SpineRuleDocument {
  schemaVersion: '1.0.0';
  ruleId: string;
  title: string;
  summary: string;
  appliesTo: string[];
  severity: 'advisory' | 'warning' | 'error';
  enforceable: boolean;
  rationale?: string | null;
  bodyMarkdown: string;
}
```

Source: `src/types/protocol/rules.ts`.

---

## Field Reference

### `schemaVersion`

| Property     | Value                                              |
| ------------ | -------------------------------------------------- |
| **Type**     | `"1.0.0"` (string literal)                         |
| **Required** | Yes                                                |
| **Default**  | `CURRENT_SCHEMA_VERSION` (set by loader if absent) |

### `ruleId`

| Property        | Value                                                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**        | `string`                                                                                                                                                                                                       |
| **Required**    | Yes                                                                                                                                                                                                            |
| **Default**     | Auto-generated via `slugifyRuleId()` from the title if absent                                                                                                                                                  |
| **Description** | Unique identifier for the rule. Auto-slugged: lowercased, non-alphanumeric chars replaced with `-`, leading/trailing dashes trimmed. Falls back to `"unnamed-rule"` if slugification produces an empty string. |

**Slugification algorithm** (source: `src/infra/rules-loader.ts`, `slugifyRuleId()`):

```
input.toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  || 'unnamed-rule'
```

### `title`

| Property        | Value                                                    |
| --------------- | -------------------------------------------------------- |
| **Type**        | `string`                                                 |
| **Required**    | Yes                                                      |
| **Default**     | `"Untitled Rule"` (Markdown files)                       |
| **Description** | Human-readable rule name. Displayed in check/fix output. |

### `summary`

| Property        | Value                                                        |
| --------------- | ------------------------------------------------------------ |
| **Type**        | `string`                                                     |
| **Required**    | Yes                                                          |
| **Default**     | Falls back to constraint text, reason text, or the title     |
| **Description** | One-line description of the rule. Used in overview listings. |

### `appliesTo`

| Property        | Value                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**        | `string[]`                                                                                                                                               |
| **Required**    | Yes                                                                                                                                                      |
| **Default**     | N/A (must be non-empty for YAML; must be non-empty array for Markdown)                                                                                   |
| **Description** | Array of picomatch glob patterns. Patterns starting with `!` are exclusions. If empty or absent in Markdown files, the rule is skipped (returns `null`). |

For structured YAML rules, `appliesTo` is populated from `scope` or `appliesTo` fields. For line-based YAML, it is populated from the `Scope:` field. For Markdown, it comes from frontmatter `appliesTo` or `paths`.

### `severity`

| Property        | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Type**        | `"advisory"` \| `"warning"` \| `"error"`                                                         |
| **Required**    | Yes                                                                                              |
| **Default**     | `"warning"`                                                                                      |
| **Description** | Rule severity level. Normalized to lowercase and trimmed. Unknown values default to `"warning"`. |

### `enforceable`

| Property        | Value                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Type**        | `boolean`                                                                                                                           |
| **Required**    | Yes                                                                                                                                 |
| **Default**     | `true`                                                                                                                              |
| **Description** | When `true`, the rule is enforced by the `RuleEngine`. When `false`, the rule is informational only and is skipped during matching. |

### `rationale`

| Property        | Value                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| **Type**        | `string` \| `null` (optional)                                                                          |
| **Required**    | No                                                                                                     |
| **Default**     | `null`                                                                                                 |
| **Description** | Explanation of why the rule exists. Mapped from the `reason` or `rationale` field in YAML frontmatter. |

### `bodyMarkdown`

| Property        | Value                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**        | `string`                                                                                                                                                   |
| **Required**    | Yes                                                                                                                                                        |
| **Default**     | Empty string for YAML files; the Markdown body content for `.md` files                                                                                     |
| **Description** | Full rule body in Markdown format. For YAML rules, constructed from `Constraint:` and `Reason:` fields. For Markdown rules, the content after frontmatter. |

---

## Severity Levels

| Severity   | Meaning                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `advisory` | Informational. Highlights a pattern but does not constitute a violation. |
| `warning`  | Indicates a potential issue. Counted as a violation but does not block.  |
| `error`    | Hard constraint. Violations are errors that must be addressed.           |

Severity is normalized by `normalizeSeverity()` in `src/infra/rules-loader.ts`:

- Input is trimmed and lowercased
- Only `"error"`, `"warning"`, and `"advisory"` are recognized
- Any other value defaults to `"warning"`

---

## Glob Pattern Syntax

Rules use [picomatch](https://github.com/micromatch/picomatch) for glob matching. The matching engine is in `src/engines/rules.ts`, `getRulesForFile()`.

### Syntax

| Pattern              | Meaning                                                 |
| -------------------- | ------------------------------------------------------- |
| `**/*.ts`            | Match any `.ts` file at any depth                       |
| `src/**/*.ts`        | Match `.ts` files under `src/`                          |
| `src/cli/**`         | Match everything under `src/cli/`                       |
| `!src/cli/index.ts`  | Exclude a specific file                                 |
| `src/{cli,infra}/**` | Brace expansion: match under `src/cli/` or `src/infra/` |

### Matching Behavior

1. The file path is matched against `appliesTo` patterns
2. Patterns without `!` prefix are **positive** (include)
3. Patterns with `!` prefix are **negative** (exclude), with the `!` stripped before matching
4. `picomatch` is called with `{ ignore: negativeGlobs, dot: true }`
5. Non-enforceable rules (`enforceable: false`) are skipped entirely

### Example

```yaml
appliesTo:
  - src/cli/**
  - src/infra/**
  - '!src/cli/index.ts'
  - '!src/infra/config.ts'
```

This rule applies to all files under `src/cli/` and `src/infra/` except `src/cli/index.ts` and `src/infra/config.ts`.

---

## File Formats

Rules can be written in two formats. Both are loaded by `loadRulesFromDir()` in `src/infra/rules-loader.ts`.

### YAML Files (`.yml`, `.yaml`)

Two sub-formats are supported:

#### Structured YAML (array of objects)

```yaml
- rule: CLI Entrypoint Separation
  ruleId: cli-entrypoint-separation
  scope: src/cli/**
  severity: error
  constraint: CLI must remain thin and only dispatch to engines/services.
  reason: Prevents business logic from leaking into the CLI layer.
  enforceable: true
```

Each object in the array becomes one rule. Supported fields:

| YAML Field             | Maps To                                    |
| ---------------------- | ------------------------------------------ |
| `rule` / `title`       | `title`                                    |
| `ruleId`               | `ruleId` (falls back to slugified title)   |
| `scope` / `appliesTo`  | `appliesTo` (first non-empty string value) |
| `constraint`           | Used in `summary` and `bodyMarkdown`       |
| `reason` / `rationale` | `rationale` and `summary`                  |
| `severity`             | `severity` (normalized)                    |
| `enforceable`          | `enforceable`                              |

The loader tries structured YAML first (`parseStructuredYamlRules()`). If the array is empty or parsing fails, it falls back to line-based parsing (`parseYamlRuleBlocks()`).

#### Line-Based YAML (flat format)

```yaml
- [Rule: CLI Entrypoint Separation]
- Scope: src/cli/**
- Constraint: CLI must remain thin and only dispatch to engines/services.
- Severity: error
- Reason: Prevents business logic from leaking into the CLI layer.
```

Each `- [Rule: ...]` line starts a new rule block. Subsequent `- Field: Value` lines populate fields until the next rule header or end of file.

| Line Pattern            | Maps To                              |
| ----------------------- | ------------------------------------ |
| `- [Rule: <title>]`     | Begins a new rule block with `title` |
| `- Scope: <value>`      | `appliesTo[0]`                       |
| `- Constraint: <value>` | Used in `summary` and `bodyMarkdown` |
| `- Severity: <value>`   | `severity` (normalized)              |
| `- Reason: <value>`     | `rationale` and `summary`            |

Lines starting with `#` are treated as comments and skipped.

### Markdown Files (`.md`)

Uses [gray-matter](https://github.com/jonschlinkert/gray-matter) for frontmatter parsing via `parseMarkdownRule()`.

```markdown
---
ruleId: cli-entrypoint-separation
title: CLI Entrypoint Separation
summary: CLI stays thin; business logic lives in engines/services.
appliesTo:
  - src/cli/**
severity: error
enforceable: true
rationale: Prevents business logic from leaking into the CLI layer.
---

# CLI Entrypoint Separation

The CLI layer (`src/cli/`) must only contain command dispatch logic.
Business logic, pipeline orchestration, and domain rules must live in
`src/engines/`, `src/services/`, or `src/core/`.

## What to check

- CLI command files must not import from other CLI commands
- CLI must not contain business logic
```

**Constraints:**

- `appliesTo` (or `paths`) must be a non-empty array. If absent or empty, the file is skipped (`null` returned).
- Frontmatter fields map identically to the `SpineRuleDocument` type
- The Markdown body (everything after `---`) becomes `bodyMarkdown`

---

## Rule Loading

The loading process in `loadRulesFromDir()` (`src/infra/rules-loader.ts`):

1. Read all files in `.spine/rules/`
2. Files ending in `.md` are parsed with `parseMarkdownRule()`
3. Files ending in `.yml` or `.yaml` are parsed with `parseYamlRules()`
   - First attempts structured YAML via `js-yaml.load()`
   - Falls back to line-based parser if structured parsing yields empty results
4. Each parsed rule is wrapped in a `LoadedRuleFile { filePath, rule }` object
5. Rules with empty `appliesTo` or missing title+scope are skipped
6. Empty/non-existent rules directory returns an empty array

### Rule Engine Initialization

The `RuleEngine` (`src/engines/rules.ts`) loads all rules at construction time:

```typescript
class RuleEngine {
  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.loadRules(); // reads .spine/rules/
  }
}
```

---

## Rule Matching

`getRulesForFile(relativeFilePath)` in `src/engines/rules.ts`:

1. Iterates over all loaded rules
2. Skips rules where `enforceable === false`
3. Separates `appliesTo` patterns into positive globs and ignore globs (`!` prefix)
4. Calls `picomatch(positiveGlobs, { ignore: ignoreGlobs, dot: true })`
5. If the file path matches, formats a rule block string:
   ```
   [Rule: <ruleId>] (Severity: <severity>)
   Title: <title>
   Summary: <summary>
   Content:
   <bodyMarkdown>
   ```
6. If `VERBOSE` env var is set, logs each match to the runtime I/O

---

## ArchSpine Self-Governance Rules

ArchSpine dogfoods its own rules system with 9 rules in `.spine/rules/`:

| Rule ID                          | Severity | Scope             | Description                                              |
| -------------------------------- | -------- | ----------------- | -------------------------------------------------------- |
| `cli-entrypoint-separation`      | error    | `src/cli/**`      | CLI stays thin; business logic lives in engines/services |
| `core-pipeline-isolation`        | error    | `src/core/**`     | Core must not depend on CLI                              |
| `engine-independence`            | error    | `src/engines/**`  | Engines must not import CLI                              |
| `test-file-suffix`               | error    | `tests/**`        | Test files must end with `.test.ts` or `.spec.ts`        |
| `service-runtime-boundary`       | warning  | `src/services/**` | View services must live under `services/view/`           |
| `runtime-compatibility-boundary` | warning  | `src/**`          | Centralize schema migrations                             |
| `task-stage-boundary`            | warning  | `src/tasks/**`    | Tasks must stay stage-local                              |
| `infra-facade-imports`           | warning  | `src/**`          | Use public facades, not deep imports from `src/infra/`   |
| `interface-prefix`               | warning  | `src/**`          | Internal interfaces must start with `I`                  |

---

## Example: Full YAML Rule File

```yaml
- rule: CLI Entrypoint Separation
  ruleId: cli-entrypoint-separation
  scope: src/cli/**
  severity: error
  constraint: CLI must remain thin -- only dispatch to engines and services.
  reason: Prevents business logic from leaking into the CLI layer, keeping commands auditable and the dispatch tree shallow.
  enforceable: true

- rule: Core Pipeline Isolation
  ruleId: core-pipeline-isolation
  scope: src/core/**
  severity: error
  constraint: Core must not import from CLI or engines. It may only import from types, infra (config only), and utils.
  reason: Keeps the domain layer free of runtime and I/O concerns.
  enforceable: true
```

---

## Example: Full Markdown Rule File

```markdown
---
ruleId: test-file-suffix
title: Test File Naming Convention
summary: All test files must use .test.ts or .spec.ts suffix.
appliesTo:
  - tests/**/*.ts
  - '!tests/**/*.test.ts'
  - '!tests/**/*.spec.ts'
  - '!tests/**/*.d.ts'
severity: error
enforceable: true
rationale: Consistent naming ensures test runners discover files correctly and reviewers can identify test files at a glance.
---

# Test File Naming Convention

Every test file must end with either `.test.ts` or `.spec.ts`.

## Scope

This rule applies to all TypeScript files under `tests/`.

## Enforcement

Files that do not match the naming convention will be flagged as errors.
```
