<!-- spine-content-hash:176f7429f3101af5df6c06ab093d1502114f2ff5824dd8482b082174eef3e2d1 -->
# ArchSpine View Renderer

## Role
The View Renderer is a service module that transforms architectural view artifacts—risk hotspots, CLI entries, MCP entries, module entries, and public surface data—into formatted Markdown reports. It loads templates from the filesystem and applies them to produce consistent, readable documentation output.

## Key Responsibilities
- Load and cache Markdown templates from disk using template names.
- Render risk hotspot views with severity scoring, detail formatting, and Markdown escaping.
- Render CLI command entry views including command descriptions and metadata.
- Render MCP (Model Context Protocol) server entry views with tool and resource listings.
- Render module entry views showing entrypoint, kind, symbols, confidence, and summary.
- Escape Markdown inline symbols to prevent unintended formatting.
- Format confidence scores and kinds for display in Markdown output.

## Notable Invariants
- The module uses filesystem (`fs`, `path`) to load and cache templates from disk.
- Output is always valid Markdown with proper escaping applied.
- All rendering methods are static class methods, one per view artifact type.
- Depends on centralized view types imported from `../../types/view.js`.

## Out of Scope
- Does not fetch or generate the view artifact data itself—relies on imported types.
- Does not serve Markdown over HTTP or other protocols.
- Does not persist rendered output to databases or external systems.
- Does not validate input data schema beyond basic rendering requirements.

## Public Surface
- `ViewRenderer` class
- `ViewRenderer.renderRiskHotspots`
- `ViewRenderer.renderCLIEntries`
- `ViewRenderer.renderMCPEntries`
- `ViewRenderer.renderModuleEntries`
- `ViewRenderer.renderPublicSurface`