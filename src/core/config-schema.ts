import { CURRENT_CONFIG_SCHEMA_VERSION, type SpineConfig } from '../types/protocol.js';

export interface SpineConfigValidationResult {
  config: SpineConfig | null;
  issues: string[];
}

const LLM_MODES = new Set(['standard', 'heavy']);
const PROMPT_TIERS = new Set(['lite', 'balanced']);
const VALIDATE_POLICIES = new Set(['default', 'strict']);
const MCP_CONTEXT_MODES = new Set(['off', 'project-first', 'search-first']);
const HOOK_SYNC_MODES = new Set(['hook', 'standard', 'heavy']);
const ARTIFACT_STRATEGIES = new Set(['local', 'distributable']);
const FILE_SOURCES = new Set(['git-tracked', 'git-tracked-plus-untracked', 'filesystem']);

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function expectEnum(
  issues: string[],
  fieldPath: string,
  value: unknown,
  allowed: Set<string>,
): void {
  if (value !== undefined && (typeof value !== 'string' || !allowed.has(value))) {
    issues.push(`${fieldPath} must be one of: ${Array.from(allowed).join(', ')}`);
  }
}

function expectBoolean(issues: string[], fieldPath: string, value: unknown): void {
  if (value !== undefined && typeof value !== 'boolean') {
    issues.push(`${fieldPath} must be a boolean`);
  }
}

function expectString(issues: string[], fieldPath: string, value: unknown): void {
  if (value !== undefined && typeof value !== 'string') {
    issues.push(`${fieldPath} must be a string`);
  }
}

function validateProject(project: unknown, issues: string[]): void {
  if (!isRecord(project)) {
    issues.push('project must be an object');
    return;
  }
  if (typeof project.name !== 'string' || project.name.length === 0) {
    issues.push('project.name must be a non-empty string');
  }
  if (!isStringArray(project.locales)) {
    issues.push('project.locales must be an array of strings');
  }
}

function validateLLM(llm: unknown, issues: string[]): void {
  if (!isRecord(llm)) {
    issues.push('llm must be an object');
    return;
  }

  expectString(issues, 'llm.provider', llm.provider);
  expectString(issues, 'llm.model', llm.model);
  expectString(issues, 'llm.baseURL', llm.baseURL);
  expectEnum(issues, 'llm.mode', llm.mode, LLM_MODES);
  expectEnum(issues, 'llm.promptTier', llm.promptTier, PROMPT_TIERS);
  expectEnum(issues, 'llm.validatePolicy', llm.validatePolicy, VALIDATE_POLICIES);
}

function validateMcp(mcp: unknown, issues: string[]): void {
  if (mcp === undefined) {
    return;
  }
  if (!isRecord(mcp)) {
    issues.push('mcp must be an object');
    return;
  }
  expectEnum(issues, 'mcp.contextMode', mcp.contextMode, MCP_CONTEXT_MODES);
}

function validateHooks(hooks: unknown, issues: string[]): void {
  if (hooks === undefined) {
    return;
  }
  if (!isRecord(hooks)) {
    issues.push('hooks must be an object');
    return;
  }
  expectBoolean(issues, 'hooks.preCommit', hooks.preCommit);
  expectEnum(issues, 'hooks.syncMode', hooks.syncMode, HOOK_SYNC_MODES);
}

function validateArtifacts(artifacts: unknown, issues: string[]): void {
  if (artifacts === undefined) {
    return;
  }
  if (!isRecord(artifacts)) {
    issues.push('artifacts must be an object');
    return;
  }
  expectEnum(issues, 'artifacts.strategy', artifacts.strategy, ARTIFACT_STRATEGIES);
  expectBoolean(issues, 'artifacts.experimentalViewLayer', artifacts.experimentalViewLayer);
  if (artifacts.enabledViews !== undefined && !isStringArray(artifacts.enabledViews)) {
    issues.push('artifacts.enabledViews must be an array of strings');
  }
}

function validateInitState(initState: unknown, issues: string[]): void {
  if (initState === undefined) {
    return;
  }
  if (!isRecord(initState)) {
    issues.push('initState must be an object');
    return;
  }
  expectEnum(issues, 'initState.artifactStrategy', initState.artifactStrategy, ARTIFACT_STRATEGIES);
  expectString(issues, 'initState.agentInstructionsFile', initState.agentInstructionsFile);
  expectBoolean(
    issues,
    'initState.agentInstructionsCreatedByArchSpine',
    initState.agentInstructionsCreatedByArchSpine,
  );
  expectBoolean(issues, 'initState.gitIgnoreManaged', initState.gitIgnoreManaged);
  expectBoolean(
    issues,
    'initState.gitIgnoreCreatedByArchSpine',
    initState.gitIgnoreCreatedByArchSpine,
  );
  expectBoolean(issues, 'initState.gitAttributesManaged', initState.gitAttributesManaged);
  expectBoolean(
    issues,
    'initState.gitAttributesCreatedByArchSpine',
    initState.gitAttributesCreatedByArchSpine,
  );
  expectBoolean(issues, 'initState.spineIgnoreManaged', initState.spineIgnoreManaged);
  expectBoolean(
    issues,
    'initState.spineIgnoreCreatedByArchSpine',
    initState.spineIgnoreCreatedByArchSpine,
  );
  expectBoolean(issues, 'initState.searchIgnoreManaged', initState.searchIgnoreManaged);
  expectBoolean(
    issues,
    'initState.searchIgnoreCreatedByArchSpine',
    initState.searchIgnoreCreatedByArchSpine,
  );
  if (
    initState.injectedPackageScripts !== undefined &&
    !isStringArray(initState.injectedPackageScripts)
  ) {
    issues.push('initState.injectedPackageScripts must be an array of strings');
  }
}

function validateScanPolicy(scanPolicy: unknown, issues: string[]): void {
  if (scanPolicy === undefined) {
    return;
  }
  if (!isRecord(scanPolicy)) {
    issues.push('scanPolicy must be an object');
    return;
  }
  expectEnum(issues, 'scanPolicy.fileSource', scanPolicy.fileSource, FILE_SOURCES);
  if (scanPolicy.ignoreChain !== undefined) {
    if (!isRecord(scanPolicy.ignoreChain)) {
      issues.push('scanPolicy.ignoreChain must be an object');
    } else {
      expectBoolean(
        issues,
        'scanPolicy.ignoreChain.inheritGitIgnore',
        scanPolicy.ignoreChain.inheritGitIgnore,
      );
      expectString(
        issues,
        'scanPolicy.ignoreChain.projectIgnore',
        scanPolicy.ignoreChain.projectIgnore,
      );
      expectString(
        issues,
        'scanPolicy.ignoreChain.localIgnore',
        scanPolicy.ignoreChain.localIgnore,
      );
    }
  }
  if (
    scanPolicy.protocolExclusions !== undefined &&
    !isStringArray(scanPolicy.protocolExclusions)
  ) {
    issues.push('scanPolicy.protocolExclusions must be an array of strings');
  }
  if (
    scanPolicy.protocolInclusions !== undefined &&
    !isStringArray(scanPolicy.protocolInclusions)
  ) {
    issues.push('scanPolicy.protocolInclusions must be an array of strings');
  }
}

export function resolveSpineConfig(value: unknown): SpineConfigValidationResult {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return {
      config: null,
      issues: ['config root must be a JSON object'],
    };
  }

  if (value.schemaVersion !== CURRENT_CONFIG_SCHEMA_VERSION) {
    issues.push(`schemaVersion must equal "${CURRENT_CONFIG_SCHEMA_VERSION}"`);
  }

  validateProject(value.project, issues);
  validateLLM(value.llm, issues);
  validateMcp(value.mcp, issues);
  validateHooks(value.hooks, issues);
  validateArtifacts(value.artifacts, issues);
  validateInitState(value.initState, issues);
  validateScanPolicy(value.scanPolicy, issues);

  return {
    config: issues.length === 0 ? (value as unknown as SpineConfig) : null,
    issues,
  };
}

export function validateSpineConfig(value: unknown): SpineConfigValidationResult {
  return resolveSpineConfig(value);
}
