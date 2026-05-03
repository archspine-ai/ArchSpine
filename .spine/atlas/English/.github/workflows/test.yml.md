# ArchSpine CI Pipeline Summary

## Purpose
This document defines the continuous integration workflow for the ArchSpine mirror system. It ensures that every push or pull request to the `main` or `master` branches automatically triggers a series of checks: building the project, running unit tests, validating protocol assets, executing a release readiness gate, building documentation, and verifying the npm package structure. The pipeline anchors the core decision that no code enters the mainline without passing these automated gates.

## Audience
Developers and maintainers of the ArchSpine project should consult this document to understand how changes are validated before merging. New contributors can use it to learn the required quality checks and release‑readiness criteria. Operations and release managers rely on the release gate and package smoke check steps to confirm that a snapshot is safe to publish.

## Key Takeaways
- The pipeline triggers on pushes to `main`/`master`, on pull requests, and on manual dispatch.
- Node.js versions 20 and 22 are tested in parallel with a `fail-fast: false` strategy.
- A dedicated release gate job (`npm run release:gate`) ensures the project is ready for a new release.
- The package smoke check (`npm run pack:check`) verifies that the npm publish snapshot is valid before any deployment decision is made.
- Documentation builds are validated separately to maintain consistency across releases.