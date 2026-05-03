# ArchSpine CI Workflow Summary

## Purpose

This document defines the continuous integration pipeline for the ArchSpine project. It automates code verification, release readiness checks, documentation building, and packaging validation in response to pushes to the `main` and `master` branches, as well as all pull requests. The pipeline is also triggerable manually via `workflow_dispatch`.

## Audience

This summary is intended for ArchSpine developers and repository maintainers who need to understand the automated CI checks and guarantees. The workflow runs on every push and PR, ensuring that changes meet project quality standards before merge.

## Workflow Overview

The CI pipeline consists of four independent jobs, all running on Ubuntu:

- **Verify (Node 20 & 22):** Installs dependencies, builds the project, runs unit tests, and validates protocol assets. This job uses a matrix strategy across Node.js 20 and 22 to ensure compatibility.
- **Release Gate:** Performs deeper validation on Node.js 20 before a release can proceed. This job acts as a quality gate for release readiness.
- **Docs Build:** Builds the project’s documentation to catch broken references or build errors early.
- **Package Smoke Check:** Packages the project and verifies that the npm publish snapshot is correct, catching packaging issues before publishing.

The pipeline enforces concurrency on a per-ref basis and cancels in-flight runs to avoid wasted resources.

## Key Decisions and Workflows Anchored

- The workflow defines the standard verification path for all code changes.
- The release gate job anchors the decision to proceed with a release; it must pass for release candidates.
- Documentation builds and package smoke checks are mandatory for every PR, ensuring documentation integrity and publish readiness.

## Key Takeaways

- Verifies code on Node.js 20 and 22
- Executes a release gate that performs deeper validation before a release
- Builds documentation to ensure no broken references
- Smoke tests the npm package to catch packaging issues early