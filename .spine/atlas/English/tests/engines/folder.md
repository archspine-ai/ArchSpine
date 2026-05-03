This directory contains integration tests for the **Scanner engine**, a core component of ArchSpine responsible for file discovery and policy‑based filtering. The tests verify that the Scanner correctly identifies files to include while respecting ignore patterns, using isolated execution in temporary directories and synthetic file‑system fixtures.

The primary submodule is **`scanner.test.ts`**, a Vitest integration test suite that:
- Creates and manages temporary directories for each test run.
- Generates controlled synthetic fixtures (directories, files) to simulate real scanning targets.
- Invokes the Scanner engine with a resolved scan policy.
- Asserts that expected files are discovered and that files matching ignore patterns are excluded.

This test suite is critical for ensuring the reliability of ArchSpine’s file discovery pipeline. Implementation focus lies in the test’s handling of temporary environments, fixture generation, and deterministic policy application.