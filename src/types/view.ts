import type { SchemaVersion } from './protocol.js';

export type ViewId = 'public-surface' | 'risk-hotspots' | 'architecture-diagram';
export type ViewType = ViewId;

export interface ViewScoreContribution {
  factor: string;
  score: number;
  reason: string;
}

export interface ViewArtifactEnvelope<TItem> {
  schemaVersion: SchemaVersion;
  generatedAt: string;
  experimental: true;
  viewType: ViewType;
  summary: string;
  items: TItem[];
}

export type PublicSurfaceKind = 'cli' | 'mcp' | 'config' | 'schema' | 'route' | 'public-module';

export interface PublicSurfaceViewItem {
  id: string;
  entrypoint: string;
  kind: PublicSurfaceKind;
  symbols: string[];
  summary: string;
  confidence: number;
  scoreBreakdown: ViewScoreContribution[];
}

export interface RiskHotspotViewItem {
  id: string;
  hotspotPath: string;
  riskFactors: string[];
  summary: string;
  impactRadiusHint: string;
  confidence: number;
  totalScore: number;
  scoreBreakdown: ViewScoreContribution[];
}

export type ArchNodeType =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'cloud'
  | 'security'
  | 'messagebus'
  | 'external';

export interface ArchDiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  type: ArchNodeType;
}

export interface ArchDiagramEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface ArchDiagramSummaryCard {
  heading: string;
  points: string[];
}

export interface ArchDiagramSpec {
  title: string;
  subtitle: string;
  nodes: ArchDiagramNode[];
  edges: ArchDiagramEdge[];
  summaryCards: ArchDiagramSummaryCard[];
}
