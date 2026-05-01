import prompts from 'prompts';
import { Config } from '../../infra/config.js';
import {
  VIEW_DEFINITIONS,
  getViewDefinition,
  isViewId,
  normalizeViewIds,
  resolveEnabledViews,
  resolveExperimentalViewLayer,
} from '../../services/view/index.js';
import type { ViewId } from '../../types/view.js';
import { throwCliUsage } from '../cli-utils.js';
import type { RuntimeService } from '../../services/runtime-service.js';
import { withProtectedOutputsWriteAccess } from '../../infra/writer-boundary.js';
import { writeProtectedOutputBaseline } from '../../infra/spine-gate.js';
import type { LLMClient } from '../../infra/llm.js';

export interface ExecuteViewCommandOptions {
  args: string[];
  config: Config;
  rootDir?: string;
  runtimeService?: RuntimeService;
}

function getInitialViewSelection(config: Config): ViewId[] {
  const configured = normalizeViewIds(config.getConfiguredEnabledViews()).known;
  if (resolveExperimentalViewLayer(config).value) {
    return resolveEnabledViews(config).value;
  }
  return configured;
}

export async function promptForEnabledViews(
  currentViews: ViewId[] = [],
): Promise<ViewId[] | undefined> {
  const selectedViews = new Set(currentViews);
  const response = await prompts({
    type: 'multiselect',
    name: 'views',
    message: 'Which experimental views would you like to enable?',
    choices: VIEW_DEFINITIONS.map((definition) => ({
      title: definition.id,
      value: definition.id,
      description: definition.description,
      selected: selectedViews.has(definition.id),
    })),
    min: 0,
    hint: '- Space to select. A to toggle all. Return to submit',
  });

  return response.views as ViewId[] | undefined;
}

function printViewStatus(config: Config): void {
  const experimental = resolveExperimentalViewLayer(config);
  const enabled = resolveEnabledViews(config);
  const configured = config.getConfiguredEnabledViews();
  const effectiveViews = experimental.value ? enabled.value : [];

  console.log(
    `Experimental view layer: ${experimental.value ? 'enabled' : 'disabled'} (${experimental.source})`,
  );
  console.log(
    `Configured views: ${
      configured === undefined
        ? '(default registry set)'
        : configured.length > 0
          ? configured.join(', ')
          : '(explicitly none)'
    }`,
  );
  console.log(
    `Effective views: ${effectiveViews.length > 0 ? effectiveViews.join(', ') : '(none)'}`,
  );
  if (configured === undefined) {
    console.log('Configured views source: default registry set');
  } else {
    console.log('Configured views source: project-config');
  }

  if (enabled.unknown.length > 0) {
    console.log(`Unknown configured views ignored: ${enabled.unknown.join(', ')}`);
  }

  console.log('\nAvailable views:');
  for (const definition of VIEW_DEFINITIONS) {
    console.log(
      `- ${definition.id}: ${definition.description} ` +
        `[default=${definition.defaultEnabled ? 'on' : 'off'}, full-sync=${definition.requiresFullSync ? 'yes' : 'no'}, llm=${definition.requiresLlm ? 'yes' : 'no'}]`,
    );
  }
}

function resolveExplicitSelection(config: Config): ViewId[] {
  return normalizeViewIds(config.getConfiguredEnabledViews()).known;
}

function getMutableSelectionBase(config: Config): ViewId[] {
  if (resolveExperimentalViewLayer(config).value) {
    return resolveEnabledViews(config).value;
  }
  return resolveExplicitSelection(config);
}

export async function executeViewCommand(options: ExecuteViewCommandOptions): Promise<void> {
  const { args, config } = options;
  const subcommand = args[0] || 'show';

  if (subcommand === 'show') {
    printViewStatus(config);
    return;
  }

  if (subcommand === 'set') {
    const selectedViews = await promptForEnabledViews(getInitialViewSelection(config));
    if (!selectedViews) {
      console.log('View update cancelled.');
      return;
    }

    config.setExperimentalViewLayer(true);
    config.setEnabledViews(selectedViews);
    console.log(
      `Updated experimental views: ${selectedViews.length > 0 ? selectedViews.join(', ') : '(none)'}`,
    );
    return;
  }

  if (subcommand === 'enable' || subcommand === 'disable') {
    const rawViewId = args[1];
    if (!rawViewId || !isViewId(rawViewId)) {
      throwCliUsage(
        `Usage: spine view ${subcommand} <${VIEW_DEFINITIONS.map((definition) => definition.id).join('|')}>`,
      );
    }

    const viewId = rawViewId as ViewId;
    const selectedViews = new Set(getMutableSelectionBase(config));

    if (subcommand === 'enable') {
      selectedViews.add(viewId);
      config.setExperimentalViewLayer(true);
      config.setEnabledViews(Array.from(selectedViews));
      console.log(`Enabled view: ${viewId}`);
      return;
    }

    selectedViews.delete(viewId);
    config.setEnabledViews(Array.from(selectedViews));
    console.log(`Disabled view: ${viewId}`);
    return;
  }

  if (subcommand === 'generate') {
    const { rootDir, runtimeService } = options;
    if (!rootDir || !runtimeService) {
      throwCliUsage('Missing rootDir or runtimeService for view generate command.');
      return;
    }

    if (!resolveExperimentalViewLayer(config).value) {
      console.log('Experimental view layer is disabled. Cannot generate views.');
      return;
    }

    const enabledViewsResult = resolveEnabledViews(config);
    if (enabledViewsResult.value.length === 0) {
      console.log('No experimental views are currently enabled.');
      return;
    }

    const { OutputManager } = await import('../../infra/output.js');
    const { defaultRuntimeIO } = await import('../../infra/runtime-io.js');
    const { ViewService } = await import('../../services/view-service.js');

    const outputManager = new OutputManager({ rootDir });

    const needsLlm = enabledViewsResult.value.some((id) => getViewDefinition(id).requiresLlm);
    let llmClient: LLMClient | undefined;
    if (needsLlm) {
      const llmSetup = runtimeService.getResolvedLLMClient();
      if (!llmSetup.llmClient) {
        console.log(
          'An LLM is required to generate one or more of the enabled views, but no valid LLM configuration was found. Please set one up using "spine llm setup".',
        );
        return;
      }
      llmClient = llmSetup.llmClient;
    }

    await withProtectedOutputsWriteAccess(rootDir, async () => {
      const service = new ViewService(rootDir, outputManager, defaultRuntimeIO, llmClient);

      const units = (service as any).loader.getIndexedUnits();
      if (units.length === 0) {
        console.log(
          '❌ No indexed units found in .spine/index/. Please run "spine sync" first to build the semantic mirror.',
        );
        return;
      }

      console.log(`Generating experimental views from ${units.length} indexed units...`);

      for (const invalidViewId of enabledViewsResult.unknown) {
        defaultRuntimeIO.warn(`[View] Ignoring unknown enabled view id "${invalidViewId}".`);
      }

      for (const viewId of enabledViewsResult.value) {
        try {
          switch (viewId) {
            case 'public-surface': {
              service.derivePublicSurfaceView();
              break;
            }
            case 'risk-hotspots': {
              service.deriveRiskHotspotsView();
              break;
            }
            case 'architecture-diagram': {
              const result = await service.deriveArchitectureDiagramView();
              if (!result.generated) {
                defaultRuntimeIO.warn(
                  `[View] architecture-diagram skipped: ${result.reason || 'Unknown reason.'}`,
                );
              }
              break;
            }
            default:
              defaultRuntimeIO.warn(`[View] Unsupported view id "${viewId}".`);
          }
        } catch (e: any) {
          console.error(`❌ Failed to generate view "${viewId}": ${e.message}`);
          // Continue with other views if one fails
        }
      }

      writeProtectedOutputBaseline(rootDir);
      console.log('View generation complete.');
    });
    return;
  }

  if (subcommand === 'describe') {
    const rawViewId = args[1];
    if (!rawViewId || !isViewId(rawViewId)) {
      throwCliUsage(
        `Usage: spine view describe <${VIEW_DEFINITIONS.map((definition) => definition.id).join('|')}>`,
      );
    }

    const definition = getViewDefinition(rawViewId);
    console.log(`${definition.id}`);
    console.log(`Title: ${definition.title}`);
    console.log(`Description: ${definition.description}`);
    console.log(`Requires full build: ${definition.requiresFullSync ? 'yes' : 'no'}`);
    console.log(`Requires LLM: ${definition.requiresLlm ? 'yes' : 'no'}`);
    console.log(`Outputs: ${definition.outputs.join(', ')}`);
    return;
  }

  throwCliUsage('Usage: spine view [show|set|enable|disable|describe|generate]');
}
