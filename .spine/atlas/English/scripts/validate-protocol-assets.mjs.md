# ArchSpine Protocol Validation Script

## Purpose

This document describes the automated validation script that serves as the quality gate for the ArchSpine mirror system. It ensures that all protocol assets — JSON schemas, example files, and rule documents — conform to their defined contracts. By enforcing structural consistency, the script prevents integration errors and maintains the reliability of the entire ArchSpine ecosystem.

## Audience

This documentation is intended for:

- **Developers** who contribute schemas or example files to the ArchSpine protocol.
- **Maintainers** responsible for reviewing changes and running validation in CI/CD pipelines.
- **DevOps engineers** who integrate this script into automated workflows.

Readers should have familiarity with JSON Schema and basic validation concepts.

## Workflow and Decisions Anchored

The script is executed as part of the development or continuous integration workflow before any schema or example change is merged. Its output determines whether a change is accepted or rejected. Key decisions anchored by this script include:

- Whether new or modified example files correctly implement their corresponding schema.
- Whether Markdown rule documents with frontmatter are structurally valid.
- Whether the entire set of protocol assets remains internally consistent.

## Key Takeaways

- Validates five types of example files (`spine-unit.example.json`, `spine-folder-unit.example.json`, `spine-project-unit.example.json`, `spine-manifest.example.json`, `spine-rule-document.example.json`) against their respective schemas.
- Uses **AJV** with JSON Schema 2020-12 in strict mode, including format validation via `ajv-formats`.
- Handles both pure JSON examples and Markdown files with YAML frontmatter (parsed via `gray-matter`).
- Exits with a non-zero code on any validation failure, making it suitable for automated CI pipelines.

## Behavior Summary

1. **Loads all schemas** from the `schemas/` directory and registers them with AJV.
2. **Maps example files** to their expected schema by filename.
3. **Validates each JSON example** against its schema, reporting success or detailed errors.
4. **Handles Markdown rule documents** by parsing frontmatter and treating the body as a markdown string, then validating the resulting object against the rules schema.
5. **Exits with code 0** if all validations pass, or **code 1** with error count if any fail.

---