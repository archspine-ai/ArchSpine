<!-- spine-content-hash:18475d0c4bd6012273632c62a681623e7a0eeec8587ee725290bfae40cfd8a3d -->
# ArchSpine – Rule Loading Test Suite

## Role
Vitest unit test suite validating the rule loading subsystem.

## Key Responsibilities
- Validates that `loadRulesFromDir` correctly parses YAML rule templates into normalized rule documents.
- Ensures rule properties (`ruleId`, `appliesTo`, `severity`, `summary`) are correctly extracted and match expected values.
- Tests rule loading from a temporary directory to isolate filesystem dependencies.
- Verifies that rule loading handles directory paths relative to the current working directory.

## Notable Invariants & Negative Scope
- Uses Vitest testing framework with `describe`/`it`/`expect` assertions.
- Isolates filesystem operations using temporary directories.
- Depends on the `loadRulesFromDir` function from `../src/infra/rules-loader.js`.
- **Out of scope:** Testing other subsystems like CLI or scanners; production rule enforcement or runtime validation; UI or API endpoints.

## Most Important Exported Behavior
The test suite exercises the core rule loading functionality, ensuring that architectural rule definitions are parsed correctly and that the loading process is robust against filesystem dependencies.