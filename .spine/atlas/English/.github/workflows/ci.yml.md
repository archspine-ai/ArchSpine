# ArchSpine CI Workflow

## Purpose

This document defines the continuous integration (CI) workflow for the ArchSpine repository, powered by GitHub Actions. It serves as the single source of truth for how every code change pushed to the `main` branch (or submitted as a pull request targeting it) is automatically validated before review or merge.

## Audience

- **Project maintainers** who need to ensure the CI pipeline enforces quality gates consistently.
- **Contributors** who want to understand what checks their pull requests must pass and how the pipeline is configured.
- **DevOps/Infrastructure engineers** who may modify or extend the workflow.

## Key Decisions Anchored by This Document

- The CI pipeline runs **only on push/PR to the `main` branch** – no other branches or triggers (e.g., nightly builds) are included.
- **Concurrency control** (`concurrency` group) is configured to automatically cancel any in-progress workflow run for the same branch/ref when a new push is made. This keeps the pipeline efficient and avoids wasted resources.
- **Permissions** are limited to `contents: read` – the workflow cannot push changes, create releases, or modify settings. This follows the principle of least privilege.
- The pipeline uses **Node.js 20** with npm caching, ensuring fast dependency installation.

## Workflow Steps (Summary)

The pipeline executes the following steps in order:

1. **Checkout** – fetches the repository code.
2. **Setup Node.js** – installs Node 20 and caches `node_modules`.
3. **Install dependencies** – runs `npm ci` for reproducible builds.
4. **Lint** – verifies code style and potential errors via `npm run lint`.
5. **Build** – compiles the project with `npm run build`.
6. **Test** – executes unit/integration tests via `npm test`.
7. **Package integrity check** – runs `npm run pack:check` to ensure the package can be packed correctly (commonly verifies `package.json` files and bundling).

## Why This Document Exists

The workflow definition in `.github/workflows/ci.yml` is the exact code that GitHub Actions runs. This document explains the **intent** behind each decision, making it easier for humans to review, maintain, or troubleshoot the pipeline without reading the raw YAML. It also helps contributors understand what happens to their code after they push.

---