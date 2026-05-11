import { discoverProjectLanguages } from '../../services/init-service.js';
import type { RuntimeBootstrapOptions } from './types.js';
import { runBuildWorkflow } from '../commands/build.js';

export async function runRuntimeBootstrap(options: RuntimeBootstrapOptions): Promise<void> {
  const {
    rootDir,
    config,
    runtimeService,
    printStep,
    printLanguageDiscovery,
    promptForImmediateConfirmation,
    promptForInitLLMScope,
    promptForLLMSetup,
  } = options;

  const resolvedLlmSettings = runtimeService.getResolvedLLMSettings();
  if (resolvedLlmSettings.provider.value) {
    printStep(
      `Detected existing LLM provider: ${resolvedLlmSettings.provider.value} (${resolvedLlmSettings.provider.source}).`,
    );
    const reconfigureLLM = await promptForImmediateConfirmation('Reconfigure LLM provider now?', {
      skipNewline: true,
    });
    if (reconfigureLLM) {
      process.stdout.write('\n');
      const selectedScope = await promptForInitLLMScope();
      if (selectedScope) {
        await promptForLLMSetup(selectedScope);
      } else {
        printStep('Skipped LLM setup for now.');
      }
    } else {
      process.stdout.write('\n');
    }
  } else {
    console.warn(
      '⚠️  No LLM provider is configured yet. ArchSpine will open LLM setup now because sync, check, and fix depend on it.',
    );
    const selectedScope = await promptForInitLLMScope();
    if (selectedScope) {
      await promptForLLMSetup(selectedScope);
    } else {
      printStep('Skipped LLM setup for now.');
    }
  }

  if (!runtimeService.getResolvedLLMSettings().provider.value) {
    console.warn(
      '⚠️  Warning: no LLM provider configured. Semantic sync, check, and fix will stay unavailable until you run "spine llm setup".',
    );
  }

  console.log('\n🔍 Discovering project languages...');
  const langSnapshot = await discoverProjectLanguages(rootDir, config, runtimeService);
  printLanguageDiscovery(langSnapshot);
}

export async function promptForInitialSync(options: RuntimeBootstrapOptions): Promise<void> {
  const { printStep, promptForImmediateConfirmation } = options;

  console.log('');
  const runInitialSync = await promptForImmediateConfirmation(
    'Would you like to run the initial build now to establish the semantic mirror baseline? (Recommended)',
    { skipNewline: true },
  );

  if (runInitialSync) {
    process.stdout.write('\n');
    console.log('\n🦴 Starting initial build...');
    await runBuildWorkflow(options);
    printStep('Semantic mirror baseline built successfully.');
  } else {
    process.stdout.write('\n');
    console.log("\n💡 You can build the semantic mirror later by running 'spine build'.");
  }
}
