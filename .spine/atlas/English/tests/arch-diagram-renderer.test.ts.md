<!-- spine-content-hash:f21ed5085f1408cba3c931df3a4c20d230a9fda03b4cbf29afc70ffea6da79bf -->
# ArchitectureDiagramRenderer Test Suite

## Role
Vitest unit test suite for the ArchitectureDiagramRenderer component.

## Key Responsibilities
- Validates that ArchitectureDiagramRenderer generates SVG output containing expected node labels and structure.
- Tests edge cases such as empty node lists and custom styling overrides.
- Ensures the renderer correctly handles ArchDiagramSpec input and produces deterministic SVG.

## Notable Invariants
- Test files must end with `.test.ts` or `.spec.ts` (rule: test-file-suffix).

## Negative Scope (Out of Scope)
- Integration testing with actual DOM or browser environment.
- Performance benchmarking of SVG generation.
- Testing of other renderers or diagram types.

## Most Important Exported / Externally Visible Behavior
- `describe('ArchitectureDiagramRenderer')` — test suite entry point.
- `it('renders all node labels and structure')` — validates full diagram output.
- `it('handles empty node list')` — validates graceful handling of empty input.