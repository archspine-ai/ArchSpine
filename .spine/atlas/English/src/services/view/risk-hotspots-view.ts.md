<!-- spine-content-hash:ea197f97af91017b651c1f65f4d19e40a3bfb6310465e574d9e3be099b57ed58 -->
# ArchSpine Risk Hotspot View Generator

## Role
Pure view generator function that calculates architectural risk hotspots from indexed code units.

## Key Responsibilities
- Calculates a composite risk score for each indexed file based on fan-in, fan-out, cross-boundary edges, public surface exposure, semantic drift, rule violations, file size, and missing adjacent tests.
- Filters out suppressed paths and low-scoring units (totalScore < 20).
- Ranks units by total risk score and selects the top 12 hotspots.
- Produces a structured ViewArtifactEnvelope containing risk hotspot items with score breakdowns and confidence metrics.

## Notable Invariants
- The maximum number of risk hotspots returned is capped at `MAX_RISK_HOTSPOTS` (12).
- Only units with `totalScore >= 20` are considered for hotspot ranking.
- Suppressed paths (matching `isSuppressedPath`) are excluded from analysis.
- The function must be a pure computation with no side effects on the input data.

## Negative Scope (Out of Scope)
- Does not handle authentication or authorization of view requests.
- Does not persist or cache risk hotspot results to disk or database.
- Does not provide real-time streaming or incremental updates of risk scores.
- Does not manage user-facing UI rendering or interactive visualization of hotspots.

## Most Important Exported / Externally Visible Behavior
- **`MAX_RISK_HOTSPOTS`** (constant): Caps the number of returned hotspots at 12.
- **`RiskHotspotCandidate`** (interface): Defines the structure of a risk hotspot item.
- **`generateRiskHotspots`** (function): The primary entry point; takes indexed code units and returns a `ViewArtifactEnvelope` containing ranked risk hotspots with score breakdowns and confidence metrics.