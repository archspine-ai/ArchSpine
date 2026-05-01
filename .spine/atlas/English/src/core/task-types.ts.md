<!-- spine-content-hash:a814574705985da22e3e13bcef2cb71927da66649e69a4f5deb7ca1f2f9ae522 -->
# ArchSpine Pipeline Type Contracts

## Role
Core TypeScript contract definitions for ArchSpine pipeline task state, metrics, and stage boundaries.

## Responsibilities
- Defines statistical interfaces for task processing metrics (`TaskStats`, `TaskStageMetric`).
- Provides state container interfaces for different pipeline concerns (diagnostics, selection, artifacts, telemetry).
- Establishes input/output contracts for pipeline stages (Scan, Extraction, Fix, Commit, ViewDerivation).
- Serves as the central type definition hub for cross-stage data exchange in the ArchSpine system.

## Out of Scope
- Implementation of pipeline logic or business rules.
- CLI command handling or user interaction.
- Concrete data processing or transformation functions.

## Invariants
- Must remain free of CLI or runtime dependencies to preserve pipeline core isolation.
- Defines only TypeScript interfaces and types, no executable code.

## Public Surface
- `TaskStats`
- `TaskStageMetric`
- `TaskDiagnosticsState`
- `TaskSelectionState`
- `TaskArtifactsState`
- `TaskTelemetryState`
- `TaskState`
- `ScanStageInput`
- `ScanStageOutput`
- `ExtractionStageOutput`
- `FixViolation`
- `FixStageInput`
- `FixStageOutput`
- `CommitStageOutput`
- `ViewDerivationStageOutput`