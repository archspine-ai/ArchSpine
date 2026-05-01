<!-- spine-content-hash:4bdec71f382e487fcfe963f9682f9674bac417db16fa3136a005001d175169e4 -->
# ArchSpine – Text Utilities Module

## Role
Core utility module providing text trimming and formatting functions for the ArchSpine system.

## Key Responsibilities
- Trims a string to a specified maximum number of lines, adding an ellipsis if truncated.
- Trims a string to a specified maximum character count while attempting to preserve line boundaries.
- Provides text manipulation utilities used by other modules (e.g., for formatting rule blocks, context data).

## Notable Invariants & Negative Scope
- All functions are pure and side-effect free.
- Functions operate only on string inputs and return string outputs.
- No dependencies on infra, service, task, or engine modules.
- Does **not** handle file I/O or data persistence.
- Does **not** implement business logic or orchestration workflows.
- Does **not** interact with external services or APIs.

## Public Surface (Exported Functions)
- `trimLines(value: string, maxLines: number): string`
- `trimTextByChars(value: string, maxChars: number): string`