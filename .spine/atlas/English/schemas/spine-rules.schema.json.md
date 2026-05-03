# ArchSpine SpineRule Configuration Summary

This configuration defines the **canonical structure and validation rules** for **SpineRule documents**—the actionable policy units within the ArchSpine mirror orchestration system. Every policy that controls mirror behavior must be expressed as a valid SpineRule.

## What the Configuration Controls

- **Rule document validity** – Only documents that pass JSON Schema validation are accepted.
- **Mandatory metadata** – Every rule must supply `schemaVersion`, `ruleId`, `title`, `summary`, `appliesTo`, `severity`, `enforceable`, and `bodyMarkdown`.
- **Naming consistency** – The `ruleId` must be lowercase with hyphens only (e.g., `my-rule`).
- **Severity classification** – Rules are categorized as `advisory`, `warning`, or `error`, which governs downstream enforcement behavior.
- **Target selection** – The `appliesTo` array lists which subsystems or components the rule affects; at least one entry is required.
- **Enforceability** – The `enforceable` boolean tells the system whether the rule can be applied automatically or is informational only.

## Key Parameters

| Parameter      | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| `schemaVersion` | Ensures compatibility with the consuming parser.                           |
| `ruleId`       | Unique, hyphen-separated, lowercase identifier for referencing and updates. |
| `title`        | Short human-readable name for quick context.                               |
| `summary`      | One-line description of the rule’s intent.                                 |
| `appliesTo`    | Array of target subsystem/component names; must be non-empty.              |
| `severity`     | Criticality level: `advisory` (recommendation), `warning` (potential issue), `error` (strict violation). |
| `enforceable`  | Boolean flag: `true` if the rule can be enforced automatically.            |
| `rationale`    | Optional justification (string or null).                                   |
| `bodyMarkdown` | Full rule body in Markdown; must be non-empty for actionable use.          |

## Stability and Risks

- **Strict validation** – Any missing required field, pattern mismatch, or extra property causes **immediate parsing failure**. This prevents ambiguous or malformed rules from entering the system.
- **Risk of over-constraint** – The rigid schema may limit flexible policy expressions, but the trade-off guarantees **deterministic enforcement across all distributed mirror nodes**. Operators should ensure rule authors are aware of the required fields and patterns to avoid rejections.
- **Version compatibility** – The `schemaVersion` field must match the version expected by the parser; using an outdated version will cause failure.

---