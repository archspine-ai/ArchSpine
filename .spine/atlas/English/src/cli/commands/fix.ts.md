<!-- spine-content-hash:5463c8025269c0a38b5c17ddad379077ad69a33a6bfce1ff5cdafef5b15ce5b9 -->
# `fix` CLI Command Adapter

## Role

This file serves as a thin CLI command adapter for the `fix` operation. It delegates all execution logic to the runtime service's fix subsystem facade, ensuring the command layer remains lightweight and without domain logic.

## Key Responsibilities

- Defines the `ExecuteFixCommandOptions` interface for dependency injection of `RuntimeService`.
- Logs experimental warnings about the generative nature of the `spine fix` feature.
- Parses command-line arguments to determine `skipConfirmation` and `dryRun` flags.
- Invokes `runtimeService.getFixService()` with the parsed configuration and triggers the fix run.
- Throws an `ArchSpineError` with code `CliCommandFailed` if the fix run reports remaining architectural violations.

## Notable Invariants & Negative Scope

- Must remain a thin adapter; no pipeline, persistence, or domain logic should be absorbed here.
- Direct fix algorithm implementation or orchestration is strictly delegated to `RuntimeService`.

## Public Surface

- `executeFixCommand` (main entry point)
- `ExecuteFixCommandOptions` (interface)