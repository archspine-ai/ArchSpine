<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/atlas/Simplified Chinese/.spine","role":"Root configuration and structural definition directory for the ArchSpine mirror system.","responsibility":"Defines the foundational configuration, structural roles, and architectural rules for the .spine directory, ensuring consistent project mirroring and rule enforcement across the ArchSpine system.","children":[{"filePath":"examples/demo-project/.spine/atlas/Simplified Chinese/.spine/config.json.md","role":"Configuration entry point for the ArchSpine mirror system","fileKind":"document"},{"filePath":"examples/demo-project/.spine/atlas/Simplified Chinese/.spine/folder.md","role":"Define the structural and narrative role of the .spine directory within the ArchSpine project.","fileKind":"document"},{"filePath":"examples/demo-project/.spine/atlas/Simplified Chinese/.spine/rules","role":"Defines the architectural rules and conventions for the ArchSpine mirror system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:34.646Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Root Configuration Directory (`.spine`)

This directory serves as the foundational configuration and structural definition root for the ArchSpine mirror system. It is located inside the Simplified Chinese atlas at `examples/demo-project/.spine/atlas/Simplified Chinese/.spine`. Its primary responsibility is to define the configuration, structural roles, and architectural rules that govern the entire `.spine` mirror, ensuring consistent project mirroring and rule enforcement.

## Notable Children

- **`config.json.md`** – The configuration entry point for the ArchSpine mirror system. This document holds the core settings that dictate mirror behavior.
- **`folder.md`** – Defines the structural and narrative role of the `.spine` directory within the project, explaining its purpose and how it organizes the mirror.
- **`rules/`** – A subfolder that encapsulates all architectural rules and conventions for the ArchSpine mirror system. This is where policies for mirroring and structural constraints are defined.

## Implementation Areas

The most critical implementation areas are the configuration schema (`config.json.md`), the self-description of the `.spine` folder (`folder.md`), and the rule definitions inside the `rules/` submodule. Together, these components establish the governance model for the entire ArchSpine system.