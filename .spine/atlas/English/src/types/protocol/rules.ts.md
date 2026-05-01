<!-- spine-content-hash:657fa95295251c9402555e31e76bdf43b157473a3d57d5ce95788779682bcb45 -->
# SpineRuleDocument Interface

## Role
TypeScript interface defining the canonical data structure for an ArchSpine rule document within the rule engine's domain model.

## Key Responsibilities
- Declares the mandatory and optional fields for a serializable rule document, including identifier, metadata, applicability, severity, and content.
- Enforces a consistent schema for rule definitions across the ArchSpine system by typing the `schemaVersion`, `ruleId`, `title`, `summary`, `appliesTo`, `severity`, `enforceable`, `rationale`, and `bodyMarkdown` properties.

## Notable Invariants & Negative Scope
- **Invariants:** Defines a static, type-safe contract for rule document structure. Exported as the primary interface for rule data interchange.
- **Out of Scope:** Does not implement rule validation or enforcement logic. Does not handle parsing or serialization of rule documents. Does not define runtime behavior or execution of rules.

## Most Important Exported Behavior
- **Public Surface:** `SpineRuleDocument` — the primary interface for rule data interchange across the rule engine and scanning subsystems.

## Rule Violations
- **interface-prefix (warning):** Interface `SpineRuleDocument` does not start with the required prefix `I` as per the internal interface naming rule.

## Drift Detection
- **Drift Detected:** No
- **Drift Reason:** N/A