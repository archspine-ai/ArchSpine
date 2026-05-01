<!-- spine-content-hash:5486caab8832c4aae64ec1f16ca05b9f7d50caa2b8a702818ccbfcaeca2ecc4d -->
# ArchSpine Infrastructure Utility Module

## Role
This module provides low-level infrastructure utilities for the ArchSpine mirror system, focusing on content assembly, structured response parsing, and usage merging. It acts as a stable facade for callers who need to process LLM outputs or build context strings without reaching into internal implementation details.

## Key Responsibilities
- **Build Supporting Context**: Assembles context strings for source files by conditionally joining content and context data based on the file kind.
- **Parse Markdown Blocks**: Uses regex patterns to split a full LLM response into localized markdown blocks following the ArchSpine output contract.
- **Extract JSON from Responses**: Extracts and sanitizes the JSON block from LLM responses, handling optional code fence markers and fallback logic.
- **Merge Usage Info**: Combines multiple optional `UsageInfo` objects into a single aggregated object by summing token counts and merging fields.
- **Provide Public Facade**: Exposes a stable public API for response parsing and usage aggregation, discouraging deep internal imports.

## Notable Invariants
- Infrastructure modules must expose stable low-level capabilities and facades, not absorb service, task, or engine orchestration concerns.
- Callers should prefer public infra facades over reaching into deep private implementation paths when a facade exists.

## Negative Scope (Out of Scope)
- Does **not** handle network requests or API calls.
- Does **not** manage file I/O or disk operations.
- Does **not** implement orchestration logic or workflow control.
- Does **not** perform validation of LLM response content beyond structural parsing.

## Public Surface
- `buildSupportingContext(fileKind, content, contextData?)`
- `parseMarkdownBlocks(fullResponse, languages)`
- `parseStructuredResponse(fullResponse, languages, logContext)`
- `mergeUsage(...usages)`

## Drift Detection
A drift has been detected: the previous semantic contract did not include the `mergeUsage` responsibility or the full scope of `parseStructuredResponse`'s JSON extraction logic. This summary reflects the corrected understanding.