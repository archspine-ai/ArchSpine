<!-- spine-content-hash:61a7bb613854e50823c625e15233e616641f1f291d5b27153361faf693117687 -->
# ArchSpine – SpineResources

## Role
Infrastructure facade providing MCP resource templates and handlers for accessing ArchSpine project metadata and files within the `.spine` directory, with context-aware access control via `MCPContextGate`.

## Key Responsibilities
- Exposes URI templates for MCP resources: `spine://project`, `spine://file`, `spine://index`.
- Reads and formats Spine directory files (JSON, Markdown) for MCP resource consumption based on file extensions.
- Enforces context gate access control for resource reads via `MCPContextGate` integration (`requireResourceAccess`, `noteResourceRead`).
- Handles file existence checks and path resolution for `.spine` directory resources.
- Normalizes resource URIs and resolves them to filesystem paths within the `.spine` directory.

## Notable Invariants & Negative Scope
- All resource paths must resolve within the `.spine` directory to prevent directory traversal.
- Access to resources must be gated through `MCPContextGate` when provided.
- Resource URIs must follow the `spine://` scheme.
- Does **not** handle authentication or authorization beyond the `MCPContextGate` interface.
- Does **not** manage or orchestrate higher-level business logic or task execution.
- Does **not** provide write or mutation capabilities for `.spine` resources.

## Most Important Exported / Externally Visible Behavior
- `SpineResources` class
- `SpineResources.getResourceTemplates` – returns the URI templates for MCP resources.
- `SpineResources.readResource` – reads and returns the content of a resource identified by a `spine://` URI, after access control checks.