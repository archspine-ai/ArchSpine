<!-- spine-content-hash:5b225a87d53d0d6e9145d758d0ef11810730c38104b5435b6ddaf17eceda04f6 -->
# SpineRule Schema — ArchSpine Mirror System

## Role
Defines the schema for individual SpineRule documents within the ArchSpine mirror system, specifying the structure and validation constraints for governance rules.

## Key Responsibilities
- **Rule document validation** — ensures every rule conforms to the required structure before entering the system.
- **Enforcement severity classification** — categorizes rules by operational impact (advisory, warning, error).
- **Rule applicability scoping** — restricts each rule to specific target subsystems or components.
- **Schema versioning and compliance** — manages compatibility with the ArchSpine schema versioning system.

## Notable Invariants
- All required fields (`schemaVersion`, `ruleId`, `title`, `summary`, `appliesTo`, `severity`, `enforceable`, `bodyMarkdown`) must be present.
- `ruleId` must match the lowercase kebab-case pattern (e.g., `my-rule-id`).
- `appliesTo` array must contain at least one non-empty string; empty arrays are rejected.
- `severity` must be one of: `advisory`, `warning`, `error`.
- No additional properties beyond the defined schema are permitted — strict validation prevents schema drift.

## Negative Scope
- This schema does **not** define how rules are executed or enforced at runtime.
- It does **not** handle rule ordering, priority, or conflict resolution.
- It does **not** specify storage or retrieval mechanisms for rule documents.

## Exported / Externally Visible Behavior
- The schema is used to validate incoming SpineRule documents. Documents that fail validation are rejected outright, preventing incomplete or malformed rules from entering the system.
- The `severity` enum ensures consistent enforcement levels across all rules, enabling predictable behavior in downstream enforcement systems.
- The `appliesTo` array with `minItems:1` ensures rules are always scoped to at least one target, avoiding ambiguous or system-wide unintended effects.
- The strict `additionalProperties` constraint prevents schema drift and unexpected behavior from unknown fields.

## Parameter Definitions
- **schemaVersion**: Controls compatibility with the ArchSpine schema versioning system; mismatches can cause rule rejection or silent failures.
- **ruleId**: Unique identifier in lowercase kebab-case; used for rule referencing and deduplication; collisions may cause unpredictable behavior.
- **title**: Human-readable rule name; must be non-empty for clarity in reports and logs.
- **summary**: Brief description of the rule's purpose; non-empty requirement ensures minimum documentation.
- **appliesTo**: List of target subsystems or components the rule governs; empty arrays are rejected to prevent orphaned rules.
- **severity**: Operational impact level: `advisory` for informational, `warning` for non-blocking violations, `error` for blocking violations that halt operations.
- **enforceable**: Boolean flag indicating whether the rule can be automatically enforced; `false` means manual review required.
- **rationale**: Optional justification string; `null` allowed when rationale is not provided.
- **bodyMarkdown**: Full rule text in Markdown format; must be non-empty to ensure actionable content.

## Stability and Risks
This schema enforces structural integrity of governance rules. Missing required fields cause document rejection, preventing incomplete rules from entering the system. The severity enum ensures consistent enforcement levels across all rules. The strict `additionalProperties` constraint prevents schema drift and unexpected behavior from unknown fields. The `appliesTo` array with `minItems:1` ensures rules are always scoped to at least one target, avoiding ambiguous or system-wide unintended effects. Overall, this schema promotes system stability by enforcing a rigid contract for rule documents, reducing parsing errors and misconfigurations.