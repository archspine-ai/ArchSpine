<!-- spine-content-hash:f69e3cd6a70d8acd0e476a9c38f2df23a0bcb69dd348a319395275cfab90512f -->
# ArchSpine – Manifest Facade (`index.ts`)

## Role
This file is the **public API entry point (facade)** for the Spine manifest subsystem. It aggregates and re-exports core manifest types and queries, providing a single, stable import path for consumers.

## Key Responsibilities
- Exposes the `Manifest` class and the `hasManifestBaseline` query function as the public surface.
- Decouples consumers from the internal file structure of the manifest implementation module, allowing internal refactoring without breaking external code.

## Notable Invariants & Negative Scope
- **Must only re-export stable symbols** from the underlying facade implementation.
- **Must not contain any inline logic or stateful behavior** – this file is purely a re-export hub.
- **Out of scope:** Implementing manifest logic or business rules; orchestrating services, tasks, or engines; providing direct access to private implementation modules beyond the designated facade.

## Most Important Exported / Externally Visible Behavior
- `Manifest` – the core manifest class.
- `hasManifestBaseline` – a query function to check for a baseline manifest.

This facade establishes a stable public API boundary, reducing churn and isolating consumers from internal refactoring. Recent changes (infra layer refactoring) may split manifest facade state, but this file's role as a stable export point supports that refactor.