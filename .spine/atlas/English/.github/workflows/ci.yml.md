# ArchSpine Mirror System CI Workflow Documentation

## Purpose
This document defines the automated continuous integration pipeline for the ArchSpine mirror system. Its goal is to enforce code quality and consistency on the `main` branch, ensuring that every change meets the project’s linting, building, testing, and packaging integrity standards before merging.

## Who Should Read This
This documentation is intended for all developers contributing to the ArchSpine project. It describes the standard CI workflow that runs automatically on every push or pull request targeting the `main` branch. Understanding this workflow helps contributors anticipate the checks their code must pass and debug any CI failures.

## Key Workflow Decisions
- **Trigger scope**: CI runs exclusively for pushes and pull requests to the `main` branch. Other branches and manual triggers are out of scope.
- **Environment**: The pipeline uses Ubuntu latest with Node.js 20 (with npm caching) for consistent and efficient dependency installations.
- **Steps performed**: In sequence, the workflow checks out the repository, installs dependencies (`npm ci`), runs linting (`npm run lint`), builds (`npm run build`), executes tests (`npm test`), and performs a packaging integrity check (`npm run pack:check`).
- **Concurrency**: Duplicate runs for the same workflow and reference are cancelled in progress to conserve resources and avoid redundant checks.

## Anchored Decisions and Workflows
- All code merged into `main` must pass linting, building, testing, and packaging checks. Any failure blocks the merge.
- The environment and dependency setup is standardized across all runs, eliminating platform-specific variations.
- Out-of-scope items (e.g., deployment procedures, non-main branch pipelines, environment-specific configurations) are intentionally excluded to keep the CI focused and fast.

This document serves as the single source of truth for the CI pipeline’s behavior and expectations. Developers should refer to it when interpreting CI results or proposing changes to the workflow.