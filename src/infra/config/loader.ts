import * as fs from 'fs';
import { SpineConfig } from './types.js';
import { createDefaultConfig } from './defaults.js';
import { buildConfigParseWarning, validateConfigPayload } from './validation.js';
import { defaultRuntimeIO } from '../runtime-io.js';

export function mergeConfigWithDefaults(
  defaults: Record<string, unknown>,
  overrides: unknown,
): Record<string, unknown> {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    return defaults;
  }

  const result: Record<string, unknown> = {
    ...defaults,
    ...(overrides as Record<string, unknown>),
  };

  for (const [key, value] of Object.entries(defaults as Record<string, unknown>)) {
    const overrideValue = (overrides as Record<string, unknown>)[key];
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      overrideValue &&
      typeof overrideValue === 'object' &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = mergeConfigWithDefaults(value as Record<string, unknown>, overrideValue);
    }
  }

  return result;
}

const MAX_CONFIG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

export function loadConfigData(configPath: string): SpineConfig {
  const defaults = createDefaultConfig();
  if (!fs.existsSync(configPath)) {
    return defaults;
  }

  try {
    const stat = fs.statSync(configPath);
    if (stat.size > MAX_CONFIG_SIZE_BYTES) {
      defaultRuntimeIO.warn(
        buildConfigParseWarning(
          configPath,
          `Config file exceeds ${MAX_CONFIG_SIZE_BYTES / 1024 / 1024}MB limit.`,
        ),
      );
      return defaults;
    }
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const validated = validateConfigPayload(configPath, parsed);
    if (!validated) {
      return defaults;
    }

    const merged = mergeConfigWithDefaults(
      defaults as unknown as Record<string, unknown>,
      validated,
    ) as unknown as SpineConfig;
    return merged;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    defaultRuntimeIO.warn(buildConfigParseWarning(configPath, reason));
    return defaults;
  }
}
