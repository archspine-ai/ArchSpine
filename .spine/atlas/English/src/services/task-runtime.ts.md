<!-- spine-content-hash:cda10745da4a9c656554eeb708a94598cca5cc07e359abb43952657610f6d96e -->
# ArchSpine – Core Service Orchestrator

## Role
This module acts as the central service orchestrator for the ArchSpine system. It prepares and coordinates all task execution engines and supporting infrastructure, ensuring that analysis pipelines run in a policy-compliant, thread-safe manner.

## Key Responsibilities
- Resolves prompt policy tiers and validation policies from configuration and environment settings.
- Creates and initializes task state and artifact state for execution pipelines.
- Orchestrates the scanner, aggregator, rule engine, context engine, and LLM client to perform coordinated analysis.
- Manages locks and scan policies to guarantee thread-safe, policy-compliant operations.

## Out of Scope
- View-specific rendering or UI logic.
- Direct low-level file I/O operations.
- Implementation of individual analysis engines (e.g., scanner, aggregator, rule engine internals).

## Invariants
- Must orchestrate core, engines, and infrastructure modules without implementing their internal logic.
- Must resolve configuration policies (prompt, validation, scan) from environment and infrastructure.
- Must produce a `PreparedTaskContext` for downstream execution.

## Public Surface
- `ServiceOptions` interface
- `PreparedTaskContext` interface

## Change Intent
The architectural intent is to provide a centralized service layer for preparing and coordinating all analysis engines and infrastructure, ensuring policy compliance and state management. Recent changes suggest enhancements to sync modes and backfill, which may affect orchestration logic.

## Drift Detection
No drift detected. No rule violations found.