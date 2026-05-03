The `src/types/protocol` directory serves as the type foundation for the entire ArchSpine mirror system. It defines the canonical schemas and interfaces that govern all core data structures — covering configuration, documents, languages, manifests, rules, versioning, and views. These contracts ensure data consistency and interoperability across every subsystem.

The notable children are organized into two main areas:

- **`protocol.ts`**: A public facade module that provides a single, stable import path for all protocol types. It re-exports everything from the internal `./protocol/index.js` module, decoupling external consumers from the internal module structure.
- **`view.ts`**: A dedicated type definition module that establishes the contract for view artifacts in the view generation system. It defines TypeScript interfaces for view envelopes, content structures, identifiers (ViewId, ViewType), architecture diagram specifications (nodes, edges, summary cards), and specific view item types (public surface, risk hotspot).

Internally, the `protocol/` subdirectory (accessed via `protocol.ts` and `./protocol/index.js`) groups type definitions for configuration, documents, languages, manifests, rules, and versioning. This modular separation makes the type system both extensible and maintainable.

The most critical implementation areas are: (1) the protocol facade ensuring a stable API surface, (2) the view type contracts that drive the generation of architecture diagrams and risk summaries, and (3) the canonical schemas for rules and manifests that underpin validation and mirroring workflows.