<!-- spine-content-hash:60e67016cb0b195cc8963835d3eff1875046190753a005f9569a025144bc3418 -->
# ArchSpine CLI – Package Manifest (`package.json`)

## Role
This file is the **package manifest** for the ArchSpine CLI tool. It defines the project's metadata, entry points, dependencies, and scripts that orchestrate building, testing, and publishing.

## Key Responsibilities
- **CLI binary registration** – Maps the commands `spine` and `archspine` to executable scripts.
- **Entry point resolution** – Specifies the primary module entry (`main`) and module type (`type: "module"`).
- **Build, test, and release pipeline** – Scripts define automation for compilation, linting, testing, documentation, and publishing.
- **Dependency management** – Declares runtime (`dependencies`) and development (`devDependencies`) packages.
- **Distribution control** – The `files` whitelist determines which files are included in the npm package.
- **Licensing** – Apache-2.0 license governs usage and distribution.

## Notable Invariants & Negative Scope
- **Node.js engine must be >=20** – Prevents runtime failures on unsupported platforms.
- **TypeScript compilation must succeed before CLI execution** – The `bin` scripts rely on compiled output.
- **All test suites must pass before release** – Scripts enforce testing and schema validation as mandatory gates.
- **Out of scope** – This file does not handle runtime logic, configuration loading, or user-facing features beyond CLI registration.

## Exported / Externally Visible Behavior
- **`bin` entries** – Exposes `spine` and `archspine` commands to users after installation.
- **`main` entry** – Allows programmatic import of the package (e.g., `require('archspine')`).
- **`scripts`** – Provides `npm run build`, `npm test`, `npm run lint`, `npm run docs`, and `npm run release` as the standard interface for development and CI.

## Stability & Risks
This file is the foundation of the project's build and release pipeline. Misconfiguration (e.g., incorrect `main` or `bin` paths) can break CLI invocation. Engine constraints prevent deployment on incompatible Node versions. The `files` whitelist reduces distribution size but may accidentally exclude necessary assets. Scripts define critical gates (test, schema validation) that enforce quality; skipping them increases risk of shipping broken code. Dependency versions should be pinned or locked to avoid supply-chain issues.