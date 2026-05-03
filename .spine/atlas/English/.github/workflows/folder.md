## .github/workflows — CI/CD Workflows

This directory contains all continuous integration and deployment workflow definitions for the ArchSpine project. The workflows here collectively automate code verification, testing, building, linting, and research benchmark execution across multiple Node.js versions on push and pull request events, ensuring code quality and release readiness.

### Notable children and grouping

- **`ci.yml`** — Standard CI pipeline triggered on pushes and pull requests to the main branch. Handles checkout, Node.js setup, dependency installation, linting, building, testing, and package integrity checks. Includes concurrency control and permission settings.

- **`test.yml`** — Multi-version CI workflow that runs code verification across several Node.js versions. Contains a release gate job for quality assurance, a documentation build job, and a package smoke check to verify npm publish readiness.

- **`research.yml`** — Manually triggered workflow (`workflow_dispatch`) for ad-hoc research benchmark execution. Sets up Node.js 20 with npm caching, installs dependencies, and runs the `npm run test:research` benchmark suite.

### Key implementation areas

- **Linting & unit tests** — Enforced on every push/PR via `ci.yml` and `test.yml`.
- **Build & package integrity** — Ensures the project builds and that the npm package is publishable.
- **Node.js version matrix** — `test.yml` tests against multiple Node.js versions to guarantee compatibility.
- **Manual benchmark triggers** — `research.yml` allows on-demand performance evaluation without altering the standard CI flow.