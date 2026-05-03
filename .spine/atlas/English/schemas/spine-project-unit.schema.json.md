# ArchSpine SpineProjectUnit Configuration Summary

This configuration unit defines the schema for a `SpineProjectUnit`, a self-contained and validated configuration unit within the ArchSpine mirror system. Every project unit must adhere to this structure to ensure data integrity, auditability, and safe integration with the broader mirror infrastructure.

## What the Configuration Controls

The configuration describes a single project unit's metadata, module layout, and provenance tracking. It enforces strict validation of required fields and forbids any extra properties, preventing malformed entries from entering the system. The configuration is used to:

- Identify the project unit by name and functional role.
- Declare the responsibility or purpose of the unit.
- Define the directory paths, roles, and child module counts for all submodules.
- Record provenance metadata for traceability and pipeline auditing.

## Key Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `schemaVersion` | string (from shared schema) | Yes | Version of the schema used, enabling forward/backward compatibility. |
| `projectName` | string (non-empty) | Yes | Unique identifier for the project within the mirror system. |
| `role` | string (non-empty) | Yes | Functional role of this project unit (e.g., `gateway`, `connector`). |
| `responsibility` | string (non-empty) | Yes | Description of what this project unit is responsible for. |
| `modules` | array of module objects | Yes | List of submodule configurations. Each object contains:<br>- `directory` (path, required)<br>- `role` (non-empty string, required)<br>- `childCount` (integer ≥ 0, required) |
| `provenance` | object | Yes | Tracks origin and processing. Contains:<br>- `indexedAt` (ISO timestamp)<br>- `generatorVersion` (non-empty string)<br>- `pipelineStages` (array of pipeline stages) |

## Stability and Operational Risks

- **Strict Validation**: All required fields must be present, and no additional properties are allowed at the top level or inside module objects. A missing field or an extra property will cause the configuration to be rejected. This protects the system from malformed data.
- **Non-negative `childCount`**: The `childCount` must be an integer ≥ 0. Negative values are not permitted because they could corrupt graph traversal or dependency resolution in the mirror infrastructure.
- **Provenance Auditability**: The `provenance` block requires precise timestamps, generator version, and pipeline stages. Incorrect or missing pipeline stages can hinder debugging and auditing. Operators must ensure that provenance data is accurate and complete.
- **Overall Integrity**: Adherence to this schema maintains data consistency across the ArchSpine mirror system. Any deviations should be caught during CI/CD validation before deployment.

**Operator Note**: Always validate configuration files against this schema before introducing new project units. Use automated tools to check for schema compliance and to verify that module counts and paths reflect the actual file system layout.