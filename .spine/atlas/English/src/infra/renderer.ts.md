<!-- spine-content-hash:3ef7fd12c2311bb5f2e61ed32be25c94a7d18cfad9409d2ce4e1f44509219192 -->
# ArchSpine Documentation Renderer

## Role
Infrastructure utility class and helper functions for generating structured markdown documentation from layout types within the ArchSpine system.

## Key Responsibilities
- Defines the `LayoutType` union type (`'source'`, `'document'`, `'config'`, `'folder'`, `'project'`) for categorizing documentation content.
- Provides the `DocumentationRenderer` class with a static `render` method to convert structured data into formatted markdown documentation.
- Exports `renderStructureList` to join an array of strings into a newline-separated list.
- Exports `renderExtraSections` to concatenate multiple markdown sections with filtering and joining logic.
- Handles text escaping, whitespace normalization, and list/section assembly for consistent documentation output.

## Notable Invariants & Negative Scope
- **Invariant:** Must remain a stable low-level infrastructure facade, not absorbing orchestration or service concerns (per rule `infra-facade-imports`).
- **Invariant:** Public API surface (`DocumentationRenderer`, `renderStructureList`, `renderExtraSections`) should be preferred over deep internal implementation paths by callers.
- **Out of Scope:** Does not handle file I/O or filesystem operations directly (relies on `fs/path` imports only for path resolution in the `render` method).
- **Out of Scope:** Does not implement any business logic or domain-specific content generation.
- **Out of Scope:** Does not manage graph rendering or Mermaid diagram generation (`MermaidGraphConfig` interface is defined but not exported or used in public API).

## Most Important Exported / Externally Visible Behavior
- `LayoutType` (type export)
- `DocumentationRenderer` (class export with static `render` method)
- `renderStructureList` (function export)
- `renderExtraSections` (function export)