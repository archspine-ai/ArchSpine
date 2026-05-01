<!-- spine-content-hash:10753b796a194dcb8736c0958b658f70205bd844d32aa0e150ec1e80bdd91ccf -->
# ArchSpine Type Definitions Module

## Role
Core TypeScript type definitions module for the ArchSpine mirror system's data model, defining all interfaces and types for the complete mirror data structure including unit, identity, semantic, skeleton, graph, provenance, folder, and project representations.

## Responsibilities
- Defines the `SpineUnit` interface as the top-level data structure representing a mirrored code unit, composed of identity, semantic, skeleton, graph, and provenance sub-structures.
- Defines the `SpineIdentity` interface capturing the identity of a code unit including file path, content hash, language, file kind, and scope.
- Defines the `SpineSemantic` interface for the semantic analysis results of a code unit.
- Defines the `RuleViolation` and `Invariant` interfaces for architectural rule checking results.
- Defines the `ChangeIntent` interface for tracking the intent behind code changes.
- Defines the `PublicSurfaceEntry` interface for documenting the public API surface of a module.
- Defines the `SpineSkeleton`, `SkeletonImport`, `SkeletonExport`, `DeclaredSymbol`, and `StructuralHints` interfaces for representing the structural skeleton of code units.
- Defines the `ArchSpine`, `FileDependencyEdge`, `SymbolDependencyEdge`, and `EdgeProvenance` interfaces for representing the dependency graph between code units.
- Defines the `SpineProvenance` interface for tracking the origin and processing history of a code unit.
- Defines the `SpineFolderUnit`, `FolderChild`, `SpineProjectUnit`, and `ProjectModule` interfaces for representing folder and project-level mirror structures.
- Defines the `SourceLanguage`, `FileKind`, `SymbolKind`, `DependencyRelation`, `SymbolRelation`, and `PipelineStage` union types for enumerating valid values across the data model.
- Imports the `SchemaVersion` type from `./versions.js` for use in the `SpineUnit.schemaVersion` field.

## Out of Scope
- Implementation logic or runtime behavior for any of the defined interfaces or types.
- Validation or parsing logic for constructing instances of these types.
- Serialization or deserialization of the data model.
- Business logic for generating or consuming the mirror data structures.

## Invariants
- All interfaces must start with the character 'I' as per the interface-prefix rule. (Note: Current file violates this rule — all 16 interfaces lack the 'I' prefix.)

## Public Surface
The module exports the following types and interfaces:
- `SpineUnit`, `SpineIdentity`, `SpineSemantic`, `RuleViolation`, `Invariant`, `ChangeIntent`, `PublicSurfaceEntry`
- `SpineSkeleton`, `SkeletonImport`, `SkeletonExport`, `DeclaredSymbol`, `StructuralHints`
- `ArchSpine`, `FileDependencyEdge`, `SymbolDependencyEdge`, `EdgeProvenance`
- `SpineProvenance`, `SpineFolderUnit`, `FolderChild`, `SpineProjectUnit`, `ProjectModule`
- `SourceLanguage`, `FileKind`, `SymbolKind`, `DependencyRelation`, `SymbolRelation`, `PipelineStage`

## Notable Issues
- **Interface prefix violation**: All 16 interfaces do not follow the `I` prefix convention (e.g., `SpineUnit` instead of `ISpineUnit`).
- **Drift detected**: The module is now a comprehensive type definitions file for the entire ArchSpine data model, far exceeding the originally scoped set of top-level interfaces.