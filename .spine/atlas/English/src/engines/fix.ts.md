<!-- spine-content-hash:31ba18382e030465e08de1fb2335a59f09428d609f419ea9426e8b7b81196d73 -->
# Fix Service Public API Facade

This file serves as the **public barrel export** for the fix service module. It does not contain any implementation logic; instead, it re-exports key symbols from the underlying service implementation to provide a clean, stable interface for consumers.

## Responsibilities

- Re-exports the `FixService` class and `runFix` function from the service implementation.
- Re-exports the `FixRunSummary` type for use by external consumers.
- Acts as a single entry point for all fix-related public API surface.

## Out of Scope

- Does **not** implement any fix logic or business rules.
- Does **not** orchestrate service execution.
- Does **not** provide CLI entrypoints.

## Invariants

- Must contain **only** re-exports from the underlying service module.
- Must **not** contain any executable logic or state.

## Public Surface

- `FixService`
- `runFix`
- `FixRunSummary`

## Change Intent

The architectural intent is to provide a stable, decoupled public API for the fix service, facilitating modular consumption and dependency management. No recent changes have been detected in this file.