import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../../infra/config.js';
import { promptForExplicitConfirmation } from '../../utils/confirm.js';
import {
  removeArchSpineScripts,
  removeManagedAgentInstructionsFile,
  removeManagedGitAttributesFile,
  removeManagedGitIgnoreFile,
  removeManagedSearchIgnoreFile,
  removeManagedSpineIgnoreFile,
} from '../../utils/agent-instructions.js';
import { uninstallGitHook } from '../../utils/git-hook.js';
import { printStep } from '../cli-utils.js';

export interface ExecuteRemoveCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
}

export async function executeRemoveCommand(options: ExecuteRemoveCommandOptions): Promise<void> {
  const { args, rootDir, config } = options;
  const skipConfirm = args.includes('--yes');

  if (!skipConfirm) {
    const confirmed = await promptForExplicitConfirmation(
      'Remove .spine/ and ArchSpine-managed Git hook state from this repository?',
    );

    if (!confirmed) {
      console.log('Removal cancelled. Re-run with --yes to skip confirmation.');
      return;
    }
  }

  const spineDir = path.join(rootDir, '.spine');
  const hasSpineDir = fs.existsSync(spineDir);
  const hookRemoved = uninstallGitHook();

  const trackedAgentInstructionsFile = config.getAgentInstructionsFile();
  const agentInstructionsCreatedByArchSpine = config.isAgentInstructionsCreatedByArchSpine();
  const gitIgnoreManaged = config.isGitIgnoreManaged() || !hasSpineDir;
  const gitIgnoreCreatedByArchSpine = config.isGitIgnoreCreatedByArchSpine() || !hasSpineDir;
  const gitAttributesManaged = config.isGitAttributesManaged() || !hasSpineDir;
  const gitAttributesCreatedByArchSpine =
    config.isGitAttributesCreatedByArchSpine() || !hasSpineDir;
  const spineIgnoreManaged = config.isSpineIgnoreManaged() || !hasSpineDir;
  const spineIgnoreCreatedByArchSpine = config.isSpineIgnoreCreatedByArchSpine() || !hasSpineDir;
  const searchIgnoreManaged = config.isSearchIgnoreManaged() || !hasSpineDir;
  const searchIgnoreCreatedByArchSpine = config.isSearchIgnoreCreatedByArchSpine() || !hasSpineDir;
  const trackedScripts = config.getInjectedPackageScripts();

  if (trackedAgentInstructionsFile) {
    const agentRemovalResult = removeManagedAgentInstructionsFile(
      rootDir,
      trackedAgentInstructionsFile,
      agentInstructionsCreatedByArchSpine,
    );
    if (agentRemovalResult.status === 'deleted') {
      printStep(`Removed ArchSpine-managed content from ${trackedAgentInstructionsFile}.`);
    } else if (agentRemovalResult.status === 'updated') {
      printStep(`Removed ArchSpine-managed block from ${trackedAgentInstructionsFile}.`);
    }
  }

  if (searchIgnoreManaged) {
    const ignoreRemovalResult = removeManagedSearchIgnoreFile(
      rootDir,
      searchIgnoreCreatedByArchSpine,
    );
    if (ignoreRemovalResult.status === 'deleted') {
      printStep('Removed ArchSpine-managed .ignore state.');
    } else if (ignoreRemovalResult.status === 'updated') {
      printStep('Removed ArchSpine-managed entries from .ignore.');
    }
  }

  if (spineIgnoreManaged) {
    const spineIgnoreRemovalResult = removeManagedSpineIgnoreFile(
      rootDir,
      spineIgnoreCreatedByArchSpine,
    );
    if (spineIgnoreRemovalResult.status === 'deleted') {
      printStep('Removed ArchSpine-managed .spineignore state.');
    } else if (spineIgnoreRemovalResult.status === 'updated') {
      printStep('Removed ArchSpine-managed block from .spineignore.');
    }
  }

  if (gitIgnoreManaged) {
    const gitIgnoreRemovalResult = removeManagedGitIgnoreFile(rootDir, gitIgnoreCreatedByArchSpine);
    if (gitIgnoreRemovalResult.status === 'deleted') {
      printStep('Removed ArchSpine-managed .gitignore state.');
    } else if (gitIgnoreRemovalResult.status === 'updated') {
      printStep('Removed ArchSpine-managed block from .gitignore.');
    }
  }

  if (gitAttributesManaged) {
    const gitAttributesRemovalResult = removeManagedGitAttributesFile(
      rootDir,
      gitAttributesCreatedByArchSpine,
    );
    if (gitAttributesRemovalResult.status === 'deleted') {
      printStep('Removed ArchSpine-managed .gitattributes state.');
    } else if (gitAttributesRemovalResult.status === 'updated') {
      printStep('Removed ArchSpine-managed block from .gitattributes.');
    }
  }

  if (trackedScripts.length > 0) {
    const scriptRemovalResult = removeArchSpineScripts(rootDir, trackedScripts);
    if (scriptRemovalResult.removedScripts.length > 0) {
      printStep(
        `Removed ArchSpine-managed package.json scripts: ${scriptRemovalResult.removedScripts.join(', ')}`,
      );
    }
    if (scriptRemovalResult.skippedScripts.length > 0) {
      console.warn(
        `⚠️  Skipped modified package.json scripts: ${scriptRemovalResult.skippedScripts.join(', ')}`,
      );
    }
  }

  if (hasSpineDir) {
    fs.rmSync(spineDir, { recursive: true, force: true });
    printStep('Removed .spine/ directory.');
  } else {
    printStep('.spine/ directory was already absent.');
  }

  if (hookRemoved) {
    printStep('Removed ArchSpine-managed Git pre-commit hook block.');
  } else {
    console.log('ℹ️  No ArchSpine-managed Git hook block found.');
  }

  printStep('ArchSpine repository initialization state cleared.');
}
