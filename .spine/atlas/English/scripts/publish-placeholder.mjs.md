# ArchSpine Placeholder Publishing Script

## Why This Document Exists

This document records the script and logic required to publish the initial placeholder version (`0.0.1`) of the ArchSpine package to the official npm registry. It exists to ensure that the first publication is performed safely: the package name is verified not to be already taken, the metadata (name and version) is strictly checked, and a mandatory release gate process is run before the actual publish command executes. Without this document, the team would lack a repeatable, guarded procedure for claiming the package name on npm.

## Who Should Read It

- Developers responsible for initializing the ArchSpine project on npm.
- Anyone performing the first-time publication of the `archspine` package.
- Maintainers who need to understand the constraints placed on the initial publish workflow.

## Key Workflows and Decisions It Anchors

1. **Placeholder Version Assertion** – The script enforces that the `package.json` must contain exactly the name `archspine` and version `0.0.1`. If either value differs, the script fails immediately, preventing accidental publishing of a non‑placeholder version.

2. **Name Collision Prevention** – Before any publish attempt, the script queries the npm registry for an existing package called `archspine`. If a package with that name is already published, the script stops with an error, forcing the team to choose a different name.

3. **Release Gate** – The script runs `npm run release:gate` before publishing. This gate must pass (exit code 0) for the publish to proceed, ensuring that all pre‑release checks (e.g., linting, validation) have been satisfied.

4. **Publish Command** – With all checks passed, the script runs `npm publish` against the official registry. After completion, it prints a verification command for the developer to confirm the package is live.

These steps together define a secure, guarded publication workflow that prevents accidental overwriting of a third‑party package and enforces discipline on the first release of ArchSpine.