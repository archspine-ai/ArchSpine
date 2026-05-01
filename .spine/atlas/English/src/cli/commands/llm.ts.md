<!-- spine-content-hash:2b0247da87d3e2aa96f08d91aacc9d92dbb8fc6de55c250cb272542ab591520b -->
# ArchSpine – LLM Configuration CLI Adapter

## Role
This module is a **CLI command adapter** that provides an interactive workflow for configuring LLM providers, models, and runtime settings. It acts as a thin presentation layer, delegating all persistence and validation to service and infrastructure layers.

## Key Responsibilities
- Presents interactive prompts for selecting an LLM provider, model, base URL, and API key.
- Configures runtime settings such as prompt policy tier, validation policy, lite mode, and experimental split-stage validation.
- Delegates the persistence of LLM configuration and API secrets to the LLM admin service.
- Exports type definitions for LLM configuration writers and command execution options.

## Notable Invariants & Negative Scope
- **Must remain a thin CLI adapter** – it must not absorb pipeline or persistence logic.
- **No direct persistence** – all configuration data is handed off to the LLM admin service.
- **No LLM inference** – this module does not perform completion, streaming, or any runtime execution of LLM calls.
- **No authentication** – API key validation or authorization is outside its scope.
- **Uses the prompts library** for all interactive user input.

## Public Surface
- `LLMConfigWriter` type (a `Pick<Config, ...>` subset)
- Interactive prompt functions for LLM setup

## Architectural Intent
Provide an interactive CLI workflow that keeps the CLI layer clean by delegating persistence and validation to service and infra layers. Recent changes focused on resolving lint errors and finalizing pipeline fixes before v1.0, ensuring the adapter remains properly separated.