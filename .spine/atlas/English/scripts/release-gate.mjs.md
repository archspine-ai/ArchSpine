# ArchSpine Release Gate Script

## Why This Document Exists

This document describes **ArchSpine's automated release gate script** — the final quality checkpoint before any release can be published. It codifies the exact sequence of validations that must pass: build, unit tests, schema tests, protocol validation, and pack check. Without this script, releases would rely on manual, error-prone steps.

## Who Should Read It

- **Developers** who need to run the release gate locally or understand why a release was blocked.
- **Release Managers** who oversee the release pipeline and depend on a repeatable, fail-fast validation process.
- **CI/CD Engineers** who maintain or extend the continuous integration workflow.

## Workflow & Decisions Anchored by This Script

The script defines a **five‑gate pipeline** executed in strict order:

1. **Build** — ensures the project compiles (`npm run build`).
2. **Unit Tests** — runs all unit tests.
3. **Schema Tests** — validates schema changes.
4. **Protocol Validation** — checks protocol invariants.
5. **Pack Check** — verifies package integrity.

If any gate fails, the script exits immediately with a clear error message. This "fail‑fast" design prevents incomplete or broken builds from proceeding to release.

The script is intended to run either:
- As part of a **CI/CD pipeline** on every release candidate.
- **Manually** by a maintainer who wants a pre‑flight check.

## Out of Scope

- Manual release steps (e.g., version bumping, changelog generation).
- Deployment, rollout, or rollback procedures.
- Environmental setup (the script assumes the environment is already configured).

---

**Key Takeaway:** This script acts as the **single source of truth** for what must pass before a release. It is both a documentation artifact and an executable gate.