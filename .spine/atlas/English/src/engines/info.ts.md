<!-- spine-content-hash:6892db4124c191610c3829a83cdc9d91957b4e9d57350dc45ce0d9a1c5a15ca3 -->
# ArchSpine – Sync & Health CLI Module

## Role
This module provides a CLI command for checking project sync status, validating protected outputs, and reporting overall system health. It is a user-facing diagnostic tool, not an engine or orchestrator.

## Key Responsibilities
- Loads and inspects the project manifest to retrieve sync status, language snapshots, and indexed unit counts.
- Validates protected output mutations using spine-gate detection and formats warnings for user display.
- Reports sync completion status, reverse index state, and total usage statistics via runtime IO.
- Integrates with the runtime service to resolve LLM settings and execution profiles for context-aware checks.

## Out of Scope
- Performing actual sync operations or modifying the manifest.
- Direct LLM inference or content generation.
- Orchestrating multiple engines or analytical transformations.

## Invariants
- Must remain a CLI-facing command module, not an engine.
- Depends on infrastructure modules (config, manifest, secrets, runtime-io) and the runtime service for orchestration.
- Should not import CLI entrypoints or presentation layers beyond runtime IO.

## Architectural Intent
This module provides a user-facing CLI command for health and sync status reporting, leveraging the runtime service and infrastructure for consistent project state inspection. Recent refactoring has focused on establishing subsystem facades and resolving layer inversions, aligning this module with clearer separation from engine logic.

## Public Surface
No explicit public surface is defined; all behavior is exposed through CLI invocation.