<!-- spine-content-hash:898d7b195e123fc8955e0ef2d9148e9129a48e1ddbadc17c4b1b2b7f35f3b1f8 -->
# ArchSpine Validation Task Orchestrator

## Role
This module serves as the central orchestrator for LLM-powered architectural rule compliance checking within the ArchSpine mirror system. It coordinates the validation of source files against configured architectural rules by leveraging LLM-generated prompts.

## Key Responsibilities
- **Validation Orchestration**: Manages the end-to-end validation of source files against architectural rules using LLM-generated prompts.
- **Prompt Artifact Construction**: Builds prompt artifacts from source files and rule contexts to feed into LLM validation processes.
- **Concurrent Execution**: Executes LLM validation prompts with concurrency control and handles LLM response parsing.
- **Data Normalization**: Normalizes and filters LLM-generated rule violation entries to ensure structured, consistent compliance data.
- **Diagnostics & Recording**: Logs validation diagnostics and records violations to the manifest for traceability.

## Notable Invariants
- Operates strictly as a pipeline stage on top of core task contracts and engines, not as a standalone service.
- Delegates prompt generation and LLM execution to dedicated infrastructure modules rather than handling them directly.
- Outputs structured validation results that are fully compatible with the `RuleViolation` protocol.

## Negative Scope (Out of Scope)
- Does **not** handle CLI command parsing or unrelated service orchestration.
- Does **not** manage direct LLM API communication or token management.
- Does **not** define or store architectural rules; it only consumes them.

## Public Surface
- **`ValidationSummary` interface**: Provides a summary of validation results.
- **`ValidationTaskResult` interface**: Defines the structure of individual validation task outcomes.

## Architectural Intent
Implements a validation stage that uses LLM prompts to check source code against architectural rules, integrating seamlessly with the task execution graph. Recent changes have focused on hardening scan resume validation and fixing fallback paths to improve reliability.