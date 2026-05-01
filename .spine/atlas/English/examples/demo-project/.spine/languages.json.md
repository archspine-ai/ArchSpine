<!-- spine-content-hash:a54cef3e2b83284c936367b354112264dbef01ab58b78af9c7c8edc350bc32af -->
# ArchSpine Language & Extension Registry

## Role
This file serves as the **language and extension registry** for the ArchSpine mirror system. It declares which file extensions are recognized, maps programming languages to their associated extensions, and tracks the availability status of each language processor.

## Key Responsibilities
- Declares the set of file extensions the system will process.
- Maps each programming language identifier to its file extension(s).
- Tracks whether each language processor is ready for use (e.g., `available`).

## Notable Invariants
- `schemaVersion` must be `1` for this configuration format.
- Every language entry must have a non-empty `extensions` array.
- Every language entry must include a valid `status` field.

## Negative Scope (Out of Scope)
- This file does **not** define processing logic, transformation rules, or analysis behavior for any language.
- It does **not** validate the actual presence or correctness of language processors — only their declared status.

## Exported / Externally Visible Behavior
- The system reads this registry to determine which file types to discover and process.
- If a language is marked `available` but its processor is missing or misconfigured, the system may fail to analyze or transform files of that type.
- Missing extensions in `detectedExtensions` may cause files to be silently ignored.
- Changing `schemaVersion` without a corresponding schema update will break configuration loading.

## Parameter Definitions
- **schemaVersion**: Defines the version of the configuration schema. Currently fixed at `1`.
- **detectedExtensions**: List of all file extensions that the system has discovered and will process.
- **languages**: Mapping of programming language identifiers to their configuration objects.
  - **languages.typescript.extensions**: File extensions associated with TypeScript. Currently only `.ts`.
  - **languages.typescript.status**: Indicates whether the TypeScript language processor is ready for use. Value `available` means it is operational.

## Stability & Risks
This file controls which file types the system recognizes and processes. If a language is marked as `available` but its processor is missing or misconfigured, the system may fail to analyze or transform files of that type. Missing extensions in `detectedExtensions` could cause files to be silently ignored. The `schemaVersion` invariant ensures backward compatibility; changing it without a corresponding schema update will break configuration loading.