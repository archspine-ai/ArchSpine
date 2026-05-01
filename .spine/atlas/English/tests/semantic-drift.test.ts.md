<!-- spine-content-hash:fcc5cb1d66cc82bc8600be18a14750168e79810d1e891bdef8980212d74f761f -->
# ArchSpine Semantic Drift Integration Test Suite

This file is a **Vitest integration test suite** for the ArchSpine sync system. Its primary purpose is to verify that the system correctly detects and handles **semantic drift** — changes in meaning or intent across sync passes — by tracking how `PreviousSemanticContext` is passed through the pipeline.

## Key Responsibilities

- **Mocks the LLM client** using `DriftMockClient` to simulate and observe how `PreviousSemanticContext` is consumed across multiple sync passes.
- **Manages temporary test directories**: creates isolated environments for each test and cleans them up afterward.
- **Executes CLI commands** via `execSync` to simulate real-world sync operations in a controlled, isolated manner.
- **Validates SyncService behavior** specifically around semantic drift scenarios, ensuring the service correctly propagates context and detects drift when it occurs.

## Notable Invariants & Negative Scope

- **Invariant**: All test files must use the `.test.ts` or `.spec.ts` suffix (enforced by the `test-file-suffix` rule).
- **Out of scope**: This suite does **not** perform unit tests of individual `SyncService` methods in isolation. It does **not** test production LLM client implementations (e.g., OpenAI, Anthropic). It also does **not** cover performance or load testing of the sync system.

## Exported / Public Surface

- **`DriftMockClient`** class — the mock LLM client used to track semantic context.
- **`generateSummary`** method — likely the primary entry point for triggering summary generation in tests.

## Change Intent

The architectural intent is to provide a **test harness** that ensures the ArchSpine sync pipeline correctly handles semantic drift by passing `PreviousSemanticContext` across passes. The most recent changes resolved lint errors and finalized pipeline fixes ahead of the v1.0 release.