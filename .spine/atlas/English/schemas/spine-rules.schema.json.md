# ArchSpine Rule Document Configuration Summary

## What It Controls
This schema defines the structure of every rule document used by the ArchSpine system. It ensures that rules are consistently formatted, enforceable, and carry the metadata needed for static analysis, reporting, and automated remediation.

## Key Parameters and Their Impact

- **`schemaVersion`** – Enables forward compatibility. Must be present to allow migration handling when the schema evolves.
- **`ruleId`** – A unique, kebab-case identifier (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). Used for rule referencing and deduplication. A misformed ID can cause the rule to be ignored or create conflicts.
- **`title`** & **`summary`** – Human-readable fields displayed in dashboards and tooltips. They must be non-empty strings.
- **`appliesTo`** – A non-empty array of file patterns or module paths. This determines where the rule is evaluated. An empty or missing value leads to runtime errors and potential bypass of the rule.
- **`severity`** – Controls CI exit codes and alerting:
  - `advisory` – informational only, does not block builds.
  - `warning` – signals potential issues; may trigger warnings but not failures.
  - `error` – must fix; blocks CI gates and triggers immediate alerts.
  Overly broad `error` rules can block legitimate changes.
- **`enforceable`** – A boolean that decides whether the system may automatically fix violations. Setting this to `true` on a widely scoped rule can lead to dangerous automatic modifications. Use with caution.
- **`bodyMarkdown`** – The full Markdown body for human guidance. Must be non-empty; provides inline documentation.
- **`rationale`** – Optional string or `null`. Explains *why* the rule exists. Helpful for reviewers but not required.

## Stability and Operational Risks

- **Structural integrity**: The schema enforces `additionalProperties: false` and requires all mandatory fields. Any extra or missing properties cause validation failure, preventing malformed rules from entering the system.
- **Enforcement misconfiguration**: An `enforceable: true` rule with a broad `appliesTo` can trigger automated changes that break the codebase. Always review the scope before enabling auto-fix.
- **Severity misuse**: An `error`-level rule that is too broad may block routine commits. Use `advisory` or `warning` for low-confidence or informational rules to avoid false positives.
- **Pattern mismatches**: Invalid `ruleId` patterns or empty strings in `appliesTo` can make the rule silently inactive or cause runtime exceptions.
- **No stray fields**: The `additionalProperties: false` constraint ensures that unexpected fields do not corrupt parsing or enforcement logic.

Operators should treat this schema as a safety gate: it prevents inconsistent or dangerous rules from being loaded. Always validate rule documents against this schema before deploying them.