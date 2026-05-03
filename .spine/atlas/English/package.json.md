# ArchSpine Package Configuration Summary

This `package.json` file is the root manifest for the ArchSpine CLI tool. It defines the project's identity, executable entry points, runtime constraints, automation scripts, and publication rules. Understanding its contents is essential for operators who build, test, deploy, or maintain the ArchSpine system.

## What the Configuration Controls

The manifest establishes the following key aspects:

- **Package Identity & Licensing**: The project is named `archspine` and is released under Apache-2.0. This governs how the package can be used and redistributed.
- **CLI Binary Commands**: The `bin` field maps both `spine` and `archspine` commands to the same compiled entry point (`dist/cli/index.js`). After installation, users can invoke the tool via either command.
- **Node.js Version Enforcement**: The `engines` field restricts runtime to Node.js versions `>=20.18.1 <21` or `>=22`. This prevents accidental use on incompatible Node.js versions (e.g., 19.x, 21.x), which could lead to unexpected failures.
- **Build & Automation Scripts**: A comprehensive set of npm scripts covers building, testing, linting, documentation generation, and release gating. These scripts directly affect CI/CD pipeline stability and local development workflows.
- **Published File Set**: The `files` field limits the npm package to the `dist/` directory (excluding mock files and source maps), `schemas/`, documentation, and governance files (LICENSE, CHANGELOG, etc.). This reduces package size and attack surface.
- **Dependencies (runtime & dev)**: Listing both runtime and development dependencies ensures the tool can operate and can be built/tested. Missing or mismatched versions can break functionality.

## Parameters That Matter Most

| Parameter | Why It Matters |
|-----------|----------------|
| `bin` | If misconfigured, the CLI will not be callable from the terminal. Ensure both `spine` and `archspine` point to the correct compiled file. |
| `engines` | Prevents deployment on untested Node.js versions. Operators must ensure the runtime matches the constraint exactly. Using Node 21.x or an older 18.x before 20.18.1 will fail. |
| `scripts` / `test:ci` | Controls the full CI pipeline: build, unit tests, schema compliance, and e2e tests. A failure here blocks releases. |
| `files` | Determines what gets published to npm. Incorrect patterns may expose source maps or exclude necessary schemas. |
| `dependencies` | Runtime dependencies (e.g., `better-sqlite3`, `chalk`) must be present and compatible. Use `npm ls` to verify the tree. |

## Operational Risks and Stability Concerns

1. **Node Engine Compatibility**: The narrow range (20.18.1–20.x or 22.x) means that using Node 19.x or 21.x will cause immediate failure. Operators upgrading Node must verify the version is within the allowed set.
2. **Bundled Binary Duplication**: Both `spine` and `archspine` point to the same file. This is intentional, but if you rename or move the entry point, both commands break simultaneously.
3. **Script Chain Dependencies**: The `test:ci` script depends on `build` succeeding. If the build step fails (e.g., due to dependency changes), all subsequent tests are skipped, masking issues.
4. **Source Map Exclusion**: The `!dist/**/*.map` pattern excludes source maps from the published package. While this reduces size, debugging production issues becomes harder. Consider keeping source maps in a separate channel if needed.
5. **Missing Type Safety for Scripts**: The scripts reference `.mjs` files that must exist. If these files are deleted or modified, the corresponding npm command will fail. Validate all script paths during CI.
6. **DevDependencies in Production**: `devDependencies` are not included in the published package. If any script mistakenly imports a dev-only package after build, it will fail at runtime.

**Bottom line**: The `package.json` is the single source of truth for the ArchSpine CLI’s runtime contract. Maintain strict version alignment, test the CI pipeline regularly, and review the files list before every publication.