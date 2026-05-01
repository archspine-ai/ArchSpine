<!-- spine-content-hash:18231edd62f334e91aab6d1cfcce55a2c77689ca3dbbe959cac476d429713d96 -->
# ArchSpine Governance Rule: Database Import Restriction

## Purpose
This document defines a governance rule that prohibits application service and intermediate layers from directly importing from the database adapter layer. Its goal is to enforce clean domain boundaries and prevent business logic from coupling to low-level storage implementations.

## Context & Audience
This rule is intended for all developers working on TypeScript source files under the `src/` directory, excluding the database layer itself. It is relevant during code review, static analysis, and automated linting to ensure architectural compliance.

## Key Takeaways
- Direct imports from `src/db/*` are forbidden in application services.
- Use repository interfaces or service abstractions instead of direct database imports.
- Violations are treated as errors and are enforceable via automated checks.

## Scope & Exclusions
- **In scope:** All TypeScript files under `src/` except those within the database adapter layer.
- **Out of scope:** General project architecture, implementation details of database adapters, and other import or coding rules beyond direct database imports.

## Invariants
None defined.

## Change Intent
No recent architectural or change intent has been recorded for this rule.

## Drift Detection
No drift detected.