import { CURRENT_CONFIG_SCHEMA_VERSION } from '../../types/protocol.js';
import { DEFAULT_SCAN_POLICY } from '../../core/scan-policy.js';
import { SpineConfig } from './types.js';

export function createDefaultConfig(): SpineConfig {
  return {
    schemaVersion: CURRENT_CONFIG_SCHEMA_VERSION,
    project: {
      name: 'unnamed-project',
    },
    llm: {},
    mcp: {
      contextMode: 'off',
    },
    hooks: {
      preCommit: false,
      syncMode: 'hook',
    },
    artifacts: {},
    scanPolicy: DEFAULT_SCAN_POLICY,
  };
}
