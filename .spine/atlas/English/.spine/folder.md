# ArchSpine Root Directory

This directory is the root of the ArchSpine mirror system project. It holds project-level configuration and architectural rules that govern the entire mirroring workflow.

## Key Contents

- **`config.json`** – The central project configuration file. It defines:
  - Scanning policy enforcement (how the mirror system traverses source folders).
  - Artifact generation strategy (rules for producing mirrored outputs).
  - Hook management (pre/post hooks for custom logic).
  - Initial state management (agent instructions and ignore files that bootstrap the mirror process).

- **`.spine/rules/`** – A subdirectory containing architectural and naming conventions for the mirror system. It establishes layer-specific constraints following the layered model:
  - **CLI** → **services** → **core** / **tasks** / **engines** → **infrastructure**
  - It enforces consistent naming patterns, such as interface prefixes and test file suffixes, across all modules.

## Implementation Areas

The most important implementation areas are:
- **Scanning policies** – how sources are discovered and filtered.
- **Artifact generation** – how mirrored outputs are structured and written.
- **Hook system** – extensibility points for custom behavior.
- **Layer constraints** – ensuring each layer respects its allowed dependencies and naming rules.

Together, these components form the foundation of the ArchSpine mirror system.