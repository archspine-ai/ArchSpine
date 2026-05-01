# ArchSpine Architecture Rule: No Direct Database Import

## Purpose

This document establishes a strict architectural rule that prohibits service and middleware layers from directly importing the underlying database adapter layer. It is part of the ArchSpine governance system to enforce clean domain boundaries.

## Audience

This rule is intended for developers and architects working on the ArchSpine system who need to understand and comply with dependency constraints. The rule applies to all TypeScript source files except those within the database layer itself.

## Key Takeaways

- Direct imports from `src/db/*` are forbidden in application services
- Use service abstractions or repository interfaces instead of direct database access
- Violations are treated as errors with high severity
- The rule exists to decouple business logic from storage implementation details

## Rule Details

**Rule ID:** `no-direct-db-import`

**Severity:** error

**Enforceable:** yes

**Applies to:** All `src/**/*.ts` files except those in `src/db/**`

**Rationale:** Maintain clear domain boundaries and avoid coupling business logic to underlying storage implementations.

## Workflow Impact

This rule anchors the following decisions and workflows:

- **Code Review:** Reviewers must check that service and middleware layers do not import from `src/db/*` directly
- **Architecture Compliance:** Automated enforcement ensures violations are caught during development
- **Refactoring:** Teams must use repository interfaces or service abstractions when accessing data

---