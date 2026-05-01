<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/core/compat","role":"This directory contains the core L2 aggregation logic for the ArchSpine mirror system.","responsibility":"It orchestrates data collection from multiple L1 sources, performs validation and deduplication, and constructs the canonical L2 state for the mirror network.","children":[],"provenance":{"indexedAt":"2026-04-18T15:36:29.340Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine – `src/core/compat` Directory Summary

This directory houses the core L2 aggregation logic for the ArchSpine mirror system. Its primary responsibility is to orchestrate data collection from multiple L1 sources, perform validation and deduplication, and construct the canonical L2 state for the mirror network.

The directory currently contains no submodules or children, indicating that the aggregation logic is implemented directly within files at this level. Key implementation areas include:

- **L1 data ingestion** – collecting raw data from upstream sources
- **Validation & deduplication** – ensuring data integrity and removing duplicates
- **L2 state construction** – building the authoritative mirror state

As the project evolves, this directory is expected to grow with concrete submodules for each aggregation stage.