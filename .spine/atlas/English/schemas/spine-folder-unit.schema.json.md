### ArchSpine SpineFolderUnit Configuration Summary

The **SpineFolderUnit** schema defines a structured representation of a directory within the ArchSpine mirror system. Each instance describes a folder’s identity, its purpose, and the metadata of files it contains. This configuration is critical for operators who manage the indexing, validation, and traceability of directory units across pipeline stages.

#### What This Configuration Controls

- **structural contract** – Every SpineFolderUnit must include all six required fields: `schemaVersion`, `directory`, `role`, `responsibility`, `children`, and `provenance`. Omitting any will cause validation failures.
- **directory identity** – The `directory` field provides the relative path within the project scope, anchoring the unit to a specific location.
- **semantic role** – `role` and `responsibility` convey why the folder exists (e.g., configuration, source, documentation) and what it is accountable for. These strings must be non-empty but are otherwise free-form; operators should apply consistent naming conventions to avoid confusion.
- **child file metadata** – The `children` array lists every file under this folder, each with a `filePath`, `role`, and `fileKind`. This enables hierarchical consistency and type‑based processing (e.g., only process files with `fileKind: "config"`).
- **provenance tracking** – The `provenance` object records when the unit was indexed (`indexedAt` as ISO timestamp), which tool version created it (`generatorVersion`), and which pipeline stages processed it (`pipelineStages` as an array). This is essential for auditability and debugging.

#### Which Parameters Matter Most

| Parameter | Importance |
|-----------|------------|
| `directory`, `role`, `responsibility` | Define the folder’s identity and context; incorrect values can mislead downstream tools. |
| `children[*].filePath`, `role`, `fileKind` | Drive automated file processing; missing or inaccurate entries can break pipelines. |
| `provenance.indexedAt`, `generatorVersion`, `pipelineStages` | Provide the unit’s history; stale or false data erodes trust and complicates forensic analysis. |

#### Operational Risks and Stability Concerns

1. **Validation failures** – Because the schema rejects additional properties and enforces required fields, any misconfiguration (e.g., a typo in a property name, a missing `fileKind`) will cause the unit to be rejected. Ensure all instances are generated or written against the latest schema (`https://archspine.dev/schema/v1.0.0/spine-folder-unit.schema.json`).

2. **Data integrity failures** – If `provenance` fields are not populated correctly (e.g., wrong timestamp or generator version), downstream systems that rely on them for ordering or trust validation may produce erroneous results. Treat provenance as a first‑class concern, not an optional annotation.

3. **Downstream dependency** – Many pipeline stages assume the `children` array is complete and accurate. An incomplete list can cause files to be overlooked; an incorrect `fileKind` can route a file to the wrong processor. Validate the `children` array against the actual file system during indexing.

4. **Schema version drift** – The `schemaVersion` field references a versioned schema. Using an outdated version could lead to incompatibility with newer tools. Always synchronise the generator version with the expected schema.

**Bottom line**: Strict adherence to this schema improves system consistency and reduces integration errors. Operators should treat every SpineFolderUnit as a critical metadata record and validate it against the schema before committing to any pipeline.