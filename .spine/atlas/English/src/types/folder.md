The `src/types/` directory houses the core type definitions and data contracts for the ArchSpine mirror system. It defines all shared interfaces that ensure consistent data structures across mirror units (e.g., `SpineUnit`, `SpineIdentity`), project configuration (`SpineConfig`), language support, synchronization manifests, architectural rules, and version management.  

Notable children are grouped as:  
- **`protocol.ts`** – A public facade module that re‑exports all protocol type definitions from the internal `./protocol/index.js` module, providing a stable, decoupled import path for external consumers.  
- **`view.ts`** – Establishes type contracts for view artifacts in the ArchSpine view generation system, including architecture diagram specifications (nodes, edges, summary cards), public surface view items, and risk hotspot view items.  

The most important implementation areas are the shared data model interfaces, configuration contracts, synchronization protocols, and the view‑artifact schema that together enable consistent mirror behavior and tooling integration.