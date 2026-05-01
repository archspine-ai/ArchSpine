<!-- spine-content-hash:c7274001b0270538fec96a7e7437a48b44e5c3b2c7419d4cd35bd096b6b2367a -->
# ArchSpine SpineProjectUnit Schema

## Role
Defines the structural schema for a `SpineProjectUnit`, which is the fundamental project unit descriptor in the ArchSpine mirror system.

## Key Responsibilities
- **Project unit metadata validation** – Ensures every project unit conforms to a strict, well-defined structure.
- **Module hierarchy definition** – Organizes sub-components (modules) with directory paths, roles, and child counts to represent internal project structure.
- **Provenance tracking for generation pipelines** – Captures origin and generation metadata (indexing timestamp, generator version, pipeline stages) for auditability.

## Notable Invariants
- All fields (`schemaVersion`, `projectName`, `role`, `responsibility`, `modules`, `provenance`) are **required**.
- `additionalProperties` is set to `false` at both root and nested object levels, enforcing strict schema compliance.
- `childCount` must be a **non-negative integer** (minimum 0).
- All string fields reference `nonEmptyString` definitions, **preventing empty values**.

## Negative Scope (Out of Scope)
- No explicit out-of-scope items are defined.

## Most Important Exported / Externally Visible Behavior
- The schema acts as a **contract** for all project units in the mirror system. Any unit that does not satisfy these invariants will be rejected, preventing malformed configurations from causing cascading failures in dependency resolution or module discovery.
- Provenance tracking ensures **traceability** but requires accurate pipeline stage data; missing or incorrect provenance may cause synchronization issues.
- Non-empty string constraints mitigate risks of **silent failures** from empty identifiers.

## Stability and Risks
This schema enforces strict structural validation for project units. The invariants prevent malformed or incomplete configurations, which could otherwise lead to cascading failures in the mirror system's dependency resolution or module discovery. The provenance tracking ensures auditability but requires accurate pipeline stage data; missing or incorrect provenance may cause synchronization issues. The non-empty string constraints mitigate risks of silent failures from empty identifiers. Overall, this schema promotes system stability by ensuring all project units are well-formed and traceable.

## Parameter Definitions
- **schemaVersion**: Specifies the version of the schema being used, ensuring compatibility with the ArchSpine system.
- **projectName**: A non-empty string uniquely identifying the project within the mirror system.
- **role**: A non-empty string describing the functional role of this project unit.
- **responsibility**: A non-empty string outlining the primary responsibility or domain of this project unit.
- **modules**: An array of module objects, each defining a sub-component with a directory path, role, and child count. This structures the project's internal hierarchy.
- **provenance**: An object tracking the origin and generation metadata of this project unit, including indexing timestamp, generator version, and pipeline stages.