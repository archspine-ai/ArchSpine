<!-- spine-content-hash:433b78d5640541d01157d7734e5c3246c2de40ab9f5a7b50cbbd5c025f2b63a0 -->
# ArchSpine Rule Engine

## Role
Core rule engine for loading, storing, and matching architectural rules against file paths within the ArchSpine system.

## Key Responsibilities
- Loads `SpineRuleDocument` objects from a specified directory using the rules-loader infrastructure.
- Filters and applies rule patterns (including negations with `!`) to determine which rules match a given file path.
- Provides a public method to retrieve all rules applicable to a specific file for downstream enforcement or analysis.
- Utilizes picomatch for glob pattern matching against file paths.

## Notable Invariants
- Engine modules must not import CLI entrypoints or service-level orchestration (engine-independence rule).
- Rule matching must support negation patterns using `!` prefix.
- All loaded rules must conform to the `SpineRuleDocument` type.

## Negative Scope (Out of Scope)
- CLI entrypoints or command-line argument parsing.
- Service-level orchestration or workflow management.
- User interface or presentation concerns.
- Direct file system traversal beyond the configured root directory.

## Public Surface
- `constructor(rootDir: string)`
- `loadRules()`
- `getRulesForFile(filePath: string): SpineRuleDocument[]`

## Architectural Intent
Provide a reusable, decoupled rule engine that loads architectural rules from disk and enables pattern-based matching for file paths, forming the analytical backbone of the ArchSpine system.

## Recent Change Intent
Resolve lint errors and finalize pipeline fixes before v1.0, ensuring the rule engine integrates cleanly with the broader infrastructure.