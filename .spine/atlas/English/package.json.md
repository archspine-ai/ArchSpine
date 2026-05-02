<!-- spine-content-hash:778005c61f74f6d797b0129c2d47d567e333708e9b047a8ec7feafa2284634c4 -->
# ArchSpine Package Configuration Summary

## Role
This file serves as the central configuration for the ArchSpine npm package. It determines how the tool is installed, executed, built, tested, and published. All metadata, dependencies, and automation pipelines are declared here, making it a critical component of the project's lifecycle management.

## Key Responsibilities
- Declares package identity, version, and licensing (Apache‑2.0).
- Defines executable entry points (`spine` and `archspine` commands).
- Configures build, test, documentation, and release automation scripts.
- Sets Node.js runtime engine requirement (≥20).
- Lists runtime dependencies and dev tooling needed for development and testing.
- Specifies distribution files including compiled output, schemas, and documentation assets.

## Invariants
- Node.js engine must be version 20 or higher to run scripts and installed dependencies.
- The `main` field must point to an existing compiled entry point at `dist/cli/index.js`.
- The `type` field must remain `module` to ensure ES module resolution.
- The `files` array must exclude `__mocks__` directories and source maps from the published package.
- All scripts in the `scripts` block must be executable without manual intervention (e.g., via `npm run`).

## Parameter Definitions
| Parameter | Description |
|-----------|-------------|
| `version` | Specifies the current release version (1.0.2). Used for semantic versioning and dependency resolution; mismatches can cause installation conflicts. |
| `engines` | Requires Node.js ≥20. This constraint ensures compatibility with modern JavaScript features used in the codebase. Violation leads to runtime errors on older Node versions. |
| `scripts` | Defines automation commands for building (`build`), testing (`test`, `test:ci`), documentation (`docs:dev`), and release validation (`release:gate`). Each script is a potential security surface if arbitrary code is injected; the build scripts (`scripts/build.mjs`) should be audited to prevent supply‑chain attacks. |
| `dependencies` | Lists runtime packages such as `@ast-grep/lang-c` and `@ast-grep/lang-cpp`. Version ranges may introduce unintended updates; pinning to exact versions is recommended for stability in production deployments. |

## Stability and Risks
The configuration directly impacts system stability by controlling the build output and dependency tree. The `engines` field enforces a minimum Node version, preventing failures from unsupported APIs. The `scripts` block, especially `build`, `release:gate`, and `validate`, are gatekeepers for quality; misconfiguration could release broken packages. The `files` field reduces package size by omitting tests and source maps, lowering the risk of accidental exposure of internal code. However, the inclusion of dynamic script paths (e.g., `node scripts/release-gate.mjs`) introduces a dependency on external script integrity; compromise of those scripts could affect the full CI/CD pipeline.

## Exported / Public Surface
This file itself does not export any runtime code. Its primary external effect is the definition of the package entry point (`spine` and `archspine`). All other behavior is expressed through npm’s interpretation of the declared fields and scripts.