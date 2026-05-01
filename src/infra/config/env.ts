export const PRE_COMMIT_ENV_VAR = 'SPINE_PRECOMMIT';

export function parseBooleanEnv(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'on', 'yes'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'off', 'no'].includes(normalized)) {
    return false;
  }

  return undefined;
}

export function parsePositiveIntegerEnv(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}
