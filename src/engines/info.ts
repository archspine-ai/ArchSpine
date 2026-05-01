import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../infra/config.js';
import { Manifest } from '../infra/manifest.js';
import { Secrets } from '../infra/secrets.js';
import { GlobalLLMConfig, GlobalLLMSecrets, getGlobalArchSpineDir } from '../infra/llm.js';
import { RuntimeService } from '../services/runtime-service.js';
import {
  detectProtectedOutputMutations,
  formatProtectedOutputMutationWarning,
} from '../infra/spine-gate.js';
import { LanguageSnapshot } from '../types/protocol.js';
import { defaultRuntimeIO, RuntimeIO } from '../infra/runtime-io.js';

interface ManifestView {
  schemaVersion?: string;
  generatorVersion?: string;
  project?: string;
  sync?: {
    lastSyncAt?: string;
    lastSyncMode?: string;
    reverseIndexComplete?: boolean;
    indexedUnitCount?: number;
    llm?: {
      provider?: string | null;
      providerSource?: string;
      model?: string | null;
      modelSource?: string;
    };
  };
  health?: {
    activeViolations?: number;
    lastSyncDurationMs?: number;
  };
}

export async function runInfoReport(
  rootDir: string,
  options: { verbose?: boolean; runtimeIO?: RuntimeIO } = {},
): Promise<void> {
  const verbose = options.verbose === true;
  const runtimeIO = options.runtimeIO || defaultRuntimeIO;
  const violationWarning = formatProtectedOutputMutationWarning(
    detectProtectedOutputMutations(rootDir),
  );
  const spineDir = path.join(rootDir, '.spine');
  const config = new Config(rootDir);
  const secrets = new Secrets(rootDir);
  const globalConfig = new GlobalLLMConfig();
  const globalSecrets = new GlobalLLMSecrets();
  const runtimeService = new RuntimeService(rootDir, config, secrets, globalConfig, globalSecrets);
  const manifest = Manifest.open(rootDir);
  const hookResolution = config.getPreCommitResolution();
  const llmResolution = runtimeService.getResolvedLLMSettings();
  const syncProfile = runtimeService.getResolvedExecutionProfile('sync');
  const checkProfile = runtimeService.getResolvedExecutionProfile('check');
  const status = await runtimeService.getSyncService().status();
  const usage = manifest.getTotalUsage();
  const langSnapshot = manifest.loadLanguageSnapshot();
  const manifestView = loadManifestView(rootDir);

  runtimeIO.info('\n========================================');
  runtimeIO.info(' ArchSpine Workspace Info');
  runtimeIO.info('========================================\n');

  runtimeIO.info(`Project Root:              ${rootDir}`);
  runtimeIO.info(`.spine Directory:          ${fs.existsSync(spineDir) ? 'present' : 'missing'}`);
  runtimeIO.info(
    `Config File:               ${fs.existsSync(path.join(spineDir, 'config.json')) ? 'present' : 'missing'}`,
  );
  runtimeIO.info(
    `Cache DB:                  ${fs.existsSync(path.join(spineDir, 'cache.db')) ? 'present' : 'missing'}`,
  );
  runtimeIO.info('');

  runtimeIO.info('Configuration');
  runtimeIO.info(`  Locales:                 ${config.getLanguages().join(', ') || 'none'}`);
  runtimeIO.info(
    `  LLM Provider:            ${formatResolvedValue(llmResolution.provider, 'unset')}`,
  );
  runtimeIO.info(
    `  LLM Model:               ${formatResolvedValue(llmResolution.model, 'default')}`,
  );
  runtimeIO.info(
    `  LLM Base URL:            ${formatResolvedValue(llmResolution.baseURL, 'default')}`,
  );
  runtimeIO.info(
    `  LLM API Key:             ${llmResolution.apiKey.value ? `configured (${llmResolution.apiKey.source})` : 'missing'}`,
  );
  runtimeIO.info(`  Configured Mode:         ${formatResolvedValue(llmResolution.mode, 'unset')}`);
  runtimeIO.info(`  Effective Sync Mode:     ${syncProfile.mode} (${syncProfile.modeSource})`);
  runtimeIO.info(`  Effective Check Mode:    ${checkProfile.mode} (${checkProfile.modeSource})`);
  if (verbose) {
    runtimeIO.info(
      `  Sync Runtime Detail:     ${syncProfile.mode === 'heavy' ? 'high-confidence generation path' : 'default day-to-day generation path'}`,
    );
    runtimeIO.info(
      `  Check Runtime Detail:    ${checkProfile.mode === 'heavy' ? 'high-confidence audit path' : 'default audit path'}`,
    );
  } else {
    runtimeIO.info(`  Runtime Details:         hidden (use --verbose)`);
  }
  runtimeIO.info(`  Global LLM Store:        ${getGlobalArchSpineDir()}`);
  runtimeIO.info(`  Global Credentials:      ${globalSecrets.getCredentialBackendName()}`);
  runtimeIO.info(`  Project Credentials:     ${secrets.getCredentialBackendName()}`);
  runtimeIO.info(
    `  Hook State:              ${hookResolution.value ? 'enabled' : 'disabled'} via ${hookResolution.source}${hookResolution.envVar ? ` (${hookResolution.envVar})` : ''}`,
  );
  runtimeIO.info(`  Hook Sync Mode:          ${config.getHookSyncMode()}`);
  runtimeIO.info(`  Scan File Source:        ${config.getScanPolicy().fileSource}`);
  if (violationWarning) {
    runtimeIO.info(`  Spine Gate Violation:    ${violationWarning}`);
  }
  runtimeIO.info('');

  runtimeIO.info('Sync Status');
  runtimeIO.info(`  Total Scannable Files:   ${status.total}`);
  runtimeIO.info(`  Files Needing Sync:      ${status.needingSync}`);
  runtimeIO.info(`  Last Sync At:            ${manifestView.sync?.lastSyncAt || 'never'}`);
  runtimeIO.info(`  Last Sync Mode:          ${manifestView.sync?.lastSyncMode || 'n/a'}`);
  runtimeIO.info(
    `  Last Sync LLM Provider:  ${formatPersistedSyncValue(manifestView.sync?.llm?.provider, manifestView.sync?.llm?.providerSource, 'unset')}`,
  );
  runtimeIO.info(
    `  Last Sync LLM Model:     ${formatPersistedSyncValue(manifestView.sync?.llm?.model, manifestView.sync?.llm?.modelSource, 'default')}`,
  );
  runtimeIO.info(`  Indexed Units:           ${manifestView.sync?.indexedUnitCount ?? 0}`);
  runtimeIO.info(
    `  Reverse Index:           ${manifestView.sync?.reverseIndexComplete ? 'complete' : 'incomplete'}`,
  );
  runtimeIO.info(`  Active Violations:       ${manifestView.health?.activeViolations ?? 0}`);
  runtimeIO.info(
    `  Last Sync Duration:      ${formatDurationMs(manifestView.health?.lastSyncDurationMs)}`,
  );
  runtimeIO.info('');

  runtimeIO.info('Protocol');
  runtimeIO.info(`  Schema Version:          ${manifestView.schemaVersion || 'n/a'}`);
  runtimeIO.info(`  Generator Version:       ${manifestView.generatorVersion || 'n/a'}`);
  runtimeIO.info('');

  runtimeIO.info('Language Snapshot');
  printLanguageSnapshot(langSnapshot, runtimeIO);
  runtimeIO.info('');

  runtimeIO.info('Usage');
  if (!usage || usage.session_count === 0) {
    runtimeIO.info('  Sessions:                0');
    runtimeIO.info('  Total Tokens:            0');
  } else {
    runtimeIO.info(`  Sessions:                ${usage.session_count}`);
    runtimeIO.info(`  Input Tokens:            ${usage.input_tokens.toLocaleString()}`);
    runtimeIO.info(`  Output Tokens:           ${usage.output_tokens.toLocaleString()}`);
    runtimeIO.info(`  Total Tokens:            ${usage.total_tokens.toLocaleString()}`);
  }

  runtimeIO.info('\n========================================\n');
}

function loadManifestView(rootDir: string): ManifestView {
  const manifestPath = path.join(rootDir, '.spine', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as ManifestView;
  } catch {
    return {};
  }
}

function formatResolvedValue<T>(
  resolution: { value?: T; source: string },
  fallback: string,
): string {
  if (resolution.value === undefined || resolution.value === null || resolution.value === '') {
    return fallback;
  }
  return `${String(resolution.value)} (${resolution.source})`;
}

function formatPersistedSyncValue(
  value: string | null | undefined,
  source: string | undefined,
  fallback: string,
): string {
  return `${value || fallback} (${source || 'unset'})`;
}

function formatDurationMs(durationMs?: number): string {
  if (!durationMs || durationMs <= 0) {
    return 'n/a';
  }
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  return `${(durationMs / 1000).toFixed(2)}s`;
}

function printLanguageSnapshot(snapshot: LanguageSnapshot | null, runtimeIO: RuntimeIO): void {
  if (!snapshot) {
    runtimeIO.info('  Snapshot:                missing');
    return;
  }

  const detectedLanguages = Object.keys(snapshot.languages);
  const available = Object.entries(snapshot.languages)
    .filter(([, support]) => support.status === 'available')
    .map(([language]) => language);
  const unavailable = Object.entries(snapshot.languages)
    .filter(([, support]) => support.status === 'unavailable')
    .map(([language, support]) => `${language} (${support.reason})`);

  runtimeIO.info(`  Snapshot Version:        ${snapshot.schemaVersion}`);
  runtimeIO.info(`  Detected Languages:      ${detectedLanguages.join(', ') || 'none'}`);
  runtimeIO.info(`  Available Parsers:       ${available.join(', ') || 'none'}`);
  runtimeIO.info(`  Missing Parsers:         ${unavailable.join(', ') || 'none'}`);
  runtimeIO.info(`  Detected Extensions:     ${snapshot.detectedExtensions.join(', ') || 'none'}`);
}
