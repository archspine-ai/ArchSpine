<!-- spine-content-hash:8d14ac35f76ec2611240e96b799caf7921603ce2b9ff7bf62a7d70b5c9619a4b -->
# `agent-instructions/index.ts` — Barrel Export Module

## Role
This file is a TypeScript barrel export module that provides a unified public API for agent instruction utilities. It acts as the single entry point for consumers who need to import agent instruction functionality.

## Key Responsibilities
- Re-exports all public members from `./agent-instructions.templates.js`
- Re-exports all public members from `./agent-instructions.sync.js`
- Provides a single, stable import path for all agent instruction utilities

## Notable Invariants & Negative Scope
- **Must only contain export statements** — no executable code, no imports, no runtime logic
- Does **not** implement any agent instruction logic
- Does **not** provide configuration or runtime behavior

## Public Surface
All symbols exported from the two underlying modules are re-exported here:
- Everything from `./agent-instructions.templates.js`
- Everything from `./agent-instructions.sync.js`

This barrel file serves as the stable public interface after the underlying sync helpers were refactored and split, ensuring clean imports and proper encapsulation of the agent instruction utility modules.