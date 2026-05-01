<!-- spine-content-hash:957bf17a0440cdb452c45b03aaa2ec12852c9a861fd633f7483a7b4fca1a611c -->
# ArchSpine – LLM Provider Utilities Unit Tests

## Role
This file is a Vitest unit test suite for the LLM provider utility functions responsible for parsing structured responses and markdown blocks.

## Key Responsibilities
- Verifies that `parseMarkdownBlocks` correctly extracts locale-tagged markdown blocks from raw text.
- Tests `parseMarkdownBlocks` handling of JSON blocks and generic (non-locale) markdown blocks.
- Tests `parseStructuredResponse` for parsing both JSON and markdown content from structured LLM responses.
- Mocks `console.warn` to validate warning behavior when parsing malformed or unexpected responses.

## Notable Invariants
- Uses the Vitest testing framework exclusively (`describe`, `it`, `expect`, `vi`).
- Follows the Arrange-Act-Assert (AAA) pattern within each test case.
- Imports all tested functions from `../src/infra/llm/providers/utils.js`.

## Negative Scope (Out of Scope)
- Does **not** test `buildSupportingContext` or `mergeUsage` functions (imported but unused in the provided skeleton).
- Does **not** cover integration or end-to-end testing of LLM providers.
- Does **not** include performance or load testing.

## Most Important Exported Behavior
The suite ensures that the utility functions correctly parse and extract structured data from LLM responses, including locale-specific markdown blocks, JSON blocks, and generic markdown, while gracefully handling malformed input with appropriate warnings.