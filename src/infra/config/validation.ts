import { CURRENT_CONFIG_SCHEMA_VERSION } from '../../types/protocol.js';
import { ErrorCodes } from '../../core/errors.js';
import { resolveSpineConfig } from '../../core/config-schema.js';
import { SpineConfig } from './types.js';

export function validateConfigPayload(configPath: string, payload: unknown): SpineConfig | null {
  const validation = resolveSpineConfig(payload);
  if (!validation.config) {
    // eslint-disable-next-line no-console -- Warn on config validation failure
    console.warn(buildConfigValidationWarning(configPath, validation.issues));
    return null;
  }

  const config = validation.config as SpineConfig;
  config.schemaVersion = CURRENT_CONFIG_SCHEMA_VERSION;
  return config;
}

export function buildConfigValidationWarning(configPath: string, issues: string[]): string {
  return (
    `[${ErrorCodes.ConfigParseFailed}] Failed to validate ${configPath}. ` +
    `Falling back to defaults for this run. Please fix or recreate the file (for example: run 'spine init'). ` +
    `Issues: ${issues.join('; ')}`
  );
}

export function buildConfigParseWarning(configPath: string, reason: string): string {
  return (
    `[${ErrorCodes.ConfigParseFailed}] Failed to parse ${configPath}. ` +
    `Falling back to defaults for this run. Please fix or recreate the file (for example: run 'spine init'). ` +
    `Reason: ${reason}`
  );
}
