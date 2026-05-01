<!-- spine-content-hash:72189f54203c021f2affa1a1267008d21e5111c81d0229fcb0857ae9fec59df6 -->
# ArchSpine Public API Facade

This module serves as the **single public entry point** for all prompt generation resources used by the ArchSpine mirror system. It aggregates and re-exports symbols from three internal modules: `schemas.js`, `blocks.js`, and `examples.js`.

## Role

Public API facade that centralizes access to JSON schemas, prompt block rendering functions, and example data for source role definitions.

## Key Responsibilities

- **Centralizes exports** of JSON schemas for all ArchSpine document types: source file, document, config, folder, and project.
- **Centralizes exports** of prompt block rendering functions for identity, instructions, context, environment, rule violation checks, git intent, JSON schema, and source content.
- **Centralizes exports** of example data for source role definitions.
- **Provides a single import point** for downstream prompt generation modules, reducing import complexity.

## Notable Invariants

- Exports **only** symbols imported from `./schemas.js`, `./blocks.js`, and `./examples.js`.
- Contains **no business logic or transformations** — it is a pure re-export aggregation point.
- Does **not** implement schema validation, block rendering, runtime configuration, or handle user input or API requests.

## Public Surface (Exported Symbols)

- `sourceFileSchema`, `documentSchema`, `configSchema`, `folderSchema`, `projectSchema`
- `renderIdentityBlock`, `renderInstructionsBlock`, `renderContextBlock`, `renderEnvironmentalContextBlock`, `renderRuleViolationCheckBlock`, `renderGitIntentBlock`, `renderJSONSchemaBlock`, `renderSourceContentBlock`
- `sourceRoleExamples`

## Change Intent

- **Architectural intent:** Consolidate the public interface for prompt generation resources to simplify imports.
- **Recent changes:** No changes detected in this file; the recent commit "restore llm-authored markdown generation" does not affect this facade.

## Drift Detection

- **Drift detected:** No
- **Drift reason:** None