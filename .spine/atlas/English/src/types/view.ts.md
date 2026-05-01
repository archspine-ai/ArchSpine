<!-- spine-content-hash:aca600d4d77395aa025610ffb030fc19f44416a34a072b474a75214480e41e81 -->
# ArchSpine View Artifact Types

This module defines the TypeScript type contract for all view artifacts in the ArchSpine view generation system. It provides the foundational interfaces and type aliases that ensure consistency across view generators and consumers.

## Role

Establishes the strongly-typed schema for view artifact envelopes and their content structures, serving as the stable type foundation for the view generation pipeline.

## Key Responsibilities

- Defines TypeScript interfaces for view artifact envelopes and their content structures
- Provides type aliases for view identifiers (`ViewId`, `ViewType`) and view-specific enumerations
- Establishes the schema for architecture diagram specifications including nodes, edges, and summary cards
- Defines the structure for public surface view items and risk hotspot view items

## Out of Scope

- Implementation of view generation logic
- Serialization or persistence of view artifacts
- Runtime validation of view data

## Invariants

- All view artifact data structures must conform to the defined TypeScript interfaces
- `ViewType` is an alias for `ViewId`, ensuring consistency across the system

## Exported Surface

The following types and interfaces are publicly exported:

- `ViewId`, `ViewType`
- `ViewScoreContribution`
- `ViewArtifactEnvelope`
- `PublicSurfaceViewItem`, `RiskHotspotViewItem`
- `ArchDiagramNode`, `ArchDiagramEdge`, `ArchDiagramSummaryCard`, `ArchDiagramSpec`
- `PublicSurfaceKind`, `ArchNodeType`

## Notable

This file is part of a broader refactoring to split view generators into focused modules. It serves as the stable type foundation for those modules. Note that several exported interfaces do not follow the internal `I` prefix naming convention (e.g., `ViewScoreContribution` instead of `IViewScoreContribution`), which is a known rule violation.