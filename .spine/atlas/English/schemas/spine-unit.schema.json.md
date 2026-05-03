# ArchSpine SpineUnit Schema — Configuration Summary

This schema defines the structure of every **SpineUnit** document in the ArchSpine mirror system. A SpineUnit represents a single source code unit (file) and carries all metadata needed for indexing, validation, dependency analysis, and governance enforcement. Operators must ensure that every SpineUnit conforms to this schema to maintain system integrity.

## What the Configuration Controls

The schema governs the validity of six required top-level properties:

- **`schemaVersion`** — Must match the version declared in the shared schema. Schema mismatches are the most common cause of ingestion failures.
- **`identity`** — Uniquely identifies the unit via `filePath` (repo-relative), `contentHash`, `skeletonHash`, `semanticHash`, `language`, `fileKind`, and `scope`. The hashes must be valid content hashes; the file path must be non‑empty and repo‑relative.
- **`semantic`** — The core governance metadata. Contains:
  - `role` and `responsibilities` (descriptive arrays).
  - `outOfScope` (list of explicitly excluded responsibilities).
  - `invariants` — each has an `id` (kebab‑case), `description`, and `enforceable` boolean. These invariants are critical for enforcement engines.
  - `changeIntent` — `architecturalIntent` and `recentChangeIntent` (nullable strings). Missing intent can block automated change‑impact analysis.
  - `publicSurface` — exported symbols (`symbolName` + `description`). Required for API surface tracking.
- **`skeleton`** — Structural outline (imports/exports). Used by dependency resolvers.
- **`graph`** — Stores derived dependency and call‑graph edges.
- **`provenance`** — Origin and history (timestamps, generation context). Vital for auditing and rollback decisions.

## Parameters That Matter Most

| Parameter | Why It Matters |
|-----------|----------------|
| `schemaVersion` | Must match the system‑wide active schema. A mismatch causes immediate rejection. |
| `identity.contentHash` | Primary deduplication key. Incorrect or stale hashes break incremental indexing. |
| `semantic.invariants[].id` | Must be kebab‑case and unique. Used by policy engines to enforce rules. |
| `semantic.changeIntent` | Two nullable string fields. If left `null`, automated reasoning about change rationale is unavailable. |
| `publicSurface[].symbolName` | Drives API‑compliance checks. Missing or misspelled symbols generate false governance alerts. |

## Operational Risks and Stability Concerns

- **Schema version drift**: If the system updates to a new schema version without migrating existing SpineUnits, all older documents become unreadable. **Always upgrade documents in a staging environment first.**
- **Missing required fields**: Any SpineUnit that lacks one of the six top‑level properties will be rejected at ingestion. Validate documents before bulk import.
- **Invariant enforcement**: The `enforceable` flag is a boolean. If set to `true`, the system must attempt to verify that invariant programmatically. Turning invariants on without corresponding verification logic produces false negatives.
- **Hash correctness**: Hashes (`contentHash`, `skeletonHash`, `semanticHash`) must be computed consistently. Changing the hash algorithm without re‑scanning invalidates all existing documents.
- **Backward compatibility**: The schema does not allow `additionalProperties`. Adding new fields in future versions will break compatibility unless the schema is explicitly revised. Use the `$schema` versioning mechanism to manage transitions.

Keep the schema as the single source of truth for SpineUnit validation. Any deviation between generated documents and this schema will ripple across the entire ArchSpine pipeline, causing indexing failures, broken dependency graphs, and inconsistent governance reports.