# ArchSpine Configuration Summary: `no-direct-db-import` Rule

This architectural rule enforces clean domain boundaries by prohibiting application code from directly importing modules in the database layer.

## What It Controls

The rule is defined by the following key parameters in your configuration:

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `schemaVersion` | `1.0.0` | Schema version for interpretation; upgrade only if rule structure changes. |
| `ruleId` | `no-direct-db-import` | Unique identifier used by all tooling (linters, CI checks). |
| `title` | "Prohibit direct database layer import" | Human-readable name for dashboards and reports. |
| `summary` | Services and middleware layers must not directly depend on low‑level database adapters. | Core principle of the rule. |
| `appliesTo` | `["src/**/*.ts", "!src/db/**"]` | Glob pattern: all TypeScript files under `src/` **except** those inside `src/db/` itself. |
| `severity` | `error` | Violations **block builds** and prevent CI pipeline from passing. |
| `enforceable` | `true` | The rule is automatically checked by static analysis or linting. |
| `rationale` | Keep domain boundaries clear, avoid coupling business logic to low‑level storage implementation. | Why the rule exists. |
| `bodyMarkdown` | (Markdown content with examples) | Detailed documentation of allowed/disallowed import patterns. |

## Operational Risks & Stability Concerns

- **Stability benefit:** By enforcing this rule you prevent business logic from becoming tightly coupled to database internals. This preserves the ability to refactor storage (e.g., switch from PostgreSQL to a different adapter) without touching application services.
- **Risk of misconfiguration:** The `appliesTo` glob must match your actual project structure. If `src/db/` is renamed or restructured, the exclusion may no longer apply, causing false negatives. Conversely, if the exclusion pattern is too broad, legitimate imports from `src/db/` utilities (if any) could be blocked.
- **Gradual erosion:** Repeated violations (even if unintentional) degrade domain isolation over time, making future testing and separation of concerns extremely difficult. The rule’s `error` severity ensures early detection in CI.
- **Recommendation:** Periodically audit the `appliesTo` pattern to ensure it aligns with the current folder layout, and review `bodyMarkdown` for updated examples.