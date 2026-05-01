<!-- spine-content-hash:cb987528a0b3f54c316ca2d088cfe41e7af3d80a406b7bd54bbd22f86a54df90 -->
# ArchSpine Protocol Schema Validator

## Purpose
This document is a Node.js validation script that ensures all example protocol assets in the ArchSpine system conform to their defined JSON schemas. It acts as a gatekeeper for protocol integrity, catching structural errors before they propagate.

## Context and Audience
Intended for developers and maintainers of the ArchSpine protocol who need to verify that example files (both JSON and Markdown with frontmatter) match the expected schema definitions. The script is run as part of CI or local development workflows.

## Key Responsibilities
- Loads JSON schemas from a schemas directory
- Validates example JSON files against their corresponding schemas
- Handles special case validation for Markdown rule documents with frontmatter
- Reports validation results and exits with appropriate status code

## Key Takeaways
- Automatically loads all .schema.json files from the schemas directory
- Validates a predefined set of example files against their corresponding schemas
- Handles Markdown rule documents by extracting frontmatter and body content
- Exits with code 1 on any validation failure, making it suitable for CI pipelines

## Out of Scope
- Schema generation or authoring
- Runtime enforcement of protocol rules
- User-facing documentation or narrative explanation