<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".github/workflows","role":"CI/CD workflow definitions for the ArchSpine project.","responsibility":"Automates the continuous integration and delivery pipeline, including linting, building, testing across Node.js versions, research-level test suites, documentation verification, and release readiness checks.","children":[{"filePath":".github/workflows/ci.yml","role":"Defines the automated CI pipeline for the ArchSpine project","fileKind":"document"},{"filePath":".github/workflows/research.yml","role":"CI workflow definition for running research-level test suites","fileKind":"document"},{"filePath":".github/workflows/test.yml","role":"Defines the continuous integration (CI) pipeline for the ArchSpine project, automating verification, testing, documentation building, and release readiness checks.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T07:20:45.763Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
## `.github/workflows`

This directory contains the **CI/CD workflow definitions** for the ArchSpine project.  
Its responsibility is to automate the entire continuous integration and delivery pipeline — from linting, building, and testing across multiple Node.js versions, to running research-level test suites, verifying documentation, and checking release readiness.

The directory currently groups three concrete workflow files:

- **`ci.yml`** – The primary CI pipeline, triggered on pushes and pull requests. It orchestrates the standard verification steps.
- **`research.yml`** – A dedicated workflow for executing research‑specific test suites, which may involve more computationally intensive or exploratory tests.
- **`test.yml`** – Although named generically, this workflow defines the full CI pipeline for the project, including documentation building and release readiness checks. It works in tandem with `ci.yml`.

The most important implementation areas are: ensuring consistent Node.js version coverage, separating research tests from core unit tests, and maintaining documentation accuracy as part of the build verification process.