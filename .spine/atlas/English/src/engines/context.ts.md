<!-- spine-content-hash:387c5a330eacb07a93081dd124c2f42a422cd30e83d8074cd8e4cdb35be89554 -->
# ArchSpine Context Engine

The **Context Engine** is a pure analysis module responsible for architectural context resolution within the ArchSpine mirror system. It resolves relative import paths to absolute file paths, extracts architectural rule keywords from source skeletons, and computes relevance scores for dependency candidates. The engine produces structured diagnostics for dependency candidates, symbol targets, and usage targets, enabling downstream scanners and presentation layers to consume analysis results.

## Key Responsibilities

- Resolve relative import targets to absolute file paths using the project manifest and path resolution utilities.
- Extract architectural rule keywords from source file skeletons to assess relevance.
- Compute relevance scores for dependency candidates based on rule keywords, symbol usage, and target paths.
- Generate diagnostic interfaces for dependency candidates, symbol targets, and usage targets.
- Orchestrate context resolution by aggregating candidate dependencies and producing structured diagnostics.

## Out of Scope

- Direct user interaction or CLI command execution.
- Persistence or network I/O beyond file system path resolution.
- Graph visualization or UI rendering.
- Service lifecycle management or orchestration of other engines.

## Invariants

- Must remain a pure analysis engine without side effects.
- Must depend only on other engine modules, core types, and infrastructure utilities.
- Must export diagnostic interfaces for consumption by scanners or presentation layers.

## Public Surface

- `ContextEngine`
- `RelevanceScoreContribution`
- `DependencyCandidateDiagnostics`
- `SymbolTargetDiagnostics`
- `UsageTargetDiagnostics`
- `ContextResolutionDiagnostics`
- `ContextResolutionResult`
- `ContextResolutionOptions`

## Change Intent

The architectural intent is to provide a reusable, decoupled engine for architectural context resolution, enabling dependency analysis and relevance scoring across the ArchSpine system. Recent changes refactored the system to split scanner and context responsibilities, likely extracting context resolution logic into a dedicated engine module.