# ArchSpine Config Summary

This configuration file defines structural metadata and indexing provenance for a source directory within the ArchSpine repository. It tells the system how to interpret the folder’s contents, assigns a high-level responsibility to the directory, and tracks which processing stages were applied during indexing.

## What It Controls

- **schemaVersion** – Controls compatibility with the ArchSpine parser. Using an unsupported version may cause errors.
- **directory** – Specifies the relative path of the directory being described. Must exist or the index may fail. In our example, this is `src`.
- **role** – A natural-language description of the directory’s purpose. Here: “Core application module container.” AI agents use this to understand context.
- **responsibility** – A high-level statement of what the directory is accountable for. Here: “Groups source files that implement the repository indexing pipeline.”
- **children** – An array of file entries. Each entry’s integrity directly affects downstream indexing and querying. In this example, `src/auth.ts` and `src/sync.ts` are listed with their own roles and `fileKind: source`.
- **filePath** – Relative path to a file within the directory. Must be valid and accessible.
- **fileKind** – Categorizes the file type (e.g., `source`). Incorrect values may break parsers.
- **provenance** – Metadata block certifying when and how this configuration was generated. Missing fields can lead to trust issues.
  - **indexedAt** – Timestamp of the indexing run; used for cache invalidation and freshness checks.
  - **generatorVersion** – Version of the ArchSpine tool that produced this file; ensures compatibility with the pipeline.
  - **pipelineStages** – List of processing stages applied (e.g., `ast`, `llm`). Gaps can indicate incomplete indexing.

## Invariants

- All `children` entries must specify a valid `filePath` and `fileKind`.
- The `fileKind` value must be one of the recognized kinds (e.g., `source`).
- The `provenance` block must include `indexedAt`, `generatorVersion`, and `pipelineStages` to ensure traceability.
- The `directory` value must correspond to a real directory in the repository.
- The `schemaVersion` must match a supported version (e.g., `1.0.0`).

## Operational Risks & Stability Notes

This configuration file is a structural anchor for the indexing pipeline. If fields like `role` or `responsibility` are missing or inaccurate, AI agents may misinterpret the module’s purpose, leading to incorrect recommendations. The `children` list must be kept in sync with the actual file system – stale entries cause indexing mismatches. Provenance fields such as `generatorVersion` protect against pipeline version drift; omitting them risks silent incompatibility. Overall, this file is low-risk when auto-generated, but manual edits should be validated against the schema to avoid silent failures.

---