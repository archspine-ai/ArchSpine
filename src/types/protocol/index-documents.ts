import type { SchemaVersion } from './versions.js';

export interface SpineUnit {
  readonly schemaVersion: SchemaVersion;
  readonly identity: SpineIdentity;
  readonly semantic: SpineSemantic;
  readonly skeleton: SpineSkeleton;
  readonly graph: ArchSpine;
  readonly provenance: SpineProvenance;
  /** Per-file graph diagnostics written by KnowledgeGraphTask during sync. */
  readonly healthFlags?: HealthFlags;
}

/** Graph-health diagnostics attached to each index entry by KnowledgeGraphTask. */
export interface HealthFlags {
  readonly fanIn: number;
  readonly isHub: boolean;
  readonly hubPercentile: number;
  readonly inCycle: boolean;
  readonly cycleId?: string;
  readonly isDeadCodeSuspect: boolean;
}

export interface SpineIdentity {
  readonly filePath: string;
  readonly contentHash: string;
  readonly skeletonHash?: string;
  readonly semanticHash?: string;
  readonly language: SourceLanguage;
  readonly fileKind: FileKind;
  readonly scope: string;
}

export type SourceLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'c'
  | 'cpp'
  | 'swift'
  | 'php'
  | 'ruby'
  | 'kotlin'
  | 'scala'
  | 'elixir'
  | 'unsupported';

export type FileKind = 'source' | 'config' | 'document' | 'other' | 'folder';

export interface SpineSemantic {
  readonly role: string;
  readonly responsibilities: string[];
  readonly outOfScope: string[];
  readonly invariants: Invariant[];
  readonly changeIntent: ChangeIntent;
  readonly publicSurface: PublicSurfaceEntry[];
  readonly ruleViolations?: RuleViolation[];
  readonly driftDetected?: boolean;
  readonly driftReason?: string | null;
  readonly localized?: Record<string, unknown>;
}

export interface RuleViolation {
  readonly id: string;
  readonly severity: string;
  readonly reason: string;
}

export interface Invariant {
  readonly id: string;
  readonly description: string;
  readonly enforceable: boolean;
}

export interface ChangeIntent {
  readonly architecturalIntent: string | null;
  readonly recentChangeIntent: string | null;
}

export interface PublicSurfaceEntry {
  readonly symbolName: string;
  readonly description: string;
}

export interface SpineSkeleton {
  readonly imports: SkeletonImport[];
  readonly exports: SkeletonExport[];
  readonly declaredSymbols: DeclaredSymbol[];
  readonly structuralHints: StructuralHints;
}

export interface SkeletonImport {
  readonly source: string;
  readonly symbols: string[];
  readonly locality: 'local' | 'external';
}

export interface SkeletonExport {
  readonly name: string;
  readonly kind: SymbolKind;
  readonly signature: string | null;
}

export interface DeclaredSymbol {
  readonly name: string;
  readonly kind: SymbolKind;
  readonly exported: boolean;
  readonly symbolUri: string;
}

export type SymbolKind =
  | 'class'
  | 'function'
  | 'variable'
  | 'interface'
  | 'type'
  | 'enum'
  | 'unknown';

export interface StructuralHints {
  readonly importCount: number;
  readonly exportCount: number;
  readonly isBarrel: boolean;
  readonly isTypeOnly: boolean;
}

export interface ArchSpine {
  readonly dependsOn: FileDependencyEdge[];
  readonly dependedBy: FileDependencyEdge[];
  readonly reverseIndexComplete: boolean;
  readonly symbolEdges: SymbolDependencyEdge[];
}

export interface FileDependencyEdge {
  readonly targetPath: string;
  readonly relation: DependencyRelation;
  readonly edgeProvenance: EdgeProvenance;
  readonly symbols: string[];
}

export type DependencyRelation = 'import' | 'reexport' | 'type-import';

export type EdgeProvenance = 'ast' | 'inferred';

export interface SymbolDependencyEdge {
  readonly sourceSymbol: string;
  readonly targetSymbol: string;
  readonly targetPath: string;
  readonly relation: SymbolRelation;
  readonly edgeProvenance: EdgeProvenance;
}

export type SymbolRelation =
  | 'calls'
  | 'instantiates'
  | 'extends'
  | 'implements'
  | 'references'
  | 'type-references';

export interface SpineProvenance {
  readonly indexedAt: string;
  readonly generatorVersion: string;
  readonly pipelineStages: PipelineStage[];
}

export type PipelineStage = 'ast' | 'llm' | 'lite-ast' | 'lite-llm' | 'fallback';

export interface SpineFolderUnit {
  readonly schemaVersion: SchemaVersion;
  readonly directory: string;
  readonly role: string;
  readonly responsibility: string;
  readonly children: FolderChild[];
  readonly provenance: SpineProvenance;
}

export interface FolderChild {
  readonly filePath: string;
  readonly role: string;
  readonly fileKind: FileKind;
}

export interface SpineProjectUnit {
  readonly schemaVersion: SchemaVersion;
  readonly projectName: string;
  readonly role: string;
  readonly responsibility: string;
  readonly modules: ProjectModule[];
  readonly provenance: SpineProvenance;
}

export interface ProjectModule {
  readonly directory: string;
  readonly role: string;
  readonly childCount: number;
}
