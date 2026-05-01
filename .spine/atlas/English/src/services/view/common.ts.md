<!-- spine-content-hash:db976f85ed4617024f1e31634632f541907bbbf5aabf0377a5cb02ac534471de -->
# ArchSpine – View Utilities Module

## Role
Pure utility module providing scoring and path suppression functions for the view layer.

## Key Responsibilities
- Detect suppressed file paths using regex patterns for test, fixture, example, docs, dist, and build directories.
- Sum scores from a breakdown of view score contributions.
- Calculate confidence scores from total score and support count, with normalization and clamping.

## Notable Invariants & Negative Scope
- All exported functions are pure and side-effect free.
- Path suppression logic uses a fixed regex pattern and does not depend on external configuration.
- Confidence score is clamped between 0 and 0.99.
- This module does **not** handle view rendering, data access, persistence, architecture diagram generation, or risk hotspot analysis.

## Public Surface (Exported Functions)
- `isSuppressedPath(filePath: string): boolean`
- `sumScores(scoreBreakdown: ViewScoreContribution[]): number`
- `toConfidence(totalScore: number, supportCount: number): number`