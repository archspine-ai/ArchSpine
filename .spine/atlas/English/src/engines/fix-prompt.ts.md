<!-- spine-content-hash:a543bd17f4a1c00f1a90026d6114c9ca788bcfc86afd4e457fa9bdc55c0e6dab -->
# ArchSpine – FixViolation Prompt Generator

## Role
LLM prompt template generator for architectural violation fixes.

## Key Responsibilities
- Defines the `FixViolationContext` data structure that captures all violation context needed to generate a fix prompt.
- Formats violation details and surrounding file context into a structured instructional prompt intended for an LLM assistant.

## Notable Invariants
- Must export the `FixViolationContext` interface for type safety.
- Must export the `generateFixPrompt` function as the primary public API.
- Must remain decoupled from CLI entrypoints and service orchestration, per the engine-independence rule.

## Negative Scope (Out of Scope)
- Does **not** directly fix violations – it only generates prompts for an LLM to do so.
- Does **not** orchestrate the fix application process.
- Does **not** import CLI entrypoints or service-level modules.

## Most Important Exported / Externally Visible Behavior
- **`FixViolationContext`** – interface defining the shape of violation context data.
- **`generateFixPrompt`** – function that takes a `FixViolationContext` and returns a formatted prompt string for an LLM.

## Architectural Intent
Provide a reusable, type-safe prompt generation utility for automated architectural violation remediation via LLM. This module is part of broader hardening of risk hotspots with LLM/DB decoupling, supporting LLM-based fix generation without direct coupling to fix application or orchestration logic.