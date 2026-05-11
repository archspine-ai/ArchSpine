import type { RelevanceDiagnosticsMode, ValidatePolicy } from './types.js';

export function parseValidatePolicy(value: string | undefined): ValidatePolicy | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'default' || normalized === 'strict') {
    return normalized;
  }
  return undefined;
}

export function parseRelevanceDiagnosticsMode(
  value: string | undefined,
): RelevanceDiagnosticsMode | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'off' || normalized === 'debug' || normalized === 'diagnostic') {
    return normalized;
  }
  return undefined;
}
