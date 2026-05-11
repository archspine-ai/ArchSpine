import type { SchemaVersion } from './protocol.js';

export type ViewId =
  | 'public-surface'
  | 'risk-hotspots'
  | 'architecture-diagram'
  | 'project-health'
  | 'agent-briefing'
  | 'change-impact';
export type ViewType = ViewId;

export interface IViewScoreContribution {
  factor: string;
  score: number;
  reason: string;
}

export interface IViewQualityMetadata {
  /** Score distribution across selected items */
  scoreRange?: { min: number; median: number; max: number };
  /** Diversity distribution by kind/type/layer */
  diversity?: Record<string, number>;
  /** Total candidates evaluated before filtering */
  totalCandidatesEvaluated?: number;
  /** Selection rate as percentage string */
  selectionRate?: string;
  /** Node/edge counts for diagram views */
  nodeCount?: number;
  edgeCount?: number;
  /** Health counts for health views */
  cycleCount?: number;
  deadCodeCount?: number;
  hubCount?: number;
  violationTypeCount?: number;
}

export interface IViewArtifactEnvelope<TItem> {
  schemaVersion: SchemaVersion;
  generatedAt: string;
  viewType: ViewType;
  summary: string;
  items: TItem[];
  /** Self-check quality metadata. Not part of the view data — introspection for users to gauge trust. */
  _quality?: IViewQualityMetadata;
}

export type PublicSurfaceKind = 'cli' | 'mcp' | 'config' | 'schema' | 'route' | 'public-module';

export interface IPublicSurfaceViewItem {
  id: string;
  entrypoint: string;
  kind: PublicSurfaceKind;
  symbols: string[];
  summary: string;
  confidence: number;
  scoreBreakdown: IViewScoreContribution[];
}

export interface IRiskHotspotViewItem {
  id: string;
  hotspotPath: string;
  riskFactors: string[];
  summary: string;
  impactRadiusHint: string;
  confidence: number;
  totalScore: number;
  scoreBreakdown: IViewScoreContribution[];
}

export type ArchNodeType =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'cloud'
  | 'security'
  | 'messagebus'
  | 'external';

export interface IArchDiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  type: ArchNodeType;
}

export interface IArchDiagramEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface IArchDiagramSummaryCard {
  heading: string;
  points: string[];
}

export interface IArchDiagramSpec {
  title: string;
  subtitle: string;
  nodes: IArchDiagramNode[];
  edges: IArchDiagramEdge[];
  summaryCards: IArchDiagramSummaryCard[];
}
