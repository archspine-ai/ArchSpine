<!-- spine-content-hash:40fe341ae5617716f77939a367b9086b4446d4e1f893c908f380cac40ba65bf1 -->
# ArchSpine Version Module

## Role
Centralized version definition module for ArchSpine schema and package versioning.

## Key Responsibilities
- Defines the `SchemaVersion` type alias as a semantic version string template.
- Exports constants for the current package, schema, and config schema versions.
- Exports a generator version string identifying the ArchSpine toolchain.
- Provides a type guard function to validate config schema version compatibility.

## Notable Invariants & Negative Scope
- All exported version constants are string literals or template literals.
- `SchemaVersion` type is a semantic version string template literal.
- `isSupportedConfigSchemaVersion` is a pure type guard.
- This module does **not** handle runtime version management, dynamic version resolution, interface definitions, or schema validation beyond version string equality.

## Public Surface (Exported Symbols)
- `SchemaVersion`
- `CURRENT_PACKAGE_VERSION`
- `CURRENT_SCHEMA_VERSION`
- `CURRENT_CONFIG_SCHEMA_VERSION`
- `GENERATOR_VERSION`
- `isSupportedConfigSchemaVersion`