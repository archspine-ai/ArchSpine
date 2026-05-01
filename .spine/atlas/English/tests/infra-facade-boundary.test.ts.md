<!-- spine-content-hash:7b5b9d28b8e8c2fa2ff4d18a33365eaf6b78aed82fe0b48401d6c207ebb28547 -->
# ArchSpine – Architectural Boundary Test Utility

This module provides a Vitest-based test infrastructure for validating architectural boundary rules through import analysis. It is designed to be used within test suites to enforce layer constraints across a TypeScript codebase.

## Role

Vitest test infrastructure utility for validating architectural boundary rules through import analysis.

## Key Responsibilities

- Recursively collects TypeScript file paths from directories for architectural analysis
- Extracts import statements and their specifiers from TypeScript source files
- Validates import paths against configured boundary rules to enforce architectural layer constraints
- Provides test assertions for architectural integrity verification within Vitest test suites

## Notable Invariants

- All test files must end with `.test.ts` or `.spec.ts` suffix

## Negative Scope (Out of Scope)

- Runtime enforcement of architectural rules in production code
- Code transformation or refactoring of source files
- Static analysis of non-TypeScript files

## Public Surface

- `collectFiles(dirPath, collected)` – Recursively collects TypeScript file paths
- `BoundaryRule` interface – Defines the structure for boundary validation rules
- Import extraction and validation logic – Core analysis functions for import path validation