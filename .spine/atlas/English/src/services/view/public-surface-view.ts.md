<!-- spine-content-hash:6b18338d76ef52249ce12731072fcacbac600b3b4dbf3583dcca7a3884eebec6 -->
# ArchSpine – View Generation Scoring Engine

## Role
This module is a scoring engine that ranks source files by their likelihood of being part of the public API surface. It is used during view generation to identify which files should be exposed as public interfaces.

## Key Responsibilities
- Applies a multi-factor scoring algorithm to classify and rank files as public surface candidates.
- Filters out suppressed paths and low-scoring candidates based on configurable thresholds.
- Computes scores based on semantic public surface declarations, export counts, internal consumers, and re-export amplification.
- Applies bonuses for specific surface kinds (CLI, MCP, config, route) and penalties for type-only files.
- Limits the ranked output to a maximum number of items (`MAX_PUBLIC_SURFACE_ITEMS`).

## Notable Invariants
- Operates on loaded `SpineUnit` data structures.
- Output is a sorted, filtered list of `ScoredCandidate` objects.
- Scoring is deterministic based on configurable factors and thresholds.

## Out of Scope
- Direct HTTP or network communication
- User interface rendering
- Persistence or database operations
- Runtime service orchestration (it is a pure scoring engine)

## Exported Behavior
The primary exported behavior is a function or class that accepts a collection of `SpineUnit` objects and configuration parameters, and returns a ranked list of `ScoredCandidate` objects representing the most likely public API surface files.