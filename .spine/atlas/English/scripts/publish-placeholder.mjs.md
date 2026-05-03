# ArchSpine Placeholder Publishing Script

## Purpose
This document describes a CI script that automates the placeholder publishing step for the ArchSpine npm package. Its goal is to securely reserve the package name `archspine` on the official npm registry before any real releases begin, preventing another publisher from taking the name.

## Intended Audience
Maintainers and CI pipeline developers working on the ArchSpine project. This script is typically run as a one-time setup before the first real release, or whenever the package name needs to be reserved again.

## Key Decisions and Workflows Anchored by This Document
- The script enforces a strict placeholder version (`0.0.1`) to prevent accidental exposure of real code or version bumps during the reservation step.
- It performs a query against the npm registry to verify the package name is not already taken; if it is, the script fails early, requiring a different package name.
- It runs the project’s release gate (`npm run release:gate`) to ensure quality checks pass before publishing even a placeholder.
- After verification, it publishes the package with `npm publish` to the official registry, completing the reservation.
- The script explicitly refuses to publish if the `package.json` name or version does not match the expected placeholder values, protecting against misconfiguration.

## Key Takeaways
- The placeholder version **must** be `0.0.1`; any other version will cause the script to abort.
- The script checks the live npm registry; it does not rely on local caches.
- Integration with the release gate ensures that the placeholder step is consistent with the project’s overall quality standards.
- The script is a one-shot process meant to be run only once (or when a re-reservation is needed) — it is not part of the normal release pipeline.