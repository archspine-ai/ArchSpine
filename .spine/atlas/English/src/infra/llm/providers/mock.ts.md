<!-- spine-content-hash:cfbfbcb89c3acf3452b2b3bab10de2b34a721b1d1514b14ae22a41c08cd01eaa -->
# MockClient – Test Infrastructure Mock LLM Client

## Role
This file provides a mock implementation of the LLMClient interface, designed to simulate LLM provider responses for unit and integration testing. It enables deterministic, repeatable test scenarios without relying on external LLM services.

## Key Responsibilities
- Implements the `LLMClient` interface with mock behavior for deterministic testing.
- Parses rule block data from mock LLM responses to simulate architectural rule validation.
- Detects simulated architectural violations within mock responses, enabling rule engine testing.
- Offers configurable mock responses for testing prompt processing and validation pipelines.

## Notable Invariants & Negative Scope
- **Must** implement the `LLMClient` interface from `../base.js`.
- **Must not** introduce real network calls or external dependencies.
- **Must** support deterministic mock response generation for test reproducibility.
- **Out of scope:** Real LLM provider integration, production-grade prompt processing, persistent state management, or response caching.

## Public Surface (Exported)
- `MockClient` class (exported)
- `constructor(_config: ProviderConfig)`
- `extractRuleBlocks(ruleData?: string): Array<{ id: string; severity: string; body: string }>`
- `detectMockViolations(ruleData: string): Array<{ id: string; severity: string; reason: string }>`