import { SpineConfig as ProtocolSpineConfig } from '../../types/protocol.js';

export type SpineConfig = ProtocolSpineConfig;

export interface BooleanSettingResolution {
  value: boolean;
  source: 'env' | 'config' | 'default';
  envVar?: string;
}

export type HookSyncMode = 'hook';
export type ArtifactStrategy = 'local' | 'distributable';

export type SupportedConfigKey =
  | 'llm.provider'
  | 'llm.model'
  | 'llm.baseURL'
  | 'hooks.preCommit'
  | 'hooks.syncMode'
  | 'artifacts.strategy'
  | 'artifacts.viewLayer'
  | 'artifacts.enabledViews';
