import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';
import { Config } from '../../infra/config.js';
import {
  VIEW_DEFINITIONS,
  getViewDefinition,
  isViewId,
  normalizeViewIds,
  resolveEnabledViews,
  resolveViewLayer,
} from '../../services/view/index.js';
import type { ViewId } from '../../types/view.js';
import { throwCliUsage } from '../cli-utils.js';
import type { RuntimeService } from '../../services/runtime-service.js';
import type { LLMClient } from '../../infra/llm.js';

export interface ExecuteViewCommandOptions {
  args: string[];
  config: Config;
  rootDir?: string;
  runtimeService?: RuntimeService;
}

function getInitialViewSelection(config: Config): ViewId[] {
  const configured = normalizeViewIds(config.getConfiguredEnabledViews()).known;
  if (resolveViewLayer(config).value) {
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
    message: 'Which views would you like to enable?',
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
  const viewLayer = resolveViewLayer(config);
  const enabled = resolveEnabledViews(config);
  const configured = config.getConfiguredEnabledViews();
  const effectiveViews = viewLayer.value ? enabled.value : [];

  console.log(`View layer: ${viewLayer.value ? 'enabled' : 'disabled'} (${viewLayer.source})`);
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
  if (resolveViewLayer(config).value) {
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

    config.setViewLayer(true);
    config.setEnabledViews(selectedViews);
    console.log(`Updated views: ${selectedViews.length > 0 ? selectedViews.join(', ') : '(none)'}`);
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
      config.setViewLayer(true);
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

    if (!resolveViewLayer(config).value) {
      console.log('View layer is disabled. Cannot generate views.');
      return;
    }

    const enabledViewsResult = resolveEnabledViews(config);
    if (enabledViewsResult.value.length === 0) {
      console.log('No views are currently enabled.');
      return;
    }

    const { OutputManager } = await import('../../infra/output.js');
    const { defaultRuntimeIO } = await import('../../infra/runtime-io.js');
    const { ViewService } = await import('../../services/view/view-service.js');

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

    const service = new ViewService(rootDir, outputManager, defaultRuntimeIO, llmClient);

    if (service.getIndexedUnitCount() === 0) {
      console.log(
        '❌ No indexed units found in .spine/index/. Please run "spine sync" first to build the semantic mirror.',
      );
      return;
    }

    console.log(`Generating views from ${service.getIndexedUnitCount()} indexed units...`);

    for (const invalidViewId of enabledViewsResult.unknown) {
      defaultRuntimeIO.warn(`[View] Ignoring unknown enabled view id "${invalidViewId}".`);
    }

    const { failed } = await service.deriveViews(enabledViewsResult.value);
    if (failed.length > 0) {
      console.log(`View generation complete with ${failed.length} failure(s).`);
    } else {
      console.log('View generation complete.');
    }
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

  if (subcommand === 'serve') {
    const { rootDir } = options;
    if (!rootDir) {
      throwCliUsage('Missing rootDir for view serve command.');
      return;
    }

    const spineDir = path.join(rootDir, '.spine');
    if (!fs.existsSync(spineDir)) {
      console.log('❌ .spine/ directory not found. Run "spine init" first.');
      return;
    }

    const portStr = args[1];
    const port = portStr ? parseInt(portStr, 10) : 7899;

    const { startViewServer } = await import('../../services/view/view-server.js');
    startViewServer({ spineDir, port });
    return;
  }

  if (subcommand === 'history') {
    const { rootDir } = options;
    if (!rootDir) {
      throwCliUsage('Missing rootDir for view history command.');
      return;
    }

    const filePath = args[1];
    if (!filePath) {
      throwCliUsage('Usage: spine view history <file_path>');
    }

    const { Manifest } = await import('../../infra/manifest.js');
    const { toArchSpineError, ErrorCodes } = await import('../../core/errors.js');

    try {
      const manifest = Manifest.open(rootDir);
      const limit = 50;
      const events = manifest.getDriftHistory(filePath, limit);

      if (events.length === 0) {
        console.log(`No semantic drift history found for '${filePath}'.`);
        return;
      }

      const currentDocs = manifest.getFileDocs(filePath);
      const currentSemantic = currentDocs?.semantic || { role: 'Unknown', responsibilities: [] };

      console.log(`\nSemantic Drift History for: ${filePath}\n`);

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const newRole = i === 0 ? currentSemantic.role : events[i - 1].previousRole;
        const newResp =
          i === 0 ? currentSemantic.responsibilities || [] : events[i - 1].previousResponsibilities;

        const detectedDate = new Date(event.detectedAt);
        const dateStr = !isNaN(detectedDate.getTime())
          ? detectedDate
              .toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
              .replace(/\//g, '-')
          : event.detectedAt;

        console.log(`🕒 ${dateStr} | ${filePath}`);
        console.log(`   [Drift Reason]: ${event.driftReason}`);

        if (event.previousRole !== newRole) {
          console.log(`   [Role Change]:`);
          console.log(`     - (Before) ${event.previousRole}`);
          console.log(`     + (After)  ${newRole}`);
        }

        console.log(`   [Responsibilities Drift]:`);

        const prevSet = new Set(event.previousResponsibilities);
        const newSet = new Set(newResp);

        let changedResp = false;

        for (const pr of event.previousResponsibilities) {
          if (!newSet.has(pr)) {
            console.log(`     - (Removed) ${pr}`);
            changedResp = true;
          }
        }

        for (const nr of newResp) {
          if (!prevSet.has(nr)) {
            console.log(`     + (Added)   ${nr}`);
            changedResp = true;
          }
        }

        if (!changedResp) {
          console.log(`     (Minor semantic shift, bullet points remained stable)`);
        }

        console.log('');
      }
    } catch (error) {
      throw toArchSpineError(
        error,
        ErrorCodes.CliCommandFailed,
        `Failed to retrieve history for ${filePath}.`,
        { context: { command: 'view history', filePath } },
      );
    }
    return;
  }

  throwCliUsage('Usage: spine view [show|set|enable|disable|describe|generate|serve|history]');
}
