# Protocol Schema Validator

## Purpose

This script serves as a build‑time gate to ensure all protocol schema definitions and their example files are syntactically and semantically valid. It prevents accidental drift between the formal specification (schemas) and the illustrative examples that document them.

## Context and Audience

Developers and release managers working on the ArchSpine project. The script runs in CI and locally when schemas or examples are modified. Anyone making changes to `schemas/` or `schemas/examples/` should be familiar with this validation step.

## Key Takeaways

- Enforces strict schema conformance using AJV with all errors enabled.
- Covers both JSON example files and Markdown rule documents with front matter.
- Used as a pre‑merge gate to maintain protocol integrity.
- Fails the build if any asset is invalid, outputting detailed error messages.
- Supports maintainers by making schema‑example mismatches visible immediately.