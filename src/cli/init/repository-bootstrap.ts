import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';
import { installGitHook } from '../../utils/git-hook.js';
import {
  injectRepositoryPackageScripts,
  installRecommendedRuleTemplates,
  syncAgentInstructionsConfiguration,
  syncManagedRepositoryFiles,
} from '../../services/repository-admin-service.js';
import { normalizeOptionalString, wrapPromptText } from '../cli-utils.js';
import type {
  ArtifactStrategy,
  RepositoryBootstrapOptions,
  RepositoryBootstrapResult,
} from './types.js';

export async function runRepositoryBootstrap(
  options: RepositoryBootstrapOptions,
): Promise<RepositoryBootstrapResult> {
  const {
    rootDir,
    config,
    printStep,
    promptForImmediateConfirmation,
    artifactStrategyArg,
    requestedAgentFile,
    injectPackageScriptsArg,
  } = options;

  const previousStrategy = config.getInitArtifactStrategy() || config.getArtifactStrategy();
  const promptWidth = process.stdout.columns || 80;
  const artifactStrategy: ArtifactStrategy = artifactStrategyArg || 'distributable';

  if (previousStrategy && previousStrategy !== artifactStrategy) {
    printStep(
      `Strategy migration: ${previousStrategy} → ${artifactStrategy}. ` +
        `Managed .gitignore and .gitattributes blocks will be updated to reflect the new strategy.`,
    );
  }

  printStep(`Artifact strategy selected: ${artifactStrategy}.`);

  const installRules = await promptForImmediateConfirmation(
    'Install recommended architectural rule templates? (Layer Isolation, Naming, etc.)',
    { skipNewline: true },
  );

  if (installRules) {
    const ruleInstallResult = installRecommendedRuleTemplates(rootDir);
    if (ruleInstallResult.status === 'installed') {
      printStep('Rule templates installed to .spine/rules/', { inline: true });
    } else {
      process.stdout.write('\n');
      console.warn('⚠️  Could not find template directory. Skipping rule installation.');
    }
  } else {
    process.stdout.write('\n');
  }

  const enableHooks = await promptForImmediateConfirmation(
    'Enable Git pre-commit synchronization? (Highly recommended for automation)',
    { skipNewline: true },
  );
  let hookSetupStatus: RepositoryBootstrapResult['hookSetupStatus'] = enableHooks
    ? 'enabled'
    : 'disabled';

  if (enableHooks) {
    const hookInstallResult = installGitHook();
    if (hookInstallResult.status === 'skipped-no-git-root') {
      hookSetupStatus = 'skipped-no-git-root';
      config.setPreCommitEnabled(false);
      process.stdout.write('\n');
      console.warn(`⚠️  ${hookInstallResult.message}`);
      console.warn(
        '⚠️  ArchSpine initialization will continue, but Git pre-commit synchronization was skipped.',
      );
    } else {
      config.setPreCommitEnabled(true);
      printStep('Git pre-commit hook installed and enabled.', { inline: true });
    }
  } else {
    process.stdout.write('\n');
  }

  const injectAgentInstructions = await promptForImmediateConfirmation(
    'Inject Agent instructions into a repository instructions file?',
    { skipNewline: true },
  );

  if (injectAgentInstructions) {
    const selectedAgentInstructionsFile = requestedAgentFile
      ? requestedAgentFile
      : normalizeOptionalString(
          (
            await prompts({
              type: 'select',
              name: 'filename',
              message: 'Agent instructions filename:',
              choices: [
                { title: 'AGENTS.md', value: 'AGENTS.md' },
                { title: 'CLAUDE.md', value: 'CLAUDE.md' },
                { title: 'GEMINI.md', value: 'GEMINI.md' },
              ],
              initial: 0,
            })
          ).filename,
        );

    if (selectedAgentInstructionsFile) {
      const agentInstructionsResult = syncAgentInstructionsConfiguration(
        rootDir,
        config,
        selectedAgentInstructionsFile,
      );

      if (agentInstructionsResult.status === 'created') {
        printStep(`Created ${selectedAgentInstructionsFile} with ArchSpine agent instructions.`, {
          inline: true,
        });
      } else if (agentInstructionsResult.status === 'appended') {
        printStep(`Appended ArchSpine agent instructions to ${selectedAgentInstructionsFile}.`, {
          inline: true,
        });
      } else if (agentInstructionsResult.status === 'updated') {
        printStep(`Updated ArchSpine agent instructions in ${selectedAgentInstructionsFile}.`, {
          inline: true,
        });
      } else {
        printStep(
          `ArchSpine agent instructions already up to date in ${selectedAgentInstructionsFile}.`,
          { inline: true },
        );
      }
    } else {
      process.stdout.write('\n');
      printStep('Skipped agent instructions file injection.');
    }
  } else {
    process.stdout.write('\n');
  }

  const managedRepositoryFiles = syncManagedRepositoryFiles(rootDir, config, artifactStrategy);
  if (managedRepositoryFiles.spineIgnoreStatus === 'created') {
    printStep('Created .spineignore with recommended semantic ignore defaults.', { inline: true });
  } else if (managedRepositoryFiles.spineIgnoreStatus === 'updated') {
    printStep('Updated ArchSpine-managed semantic ignore defaults in .spineignore.', {
      inline: true,
    });
  } else if (managedRepositoryFiles.spineIgnoreStatus === 'appended') {
    printStep('Appended ArchSpine-managed semantic ignore defaults to .spineignore.', {
      inline: true,
    });
  }

  if (managedRepositoryFiles.searchIgnoreStatus === 'created') {
    printStep('Created .ignore for generated .spine search noise reduction.', { inline: true });
  } else if (managedRepositoryFiles.searchIgnoreStatus === 'updated') {
    printStep('Updated .ignore for generated .spine search noise reduction.', { inline: true });
  }

  if (managedRepositoryFiles.gitIgnoreStatus === 'created') {
    printStep('Created .gitignore with ArchSpine managed Git rules.', { inline: true });
  } else if (managedRepositoryFiles.gitIgnoreStatus === 'updated') {
    printStep('Updated ArchSpine-managed entries in .gitignore.', { inline: true });
  } else if (managedRepositoryFiles.gitIgnoreStatus === 'appended') {
    printStep('Appended ArchSpine-managed block to .gitignore.', { inline: true });
  }

  if (artifactStrategy === 'distributable') {
    if (managedRepositoryFiles.gitAttributesStatus === 'created') {
      printStep('Created .gitattributes with generated snapshot markers.', { inline: true });
    } else if (managedRepositoryFiles.gitAttributesStatus === 'updated') {
      printStep('Updated ArchSpine-managed entries in .gitattributes.', { inline: true });
    } else if (managedRepositoryFiles.gitAttributesStatus === 'appended') {
      printStep('Appended ArchSpine-managed block to .gitattributes.', { inline: true });
    }
  } else if (managedRepositoryFiles.gitAttributesRemovalStatus === 'deleted') {
    printStep('Removed ArchSpine-managed .gitattributes state for local-first strategy.', {
      inline: true,
    });
  } else if (managedRepositoryFiles.gitAttributesRemovalStatus === 'updated') {
    printStep('Removed ArchSpine-managed .gitattributes block for local-first strategy.', {
      inline: true,
    });
  }

  if (fs.existsSync(path.join(rootDir, 'package.json'))) {
    let injectScriptsAnswer = injectPackageScriptsArg;
    if (injectScriptsAnswer === undefined) {
      const injectScriptsPrompt = await prompts({
        type: 'select',
        name: 'injectScripts',
        message: 'Package.json helper scripts:',
        choices: [
          {
            title: 'Skip injection (Recommended)',
            value: false,
            description: wrapPromptText(
              'Keep the repository explicit and zero-install. Developers can still run ArchSpine with npx or a local install.',
              promptWidth,
              4,
            ),
          },
          {
            title: 'Inject npx-based ArchSpine scripts',
            value: true,
            description: wrapPromptText(
              'Add optional spine:* helpers to package.json. They call npx --yes archspine@latest instead of assuming a global spine binary.',
              promptWidth,
              4,
            ),
          },
        ],
        initial: 0,
      });
      injectScriptsAnswer = injectScriptsPrompt.injectScripts === true;
    }

    if (injectScriptsAnswer) {
      const scriptResult = injectRepositoryPackageScripts(rootDir, config);
      if (scriptResult.status === 'updated') {
        printStep(
          `Added npx-based scripts to package.json: ${scriptResult.addedScripts.join(', ')}`,
          { inline: true },
        );
      } else if (scriptResult.status === 'unchanged') {
        printStep(
          'package.json already exposes ArchSpine scripts or intentionally customized helpers.',
          { inline: true },
        );
      } else if (scriptResult.status === 'invalid-package-json') {
        process.stdout.write('\n');
        console.warn('⚠️  package.json is invalid JSON. Skipped script injection.');
      }
    } else {
      if (injectPackageScriptsArg === undefined) {
        process.stdout.write('\n');
      }
      printStep('Skipped package.json helper script injection.', { inline: true });
    }
  }

  return {
    installRules,
    hookSetupStatus,
  };
}
