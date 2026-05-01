<!-- spine-content-hash:652eab9d47907b6814cce2cf6184de32132f4e74bc292b0ad7d58df78898d35a -->
# ArchSpine – Source Prompt Artifact Orchestrator

## Role
Core orchestration service that assembles source prompt artifacts by coordinating policy resolution, budget calculation, content trimming, and diagnostic generation.

## Key Responsibilities
- Resolves prompt policy tier and validation policy based on task mode and input.
- Calculates token/line budgets for various prompt sections using input parameters.
- Compacts the structural skeleton of the source file to fit within calculated budgets.
- Extracts file header lines from source content.
- Trims dependency context and rule blocks to fit within character budgets.
- Generates diagnostics for dependency selection and rule blocks.

## Notable Invariants & Negative Scope
- Orchestrates multiple specialized modules (policy, budgets, trim, diagnostics) without implementing their logic.
- Outputs a structured `SourcePromptArtifacts` object for downstream consumption.
- Depends solely on imported pure functions and input data.
- **Out of scope:** Direct file I/O or network operations, low-level tokenization or parsing of source code, CLI command handling or user interface rendering, persistent storage or caching of artifacts.

## Most Important Exported Behavior
- **Public surface:** `buildSourcePromptArtifacts` – the single function that encapsulates the entire assembly process, promoting separation of concerns and testability.