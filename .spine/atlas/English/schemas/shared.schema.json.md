# ArchSpine Shared Definitions – Configuration Summary

This foundational schema defines all reusable data types and validation rules used across every ArchSpine component and schema. It ensures type consistency, enforces format constraints, and acts as the single source of truth for base types such as version strings, timestamps, paths, hashes, locale codes, and enumerated classifications.

## What the Configuration Controls

The schema controls the allowed formats and values for every shared field in the ArchSpine ecosystem. Any data entering the system must conform to these definitions or validation fails. Key areas include:

- **Versioning**: All `schemaVersion` fields must follow `major.minor.patch` SemVer format. Malformed versions break schema validation chain.
- **Timestamps**: `isoTimestamp` enforces ISO 8601 format; critical for ordering events, caching, and incremental processing.
- **File Paths**: `repoRelativePath` and `scopePath` ensure paths are relative, cross-platform safe, and block absolute paths, backslashes, or double slashes (prevents traversal attacks).
- **Content Integrity**: `contentHash` requires exactly 64 lowercase hex characters (SHA-256) – essential for cache consistency and corruption detection.
- **Locale & Language**: `locale` validates BCP 47 tags; incorrect tags break localization lookups. `languageSelectionKey` non-empty check prevents missing keys during atlas merging.
- **Enumerated Types**: `sourceLanguage`, `fileKind`, `symbolKind`, `dependencyRelation`, `edgeProvenance`, and `pipelineStage` are all constrained to closed enum sets. Any unknown value is rejected unless explicitly handled (e.g., `"unsupported"` for source language).

## Important Parameters for Operators

| Parameter | Why It Matters |
|-----------|----------------|
| `schemaVersion` | Version mismatch can cascade; must match the expected schema major version. |
| `repoRelativePath` | Security-critical: blocks malicious paths. Misuse can cause false rejects for legitimate paths – review regex periodically. |
| `contentHash` | Integrity anchor; stale or incorrect hashes invalidate downstream caches and comparisons. |
| `locale` | Wrong format fails silently in some tools; ensure all locale entries follow BCP 47 exactly. |
| `sourceLanguage` | Adding a new language requires schema update; until then, new languages must be treated as `"unsupported"`. |
| `dependencyRelation` | Mistaking `type-import` for `import` skews dependency weight calculations – important for dependency analysis and governance. |
| `pipelineStage` | Stale or misrecorded stage can invalidate downstream consumers (e.g., using `"ast"` data when `"llm"` was expected). |
| `edgeProvenance` | Affects confidence scoring in dependency graphs. Over-relying on `"inferred"` edges may mislead analysis. |

## Stability Concerns & Operational Risks

- **Tight coupling**: Any change to this schema propagates to all dependent schemas and runtime validators. Backward-incompatible changes (e.g., adding a required field, narrowing a regex, or removing an enum value) require a **major version bump**.
- **Enum rigidity**: Closed enums provide strong validation but require schema releases to support new tools or languages. Consider the trade-off: relaxing to `"type": "string"` with documentation guidance increases flexibility but loses automatic validation.
- **Security vs. usability**: The strict path and hash patterns prevent injection and path-traversal attacks but may reject legitimate edge cases (e.g., paths with non-ASCII characters, new language code formats). Regular audits and user feedback loops are recommended.
- **Cache & ordering risks**: Timestamp and hash mismatches can break incremental builds and dependency caching. Operators must ensure timestamps are generated in UTC at consistent precision.

All operators working with ArchSpine should treat this schema as immutable once in production unless a coordinated upgrade is planned. Use schema version negotiation to avoid silent failures.