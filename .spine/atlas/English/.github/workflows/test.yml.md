<!-- spine-content-hash:38b6a6a201d2cb18f2b269a116d0d782ea3edc524ccedf707b8de92fbf0790f2 -->
# ArchSpine CI Pipeline

## Purpose
This document defines the CI workflow for the ArchSpine project. It ensures that every push or pull request to the main or master branches triggers automated verification steps, including building, unit testing, protocol asset validation, release gate checks, documentation builds, and package smoke tests. The goal is to maintain code quality and release readiness across multiple Node.js versions.

## Context and Audience
This document is intended for developers and maintainers of the ArchSpine project who need to understand the automated checks that run in the CI pipeline. It is also relevant for DevOps engineers managing the repository's continuous integration setup.

## Key Responsibilities
- Automated testing and validation on push/PR to main/master branches
- Multi-version Node.js verification (20, 22)
- Release gate validation
- Documentation build verification
- Package smoke testing for npm publish readiness

## Out of Scope
- Deployment or production release workflows
- Manual testing procedures
- Code quality or linting rules
- Environment-specific configuration

## Key Takeaways
- CI runs on push/PR to main/master and can be triggered manually.
- Verification includes build, unit tests, protocol validation, release gate, docs build, and package smoke check.
- Node.js versions 20 and 22 are tested in parallel.
- The release gate and package smoke check ensure npm publish readiness.