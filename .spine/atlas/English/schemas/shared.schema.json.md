# ArchSpine Shared Definitions - Configuration Summary

This schema defines foundational validation types and structural constraints used by all ArchSpine data components. It enforces consistent formatting and type safety across the entire pipeline — from source analysis to graph construction.

## What This Configuration Controls

The schema governs how core data fields are shaped and verified. Operators must ensure that any data entering the system conforms to these patterns; violations will be rejected or cause pipeline failures.

### Key Parameters

| Parameter | Purpose & Impact |
|-----------|------------------|
| **schemaVersion** | Enforces semantic versioning (e.g., `1.0.0`). Affects compatibility checks and schema migration decisions. |
| **isoTimestamp** | Validates ISO 8601 date-time strings. Impacts event ordering, audit trails, and synchronization across workers. |
| **repoRelativePath** | Sanitizes file paths relative to the repository root. Prevents path traversal (`../`), absolute paths (`/`), or malformed references (backslashes, double slashes). |
| **scopePath** | Normalizes scope identifiers; empty string is allowed for root scope. Affects module resolution and namespace isolation. |
| **contentHash** | Enforces SHA‑256 hex digest (exactly 64 lowercase hex chars). Critical for cache invalidation and content integrity verification. |
| **locale** | Validates BCP 47 locale codes (e.g., `en-US`, `zh-CN`). Controls internationalization matching in metadata and UI. |
| **languageSelectionKey** | Non‑empty string used as key for multilingual content maps. Ensures every entry is addressable. |
| **sourceLanguage** | Restricts source code language to known types (`typescript`, `javascript`, `python`, `unsupported`). Prevents unsupported languages from entering analysis. |
| **fileKind** | Categorizes files as `source`, `config`, `document`, or `other`. Enforces type‑specific processing rules. |
| **symbolKind** | Classifies symbols (`class`, `function`, `variable`, `interface`, `type`, `enum`, `unknown`). Drives dependency graph semantics and diagram generation. |
| **dependencyRelation** | Defines relation type between modules (`import`, `reexport`, `type-import`). Affects build order, tree shaking, and module boundary decisions. |
| **edgeProvenance** | Marks how dependency edges were discovered (`ast` or `inferred`). Distinguishes certain (AST‑based) vs. heuristic relationships, enabling confidence‑based filtering. |
| **pipelineStage** | Indicates which analysis stage produced the data (`ast`, `llm`, `lite‑ast`, `lite‑llm`, `fallback`). Enables stage‑specific processing, quality scoring, and fallback logic. |
| **nonEmptyString** | Guarantees string values have at least one character. Prevents empty fields in critical data (e.g., identifiers). |
| **stringArray** | Defines a homogeneous array of strings. Useful for lists of tags, paths, or IDs. |
| **localizedContentMap** | Stores multilingual content as a map keyed by locale code (must be valid `languageSelectionKey`). Enables localized configuration, documentation, and user‑facing strings. |

## Stability & Risks

This schema establishes **strong invariants** that prevent malformed or ambiguous data from propagating through ArchSpine. However, operators should be aware of the following:

- **Pattern strictness**: Overly restrictive patterns may reject valid edge cases — for example, non‑standard semantic version formats (e.g., `1.0.0-beta`) are not allowed without schema extension. Future locale patterns (e.g., `zh-Hans-CN`) are supported if they conform to BCP 47.
- **Enum obsolescence**: Enum values for languages, file kinds, symbol kinds, etc., may become outdated as ecosystems evolve. Adding new values requires schema updates and coordination with downstream consumers.
- **Migration overhead**: Any change to these base definitions can break existing data. Semver versioning of the schema itself is recommended; operators should version‑lock data producers and consumers.
- **Recommendation**: Conduct regular schema audits to accommodate new requirements (e.g., additional source languages, new dependency relation types) without breaking existing records. Use the `pipelineStage` field to track which analysis version produced the data, enabling progressive adoption.