import { BooleanSettingResolution } from './types.js';
import { PRE_COMMIT_ENV_VAR, parseBooleanEnv } from './env.js';

export function resolvePreCommitSetting(preCommit: boolean | undefined): BooleanSettingResolution {
  const envValue = parseBooleanEnv(process.env[PRE_COMMIT_ENV_VAR]);
  if (envValue !== undefined) {
    return {
      value: envValue,
      source: 'env',
      envVar: PRE_COMMIT_ENV_VAR,
    };
  }

  if (typeof preCommit === 'boolean') {
    return {
      value: preCommit,
      source: 'config',
    };
  }

  return {
    value: false,
    source: 'default',
  };
}
