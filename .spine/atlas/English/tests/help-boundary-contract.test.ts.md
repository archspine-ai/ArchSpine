<!-- spine-content-hash:b41bd8f3f430e84ab909d1a7d2c58666eb3f891a18d1454a958df35434063e6b -->
# ArchSpine – CLI Help Test Suite

## Role
Vitest unit test suite for CLI help command boundary contracts.

## Key Responsibilities
- Verifies that `printCommandHelp` for the `sync` command outputs correct usage syntax and redirects heavy work to `build`.
- Verifies that `printGeneralHelp` outputs general usage and does not include the deprecated `--full` flag.

## Notable Invariants & Negative Scope
- Must import Vitest testing utilities.
- Must mock `console.log` to capture output.
- Must assert specific string containment and exclusion in help text.
- Does **not** implement CLI help logic (delegated to `src/cli/help.ts`).
- Does **not** test non-CLI components.
- Does **not** provide runtime help to users.

## Most Important Exported / Externally Visible Behavior
- Ensures CLI help messages maintain clear boundaries between incremental sync and full rebuild, preventing user confusion.