# Naming Convention Rules for ArchSpine

## Purpose
This document establishes mandatory naming conventions for a large monorepo codebase to ensure consistency, readability, and maintainability. It exists to eliminate ambiguity during code reviews and tooling configuration, particularly when distinguishing interfaces from types and classes, and when matching test files with test runners.

## Intended Audience
All developers contributing to the ArchSpine monorepo, especially those writing TypeScript source files or test files. The rules apply equally to new code and refactored code, and should be referenced during code reviews and pull request checklists.

## Key Rules and Decisions

### Interface Naming (Rule: Interface Prefix)
- **Scope:** `src/types/**/*.ts`  
- **Constraint:** Internal interfaces must start with the character 'I' (e.g., `IUserRepository`).  
- **Severity:** Warning  
- **Reason:** This convention visually separates interfaces from types and classes, reducing cognitive load and preventing accidental misuse. It anchors the decision that all interfaces in the types directory must follow this pattern.

### Test File Naming (Rule: Test File Suffix)
- **Scope:** `tests/**`  
- **Constraint:** Test files must end with `.test.ts` or `.spec.ts`.  
- **Severity:** Error  
- **Reason:** Consistency enables test runners (e.g., Jest, Mocha) to automatically discover all test files without manual configuration. Anchors the workflow that new test files must be created with one of these suffixes.

## Workflow Impact
- **Code Reviews:** Reviewers will flag any violation of these rules and require corrections before merging.  
- **Automation:** Linters and CI pipelines enforce these conventions (Warning for interface naming, Error for test file suffixes).  
- **Project Onboarding:** New developers can quickly understand the naming expectations by reading this document.

## What Is Not Covered
Rules for class, function, or variable naming; rules for directories other than `src/types/**` and `tests/**`.

---