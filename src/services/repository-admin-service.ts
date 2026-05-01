import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Config } from '../infra/config.js';
import {
  listTrackedSnapshotFiles,
  managedBlockIncludesAll,
  readManagedFileBlock,
  snapshotOutputsPresent,
} from '../infra/repository-artifacts.js';
import {
  injectArchSpineScripts,
  removeManagedGitAttributesFile,
  syncAgentInstructionsFile,
  syncGitAttributesFile,
  syncGitIgnoreFile,
  syncSearchIgnoreFile,
  syncSpineIgnoreFile,
  type AgentInstructionsSyncStatus,
  type GitAttributesRemovalStatus,
  type GitAttributesSyncStatus,
  type GitIgnoreSyncStatus,
  type PackageScriptStatus,
  type SearchIgnoreSyncStatus,
  type SpineIgnoreSyncStatus,
} from '../utils/agent-instructions.js';
import {
  DISTRIBUTABLE_GITATTRIBUTES_LINES,
  GITATTRIBUTES_BLOCK_END,
  GITATTRIBUTES_BLOCK_START,
  GITIGNORE_BLOCK_END,
  GITIGNORE_BLOCK_START,
  type ArtifactStrategy,
} from '../utils/agent-instructions.templates.js';

const GITIGNORE_MARKERS = {
  start: GITIGNORE_BLOCK_START,
  end: GITIGNORE_BLOCK_END,
} as const;

const GITATTRIBUTES_MARKERS = {
  start: GITATTRIBUTES_BLOCK_START,
  end: GITATTRIBUTES_BLOCK_END,
} as const;

export interface RepositoryStrategyCheckResult {
  strategy: ArtifactStrategy | undefined;
  issues: string[];
}

export interface RepositoryStrategyApplyResult {
  previousStrategy?: ArtifactStrategy;
  sameStrategy: boolean;
  gitIgnoreStatus: GitIgnoreSyncStatus;
  gitAttributesStatus?: GitAttributesSyncStatus;
  gitAttributesRemovalStatus?: GitAttributesRemovalStatus;
  snapshotOutputsPresent: boolean;
  trackedSnapshotFiles: string[];
}

export interface RuleTemplateInstallResult {
  status: 'installed' | 'missing-template-dir';
  copiedFiles: string[];
}

export interface AgentInstructionsSyncResult {
  status: AgentInstructionsSyncStatus;
  selectedFile: string;
}

export interface ManagedRepositoryFilesResult {
  spineIgnoreStatus: SpineIgnoreSyncStatus;
  searchIgnoreStatus: SearchIgnoreSyncStatus;
  gitIgnoreStatus: GitIgnoreSyncStatus;
  gitAttributesStatus?: GitAttributesSyncStatus;
  gitAttributesRemovalStatus?: GitAttributesRemovalStatus;
}

export interface InjectPackageScriptsResult {
  status: PackageScriptStatus;
  addedScripts: string[];
}

export function checkRepositoryStrategy(
  rootDir: string,
  config: Config,
): RepositoryStrategyCheckResult {
  const strategy = config.getArtifactStrategy() || config.getInitArtifactStrategy();
  if (!strategy) {
    return { strategy: undefined, issues: [] };
  }

  const gitignorePath = path.join(rootDir, '.gitignore');
  const gitattributesPath = path.join(rootDir, '.gitattributes');
  const gitignoreBlock = readManagedFileBlock(gitignorePath, GITIGNORE_MARKERS);
  const gitattributesBlock = readManagedFileBlock(gitattributesPath, GITATTRIBUTES_MARKERS);
  const issues: string[] = [];

  if (strategy === 'local') {
    if (gitignoreBlock === null) {
      issues.push('.gitignore is missing the ArchSpine managed block entirely.');
    } else if (!managedBlockIncludesAll(gitignoreBlock, ['.spine/index/', '.spine/atlas/'])) {
      issues.push(
        '.gitignore managed block does not ignore .spine/index/ and .spine/atlas/ (expected for local strategy).',
      );
    }
    if (!managedBlockIncludesAll(gitignoreBlock, ['.spine/secrets.json', 'secrets.json'])) {
      issues.push(
        '.gitignore managed block does not ignore fallback credential files (.spine/secrets.json, secrets.json). ' +
          'Run "spine repo strategy set local" to repair.',
      );
    }
    if (gitattributesBlock !== null && gitattributesBlock.includes('linguist-generated')) {
      issues.push(
        '.gitattributes managed block contains linguist-generated markers, which are only expected in distributable strategy.',
      );
    }
  } else {
    if (
      gitignoreBlock !== null &&
      (gitignoreBlock.includes('.spine/index/') || gitignoreBlock.includes('.spine/atlas/'))
    ) {
      issues.push(
        '.gitignore managed block ignores .spine/index/ or .spine/atlas/, but strategy is distributable. ' +
          'Run "spine repo strategy set distributable" to repair.',
      );
    }
    if (
      gitattributesBlock === null ||
      !managedBlockIncludesAll(gitattributesBlock, DISTRIBUTABLE_GITATTRIBUTES_LINES)
    ) {
      issues.push(
        '.gitattributes is missing linguist-generated markers for .spine snapshot paths (expected for distributable strategy). ' +
          'Run "spine repo strategy set distributable" to repair.',
      );
    }
    if (!managedBlockIncludesAll(gitignoreBlock, ['.spine/secrets.json', 'secrets.json'])) {
      issues.push(
        '.gitignore managed block does not ignore fallback credential files (.spine/secrets.json, secrets.json). ' +
          'Run "spine repo strategy set distributable" to repair.',
      );
    }
  }

  return { strategy, issues };
}

export function applyRepositoryStrategy(
  rootDir: string,
  config: Config,
  nextStrategy: ArtifactStrategy,
): RepositoryStrategyApplyResult {
  const previousStrategy = config.getArtifactStrategy() || config.getInitArtifactStrategy();
  const sameStrategy = previousStrategy === nextStrategy;

  config.setArtifactStrategy(nextStrategy);
  config.setInitArtifactStrategy(nextStrategy);

  const gitIgnoreResult = syncGitIgnoreFile(rootDir, nextStrategy);
  config.setGitIgnoreManaged(true);
  const gitIgnoreCreatedByArchSpine =
    gitIgnoreResult.status === 'created' || config.isGitIgnoreCreatedByArchSpine();
  config.setGitIgnoreCreatedByArchSpine(gitIgnoreCreatedByArchSpine);

  if (nextStrategy === 'distributable') {
    const gitAttributesResult = syncGitAttributesFile(rootDir);
    config.setGitAttributesManaged(true);
    const gitAttributesCreatedByArchSpine =
      gitAttributesResult.status === 'created' || config.isGitAttributesCreatedByArchSpine();
    config.setGitAttributesCreatedByArchSpine(gitAttributesCreatedByArchSpine);

    return {
      previousStrategy,
      sameStrategy,
      gitIgnoreStatus: gitIgnoreResult.status,
      gitAttributesStatus: gitAttributesResult.status,
      snapshotOutputsPresent: snapshotOutputsPresent(rootDir),
      trackedSnapshotFiles: [],
    };
  }

  const trackedSnapshotFiles = listTrackedSnapshotFiles(rootDir);
  const gitAttributesRemovalResult = removeManagedGitAttributesFile(
    rootDir,
    config.isGitAttributesCreatedByArchSpine(),
  );
  config.setGitAttributesManaged(false);
  config.setGitAttributesCreatedByArchSpine(false);

  return {
    previousStrategy,
    sameStrategy,
    gitIgnoreStatus: gitIgnoreResult.status,
    gitAttributesRemovalStatus: gitAttributesRemovalResult.status,
    snapshotOutputsPresent: false,
    trackedSnapshotFiles,
  };
}

export function installRecommendedRuleTemplates(rootDir: string): RuleTemplateInstallResult {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const templatesPath = path.join(__dirname, '..', 'assets', 'templates', 'rules');
  if (!fs.existsSync(templatesPath)) {
    return { status: 'missing-template-dir', copiedFiles: [] };
  }

  const rulesDir = path.join(rootDir, '.spine', 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });

  const copiedFiles: string[] = [];
  for (const file of fs.readdirSync(templatesPath)) {
    fs.copyFileSync(path.join(templatesPath, file), path.join(rulesDir, file));
    copiedFiles.push(file);
  }

  return { status: 'installed', copiedFiles };
}

export function syncAgentInstructionsConfiguration(
  rootDir: string,
  config: Config,
  selectedAgentInstructionsFile: string,
): AgentInstructionsSyncResult {
  const agentInstructionsResult = syncAgentInstructionsFile(rootDir, selectedAgentInstructionsFile);
  const previouslyCreated =
    config.isAgentInstructionsCreatedByArchSpine() &&
    config.getAgentInstructionsFile() === selectedAgentInstructionsFile;
  config.setAgentInstructionsFile(selectedAgentInstructionsFile);
  config.setAgentInstructionsCreatedByArchSpine(
    agentInstructionsResult.status === 'created' || previouslyCreated,
  );

  return {
    status: agentInstructionsResult.status,
    selectedFile: selectedAgentInstructionsFile,
  };
}

export function syncManagedRepositoryFiles(
  rootDir: string,
  config: Config,
  artifactStrategy: ArtifactStrategy,
): ManagedRepositoryFilesResult {
  const spineIgnoreResult = syncSpineIgnoreFile(rootDir);
  config.setSpineIgnoreManaged(true);
  config.setSpineIgnoreCreatedByArchSpine(
    spineIgnoreResult.status === 'created' || config.isSpineIgnoreCreatedByArchSpine(),
  );

  const searchIgnoreResult = syncSearchIgnoreFile(rootDir);
  config.setSearchIgnoreManaged(true);
  config.setSearchIgnoreCreatedByArchSpine(
    searchIgnoreResult.status === 'created' || config.isSearchIgnoreCreatedByArchSpine(),
  );

  const strategyResult = applyRepositoryStrategy(rootDir, config, artifactStrategy);

  return {
    spineIgnoreStatus: spineIgnoreResult.status,
    searchIgnoreStatus: searchIgnoreResult.status,
    gitIgnoreStatus: strategyResult.gitIgnoreStatus,
    gitAttributesStatus: strategyResult.gitAttributesStatus,
    gitAttributesRemovalStatus: strategyResult.gitAttributesRemovalStatus,
  };
}

export function injectRepositoryPackageScripts(
  rootDir: string,
  config: Config,
): InjectPackageScriptsResult {
  const scriptResult = injectArchSpineScripts(rootDir);
  if (scriptResult.status === 'updated') {
    const trackedScripts = Array.from(
      new Set([...(config.getInjectedPackageScripts() || []), ...scriptResult.addedScripts]),
    );
    config.setInjectedPackageScripts(trackedScripts);
  }

  return {
    status: scriptResult.status,
    addedScripts: scriptResult.addedScripts,
  };
}
