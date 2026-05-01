<!-- spine-content-hash:c1684d50b413689028c9b14b5c9480fb16a9f5f59e8e355cc414f18c4ad3ce6b -->
# ArchSpine – Banner Utility

## Role
CLI presentation utility for rendering branded banners and version information.

## Key Responsibilities
- Reads and caches the project version from `package.json`.
- Renders a full multi-line ASCII art banner with version and subtitle using chalk theming.
- Renders a compact mini banner with stylized 'ArchSpine' branding using chalk theming.

## Notable Invariants
- The version string is cached after first read to avoid repeated file I/O.
- All console output uses chalk for consistent branding colors.

## Negative Scope (Out of Scope)
- Logging non-banner messages to the console.
- Parsing or validating CLI arguments.
- Managing application lifecycle or configuration.

## Most Important Exported Behavior
- `printFullBanner()` – renders the full multi-line banner.
- `printMiniBanner()` – renders the compact mini banner.