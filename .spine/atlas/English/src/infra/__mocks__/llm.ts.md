<!-- spine-content-hash:fec64456f50fd4693f75af63e428dada850c91c2bd24bc0b0618ce7d23d59f6c -->
# ArchSpine – MockClient Facade

## Role
This module is an infrastructure facade that publicly re-exports the `MockClient` for LLM provider mocking. It provides a stable, public import surface that insulates callers from internal path changes.

## Key Responsibilities
- Exposes the `MockClient` from the internal `../llm/providers/mock.js` implementation as a stable public export.

## Notable Invariants & Negative Scope
- **Must remain a simple re-export facade** – it should not absorb orchestration logic.
- **Out of scope**: orchestrating service, task, or engine logic; providing concrete LLM provider implementations; managing state or configuration for the mock client.

## Most Important Exported Behavior
- **Public surface**: `MockClient` – callers should import `MockClient` from this facade rather than the deep private path directly.