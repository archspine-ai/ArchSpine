import { Config } from '../../infra/config.js';
import type { ViewId } from '../../types/view.js';
import { getDefaultEnabledViewIds, normalizeViewIds } from './view-registry.js';

export interface ResolvedViewLayer {
  value: boolean;
  source: 'project-config' | 'env' | 'default';
}

export interface ResolvedEnabledViews {
  value: ViewId[];
  source: 'project-config' | 'default';
  unknown: string[];
}

export function resolveViewLayer(config: Pick<Config, 'getViewLayer'>): ResolvedViewLayer {
  const projectValue = config.getViewLayer();
  if (typeof projectValue === 'boolean') {
    return {
      value: projectValue,
      source: 'project-config',
    };
  }

  const envValue = Config.parseBooleanEnv(process.env.SPINE_VIEW_LAYER);
  if (envValue !== undefined) {
    return {
      value: envValue,
      source: 'env',
    };
  }

  return {
    value: false,
    source: 'default',
  };
}

export function resolveEnabledViews(
  config: Pick<Config, 'getConfiguredEnabledViews'>,
): ResolvedEnabledViews {
  const configured = config.getConfiguredEnabledViews();
  if (configured !== undefined) {
    const normalized = normalizeViewIds(configured);
    return {
      value: normalized.known,
      source: 'project-config',
      unknown: normalized.unknown,
    };
  }

  return {
    value: getDefaultEnabledViewIds(),
    source: 'default',
    unknown: [],
  };
}
