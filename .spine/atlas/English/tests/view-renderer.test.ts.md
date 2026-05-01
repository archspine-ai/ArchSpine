<!-- spine-content-hash:63c4c5a2ae3383e9bd251bbffb55bbd8f9e045e0bcff65e4ffdadfe307b323de -->
# ViewRenderer Unit Tests (Vitest)

This file contains a Vitest unit test suite for the `ViewRenderer` service. Its purpose is to verify that the service deterministically transforms architectural view data into formatted markdown reports for two specific view types: **risk-hotspots** and **public-surface**.

## Key Responsibilities

- Tests `ViewRenderer.renderRiskHotspots` using mock `ViewArtifactEnvelope` data populated with `RiskHotspotViewItem` entries.
- Tests `ViewRenderer.renderPublicSurface` using mock `ViewArtifactEnvelope` data populated with `PublicSurfaceViewItem` entries.
- Validates that the rendered markdown output contains expected summary text and table headers.
- Ensures deterministic table structure by asserting specific regex patterns for row counts and formatting.

## Notable Invariants

- The suite uses the **Vitest** testing framework.
- It relies on the `CURRENT_SCHEMA_VERSION` constant from the protocol types.
- All tests must produce deterministic markdown output.

## Out of Scope

- Testing other view types beyond risk-hotspots and public-surface.
- Testing the underlying data generation or collection processes.
- Integration testing with external systems or live data sources.

## Most Important Exported / Visible Behavior

- `describe` and `it` blocks define the test structure.
- `expect` assertions validate output correctness.
- `ViewRenderer.renderRiskHotspots` and `ViewRenderer.renderPublicSurface` are the primary methods under test.
- `createEnvelope` is a helper function used to construct mock data envelopes.