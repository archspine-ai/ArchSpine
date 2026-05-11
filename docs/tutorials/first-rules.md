# Writing Your First Architecture Rules

Architecture rules define invariants that `spine check` audits against your codebase. They live in `.spine/rules/*.yml` and use picomatch globs to target files.

By the end of this tutorial you will have written 3 rules, run `spine check`, and seen real violations.

## Understanding Rule Structure

Each rule file is a YAML list of rule objects. Every rule has these fields:

```yaml
- ruleId: my-rule-id
  title: Human-Readable Title
  summary: One-line description of what this rule checks
  appliesTo:
    - 'src/services/**'
    - '!src/services/view/**'
  severity: error
  rationale: Why this rule matters for architecture governance
  bodyMarkdown: |
    Detailed explanation of the rule.
```

### Fields

- **ruleId** -- Unique within the file, kebab-case.
- **title** -- Short human-readable title.
- **summary** -- One-line description shown in check output.
- **appliesTo** -- List of picomatch glob patterns. Files matching any pattern are checked. Prefix with `!` to exclude.
- **severity** -- One of `error`, `warning`, or `advisory`.
  - `error` -- Blocks CI, fails `spine check`.
  - `warning` -- Reported but does not fail.
  - `advisory` -- Informational only.
- **rationale** -- Why the constraint exists.
- **bodyMarkdown** -- Longer markdown description of what to check for and why.

## Rule 1: Service Layer Boundary

Create `.spine/rules/service-boundary.yml`:

```yaml
- ruleId: no-infra-imports-from-cli
  title: CLI Must Not Import Infra Directly
  summary: CLI entrypoints must not import from src/infra/ directly; use service facades.
  appliesTo:
    - 'src/cli/**'
  severity: error
  rationale: CLI modules should stay as thin entrypoints. Infrastructure concerns belong behind service facades so runtime behavior is reusable outside the CLI.
  bodyMarkdown: |
    All CLI modules under `src/cli/` must route through service facades rather
    than importing directly from `src/infra/`. This keeps the CLI a thin
    dispatch layer and makes service logic testable without CLI dependencies.

    **Allowed**: importing from `src/services/`, `src/core/`
    **Denied**: importing from `src/infra/` (config, DB, LLM, secrets, etc.)
```

## Rule 2: Naming Convention

Create `.spine/rules/naming.yml`:

```yaml
- ruleId: test-file-naming
  title: Test File Naming Convention
  summary: Test files must follow the *.test.ts or *.spec.ts naming pattern.
  appliesTo:
    - 'tests/**'
  severity: error
  rationale: Consistent test file naming ensures test runners discover files correctly and contributors can locate tests predictably.
  bodyMarkdown: |
    All test files under `tests/` must end with `.test.ts` or `.spec.ts`.
    Helper files, fixtures, and mock data should use different extensions
    or live outside the test directory to avoid false matches.

    **Correct**: `src/cli/help.test.ts`, `src/core/task.spec.ts`
    **Incorrect**: `src/cli/help.test.tsx`, `tests/fixtures/data.ts`
```

## Rule 3: Documentation Language

Create `.spine/rules/documentation.yml`:

```yaml
- ruleId: no-todo-without-tracking
  title: TODO Comments Must Reference an Issue
  summary: Every TODO comment must include a reference to a tracking issue (e.g. TODO(#123)).
  appliesTo:
    - 'src/**'
    - '!src/types/protocol/**'
  severity: warning
  rationale: Unreferenced TODOs accumulate silently. Requiring an issue link makes tech debt visible and triage-able.
  bodyMarkdown: |
    TODO comments in source files must reference a GitHub issue number.

    **Correct**: `// TODO(#42): Replace with the new scanner API`
    **Incorrect**: `// TODO: fix this later`

    The issue number can be a GitHub issue (`#123`), Jira ticket (`PROJ-456`),
    or any project-tracker reference that links the TODO to a triage-able item.
```

## Running the Check

Once your rules are in place, run the audit:

```bash
spine check
```

**Expected output (with violations):**

```
ArchSpine Architecture Check

Loaded 3 rules from .spine/rules/

❌ no-infra-imports-from-cli: CLI Must Not Import Infra Directly [error]
   src/cli/index.ts — imports src/infra/config.js (infra facade)
   src/cli/index.ts — imports src/infra/llm.js (infra facade)

⚠️  no-todo-without-tracking: TODO Comments Must Reference an Issue [warning]
   src/engines/check.ts:42 — TODO without issue reference
   src/services/sync-service.ts:118 — TODO without issue reference

-------------------------------------------------
  Errors: 1   Warnings: 1   Advisory: 0
  Check failed
```

If your codebase already follows your rules, you will see a clean pass:

```
ArchSpine Architecture Check

Loaded 3 rules from .spine/rules/

✅ All rules passed.
```

## Iterating on Rules

Rules evolve with your architecture. Common iteration patterns:

### Narrowing Scope

If a rule is too broad, add exclusion globs:

```yaml
appliesTo:
  - 'src/**'
  - '!src/types/protocol/**'
  - '!src/**/__fixtures__/**'
```

### Changing Severity

Start with `warning` or `advisory` to avoid blocking development. Promote to `error` once the team agrees on the constraint.

### Adding Rationale

A good rationale helps contributors understand _why_ a rule exists. It is shown in check output to provide context for violations.

## Real-World Example: ArchSpine's Own Rules

ArchSpine dogfoods its own rule system. The file `.spine/rules/layered-architecture.yml` defines 7 rules that enforce the layer boundaries between CLI, services, core, tasks, engines, and infra modules. The file `.spine/rules/naming-conventions.yml` enforces interface prefix and test file naming.

You can read these files in the [ArchSpine repository](https://github.com/archspine-ai/archspine) for production-grade rule patterns.

## Next Steps

- [Enforce rules in CI](../how-to/ci-integration) -- run `spine check` on every pull request
- [Write advanced rules](../how-to/write-rules) -- glob patterns, severity levels, and rule patterns in depth
