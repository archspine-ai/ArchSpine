<!-- spine-content-hash:39637b04fd19f6be2ab3acb82b0ca29fa589f1019937949a56c6c2bfa043f8a6 -->
# ArchSpine MCP Context Gate Integration Tests

This Vitest integration test suite validates the MCP context gating mechanism in the ArchSpine system. It ensures that resource and tool access is properly restricted based on the initialization state of the MCP context.

## Key Responsibilities

- **Isolated Test Environments**: Creates temporary directories for each test case to simulate realistic project environments without side effects.
- **Context Gating Validation**: Tests `MCPContextGate` behavior to confirm that resources and tools are accessible only when the context is properly initialized.
- **Policy Enforcement**: Verifies that `SpineResources` and `SpineTools` respect the context gating policies defined by `MCPContextGate`.
- **Lifecycle Management**: Uses `beforeEach` and `afterEach` hooks to set up and tear down clean test environments.

## Important Invariants

- This file must be a Vitest test file with a `.test.ts` suffix.
- It must import and test `MCPContextGate`, `SpineResources`, and `SpineTools`.
- Temporary test directories must be managed to avoid side effects between tests.

## Out of Scope

- Production runtime logic for MCP context gating.
- Implementation of the MCP protocol server or client.
- User interface or command-line interaction.

## Architectural Intent

The primary goal is to rigorously test MCP context gating to prevent unauthorized resource or tool access in the ArchSpine system. This test suite is part of the final release preparation (v1.0.0), ensuring stability and coverage.