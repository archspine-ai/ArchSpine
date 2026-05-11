import type { SchemaVersion } from './versions.js';

export interface SpineRuleDocument {
  schemaVersion: SchemaVersion;
  ruleId: string;
  title: string;
  summary: string;
  appliesTo: string[];
  severity: 'advisory' | 'warning' | 'error';
  enforceable: boolean;
  rationale?: string | null;
  bodyMarkdown: string;
}
