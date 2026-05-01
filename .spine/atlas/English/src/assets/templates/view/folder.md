<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/view","role":"This directory contains analysis and documentation files that describe the public surface and risk profile of the ArchSpine project.","responsibility":"Collectively, these files provide a machine-readable and human-readable inventory of all CLI commands, MCP endpoints, and exported module interfaces, alongside a ranked risk analysis of the most critical files in the codebase to support maintenance and review prioritization.","children":[{"filePath":"src/assets/templates/view/public-surface.md","role":"Public API surface inventory and entry point registry","fileKind":"document"},{"filePath":"src/assets/templates/view/risk-hotspots.md","role":"Risk analysis report for the ArchSpine project","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.419Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine – View Templates

This directory holds the analysis and documentation files that define the public surface and risk profile of the ArchSpine project. It serves as both a human-readable reference and a machine-readable inventory for maintainers and reviewers.

## Contents

- **public-surface.md** – A comprehensive inventory of all CLI commands, MCP endpoints, and exported module interfaces. This file acts as the official entry point registry for the project's public API.
- **risk-hotspots.md** – A ranked risk analysis report that identifies the most critical files in the codebase, helping teams prioritize maintenance and review efforts.

## Key Implementation Areas

- **CLI & MCP Surface** – The public-surface document catalogs every command and endpoint, making it easy to audit the project's external contracts.
- **Risk Prioritization** – The risk-hotspots report uses a ranked approach to highlight files with the highest maintenance or security risk, enabling focused code reviews.
- **Dual-Format Utility** – Both documents are designed to be consumed by humans (via Markdown) and AI agents (via JSON), ensuring seamless integration into automated pipelines.

## Notable Submodules

- `public-surface.md` – Entry point registry for all public interfaces.
- `risk-hotspots.md` – Risk analysis report with ranked file priorities.