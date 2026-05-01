import type { PartialScanPolicy } from '../../core/scan-policy.js';
import type { SchemaVersion } from './versions.js';

export interface SpineConfig {
  schemaVersion: SchemaVersion;
  project: {
    name: string;
    locales: string[];
  };
  llm: {
    provider?: string;
    model?: string;
    baseURL?: string;
    mode?: 'standard' | 'heavy';
    promptTier?: 'lite' | 'balanced';
    validatePolicy?: 'default' | 'strict';
  };
  mcp?: {
    contextMode?: MCPContextMode;
  };
  hooks?: {
    preCommit?: boolean;
    syncMode?: 'hook' | 'standard' | 'heavy';
  };
  artifacts?: {
    strategy?: 'local' | 'distributable';
    experimentalViewLayer?: boolean;
    enabledViews?: string[];
  };
  initState?: {
    artifactStrategy?: 'local' | 'distributable';
    agentInstructionsFile?: string;
    agentInstructionsCreatedByArchSpine?: boolean;
    gitIgnoreManaged?: boolean;
    gitIgnoreCreatedByArchSpine?: boolean;
    gitAttributesManaged?: boolean;
    gitAttributesCreatedByArchSpine?: boolean;
    spineIgnoreManaged?: boolean;
    spineIgnoreCreatedByArchSpine?: boolean;
    searchIgnoreManaged?: boolean;
    searchIgnoreCreatedByArchSpine?: boolean;
    injectedPackageScripts?: string[];
  };
  scanPolicy?: PartialScanPolicy;
}

export type MCPContextMode = 'off' | 'project-first' | 'search-first';
