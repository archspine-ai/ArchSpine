import { Config, SupportedConfigKey } from '../../infra/config.js';
import { throwCliUsage, parseConfigValue, formatConfigValue } from '../cli-utils.js';

export interface ExecuteConfigCommandOptions {
  args: string[];
  config: Config;
}

function parseSupportedConfigKey(rawKey: string): SupportedConfigKey {
  const supportedKeys: SupportedConfigKey[] = [
    'llm.provider',
    'llm.model',
    'llm.baseURL',
    'llm.mode',
    'llm.promptTier',
    'llm.validatePolicy',
    'hooks.preCommit',
    'hooks.syncMode',
    'artifacts.strategy',
    'artifacts.experimentalViewLayer',
    'artifacts.enabledViews',
    'initState.artifactStrategy',
    'initState.agentInstructionsFile',
    'initState.agentInstructionsCreatedByArchSpine',
    'initState.gitIgnoreManaged',
    'initState.gitIgnoreCreatedByArchSpine',
    'initState.gitAttributesManaged',
    'initState.gitAttributesCreatedByArchSpine',
    'initState.spineIgnoreManaged',
    'initState.spineIgnoreCreatedByArchSpine',
    'initState.searchIgnoreManaged',
    'initState.searchIgnoreCreatedByArchSpine',
    'initState.injectedPackageScripts',
  ];

  if ((supportedKeys as string[]).includes(rawKey)) {
    return rawKey as SupportedConfigKey;
  }

  throwCliUsage(`Unsupported config key '${rawKey}'.`);
}

export async function executeConfigCommand({
  args,
  config,
}: ExecuteConfigCommandOptions): Promise<void> {
  if (args[0] === 'get') {
    const rawKey = args[1];
    if (!rawKey) {
      throwCliUsage('Usage: spine config get <key>');
    }
    const key = parseSupportedConfigKey(rawKey);

    if (key === 'hooks.preCommit') {
      const resolution = config.getPreCommitResolution();
      console.log(formatConfigValue(resolution.value));
    } else if (key === 'hooks.syncMode') {
      console.log(formatConfigValue(config.getHookSyncMode()));
    } else {
      console.log(formatConfigValue(config.getSupportedValue(key)));
    }
  } else if (args[0] === 'set') {
    const rawKey = args[1];
    const rawValue = args[2];
    if (!rawKey || rawValue === undefined) {
      throwCliUsage('Usage: spine config set <key> <value>');
    }
    const key = parseSupportedConfigKey(rawKey);

    config.setSupportedValue(key, parseConfigValue(rawValue));
    console.log(`Updated ${key}.`);
  } else {
    console.log('Usage: spine config <get|set> ...');
  }
}
