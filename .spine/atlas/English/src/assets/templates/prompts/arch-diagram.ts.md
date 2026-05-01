<!-- spine-content-hash:e995858793c70d1bbe156f91dad757c1a2450db6f34a2967cda4e27caddd14c3 -->
# ArchSpine – Architecture Diagram Prompt Template

## Role
This file serves as an **LLM prompt template** that generates structured JSON architecture diagram specifications from project and folder summaries. It is the bridge between raw project metadata and a machine-readable diagram definition.

## Key Responsibilities
- Defines the **JSON schema** for architecture diagram specifications.
- Constructs **LLM prompt instructions** that guide the model to produce valid diagram output.
- Formats **project and folder summary context** into a digestible input for diagram generation.
- Enforces strict constraints on node types, edge references, and summary card structure.

## Notable Invariants & Negative Scope
- **Output must be pure JSON** – no Markdown, HTML, SVG, or code fences allowed.
- **Node types are restricted** to: `frontend`, `backend`, `database`, `cloud`, `security`, `messagebus`, `external`.
- **Every edge must reference an existing node ID** – no dangling references.
- **Exactly three summary cards** are required, with headings: `Core Modules`, `Key Dependencies`, `System Boundaries`.
- **Out of scope**: This file does **not** render visual diagrams (SVG, Mermaid, etc.), execute LLM calls, or persist generated specifications.

## Public Surface (Exported Behavior)
- `archDiagramSchema` – a constant string containing the JSON schema.
- `renderContextBlock` – formats project/folder context for the prompt.
- `renderInstructionsBlock` – builds the instruction section of the prompt.
- `renderJSONSchemaBlock` – injects the schema definition into the prompt.

## Architectural Intent
The template is designed to be **deterministic** – given the same project summary, it should always produce the same diagram specification structure. This aligns with the recent change to add deterministic rendering assets for view generation.