import { SpineConfig as ProtocolSpineConfig } from '../../types/protocol.js';
import type { LLMMode, PromptPolicyTier, ValidatePolicy } from '../prompt-policy.js';

export type SpineConfig = ProtocolSpineConfig;

export interface BooleanSettingResolution {
  value: boolean;
  source: 'env' | 'config' | 'default';
  envVar?: string;
}

export type HookSyncMode = 'hook' | 'standard' | 'heavy';
export type ArtifactStrategy = 'local' | 'distributable';

export type SupportedConfigKey =
  | 'llm.provider'
  | 'llm.model'
  | 'llm.baseURL'
  | 'llm.mode'
  | 'llm.promptTier'
  | 'llm.validatePolicy'
  | 'hooks.preCommit'
  | 'hooks.syncMode'
  | 'artifacts.strategy'
  | 'artifacts.experimentalViewLayer'
  | 'artifacts.enabledViews'
  | 'initState.artifactStrategy'
  | 'initState.agentInstructionsFile'
  | 'initState.agentInstructionsCreatedByArchSpine'
  | 'initState.gitIgnoreManaged'
  | 'initState.gitIgnoreCreatedByArchSpine'
  | 'initState.gitAttributesManaged'
  | 'initState.gitAttributesCreatedByArchSpine'
  | 'initState.spineIgnoreManaged'
  | 'initState.spineIgnoreCreatedByArchSpine'
  | 'initState.searchIgnoreManaged'
  | 'initState.searchIgnoreCreatedByArchSpine'
  | 'initState.injectedPackageScripts';

export type { PromptPolicyTier, LLMMode, ValidatePolicy };
