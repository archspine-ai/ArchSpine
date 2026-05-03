# Scanner Engine Test Suite

This directory contains the integration test suite for the **ArchSpine Scanner engine**, validating both file discovery and exclusion logic. The tests are designed to run in isolation using temporary directories and synthetic file fixtures.

## Key Child

- **`scanner.test.ts`** — A Vitest-based test suite that:
  - Creates and manages temporary directories for isolated test execution.
  - Generates synthetic file system fixtures (directories and files) to simulate scanning targets.
  - Invokes the Scanner engine with a resolved scan policy to perform file discovery.
  - Asserts that the Scanner correctly includes expected files and excludes ignored patterns.

## Implementation Focus

The most important areas tested here are:
- Correct inclusion of expected files under various directory structures.
- Accurate exclusion of files matching ignored patterns (e.g., `.gitignore` rules, custom exclusions).
- Edge cases around empty directories, deeply nested hierarchies, and symlinks (if applicable).

All tests rely on **Vitest** and are intended to be run as part of the project's continuous integration pipeline, ensuring that changes to the Scanner engine do not break core discovery behavior.