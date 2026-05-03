# scripts/ – Automation & Tooling

This directory houses all automation and tooling scripts that support the ArchSpine development lifecycle. Its contents are grouped into several functional areas: build and watch processes, end‑to‑end verification, protocol validation, database schema migration, placeholder publishing, release gate checks, and terminal demo recordings.

Notable subcomponents include:

* **Build scripts** – `build.mjs` compiles TypeScript to JavaScript, copies rules and assets, cleans mock directories, and sets CLI entry‑point permissions. `dev-build.mjs` watches source directories and configuration files, triggers rebuilds on changes, and prevents overlapping builds.
* **Verification scripts** – `final-verify.mjs` performs end‑to‑end ASTExtractor validation across Java, C++, Rust, C, Python, and Go fixtures, covering inheritance, generics, structs, traits, and more. `validate-protocol-assets.mjs` loads JSON schemas, validates example files, and handles Markdown frontmatter.
* **Database schema migration** – `update-db-schema.cjs` manages schema updates for the cache database, ensuring `mtime` and `size` columns are present and safely handling duplicate column additions.
* **Publishing & release gates** – `publish-placeholder.mjs` automates initial npm publishing with metadata validation and collision checks. `release-gate.mjs` orchestrates a sequential pipeline (build, unit tests, schema tests, protocol validation, packaging) and halts on failure.
* **Demo recordings** – `demo.tape` and `project-demo.tape` provide VHS scripts to record terminal demos showing CLI commands like sync, check, and fix.

The most critical implementation areas are build reliability, multi‑language AST validation, and the release gate pipeline that guards deploy quality.