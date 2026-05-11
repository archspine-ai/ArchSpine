import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../../infra/config.js';
import { LangRegistry } from '../../ast/lang-registry.js';
import { throwCliUsage } from '../cli-utils.js';
import {
  checkRepoPosture,
  discoverLanguageLandscape,
  generateASTPreviews,
} from '../../services/try-service.js';

export interface ExecuteTryCommandOptions {
  args: string[];
  rootDir: string;
  displayUIBanner: (cmd?: string, argsArr?: string[]) => void;
}

function formatState(value: boolean, positive: string, negative: string): string {
  return value ? positive : negative;
}

function printFinalAdvice(appearsAdopted: boolean, hasSnapshot: boolean): void {
  console.log('--- What This Means ---');
  console.log('');
  console.log('ArchSpine builds a ".spine/" control plane from your source code:');
  console.log('  • AST extraction (shown above) — no API keys needed');
  console.log('  • LLM-powered semantic summaries (requires API keys)');
  console.log('  • Architecture rule checking');
  console.log('  • Knowledge graph + diagnostics');
  console.log('  • MCP tools for AI agents');

  if (hasSnapshot) {
    console.log('');
    console.log('✨ This repo is ready. Connect your agent:');
    console.log('  npx --yes archspine@latest mcp setup');
  } else if (appearsAdopted) {
    console.log('');
    console.log('📋 Setup detected. Complete the index:');
    console.log('  npm install archspine');
    console.log('  spine sync');
  } else {
    console.log('');
    console.log('🚀 Get started in 30 seconds:');
    console.log('  npx --yes archspine@latest init');
    console.log('  spine sync');
    console.log('  spine mcp setup');
    console.log('');
    console.log('No installation needed for the preview. `spine init` will guide you.');
  }
}

export async function executeTryCommand({
  args,
  rootDir,
  displayUIBanner,
}: ExecuteTryCommandOptions): Promise<void> {
  if (args.length > 0) {
    throwCliUsage('Usage: spine try');
  }

  displayUIBanner('try', args);

  // ---- Phase 1: Repo Posture Check ----

  const posture = checkRepoPosture(rootDir);
  const hasDistributableSnapshot = posture.hasIndex && posture.hasView;
  const hasControlPlane = posture.hasConfig || posture.hasRules;
  const spineDir = path.join(rootDir, '.spine');
  const appearsAdopted =
    fs.existsSync(spineDir) && (hasControlPlane || posture.hasManifest || hasDistributableSnapshot);

  console.log('ArchSpine Try — Zero-Config Preview');
  console.log('===================================');
  console.log('');
  console.log(`Repository: ${path.basename(rootDir)}`);
  console.log(`ArchSpine adopted: ${formatState(appearsAdopted, 'yes', 'no')}`);

  if (hasDistributableSnapshot) {
    console.log('');
    console.log('✅ ArchSpine is already active in this repository.');
    console.log('   .spine/index/ and .spine/view/ are populated and ready for consumption.');
    console.log('');
    console.log('Available now:');
    console.log('  - Read `.spine/view/pages/agent-briefing.md` for a full project map');
    console.log('  - Load `.spine/view/data/knowledge-graph.json` for dependency queries');
    console.log('  - Run `spine mcp setup` to connect your AI agent');
    console.log('');
    console.log('Quick dive:');
    console.log('  npx --yes archspine@latest info');
    console.log('  npx --yes archspine@latest view show');
  } else if (appearsAdopted) {
    console.log('');
    console.log('📋 ArchSpine is configured but the semantic snapshot is partial.');
    console.log('   Run `spine sync` to build it (requires LLM keys).');
  } else {
    console.log('');
    console.log('🌱 This repository is not using ArchSpine yet.');
    console.log('   Continue reading for a zero-config AST preview.');
  }

  // ---- Phase 2: Language Discovery ----

  console.log('');
  console.log('--- Language Landscape ---');

  let languageSnapshot = await discoverLanguageLandscape(rootDir, new Config(rootDir));

  if (!languageSnapshot || Object.keys(languageSnapshot.languages).length === 0) {
    console.log('No supported source languages detected in this repository.');
    if (languageSnapshot) {
      console.log(
        `Detected file extensions: ${languageSnapshot.detectedExtensions.join(', ') || 'none'}`,
      );
    }
  } else {
    console.log('');
    for (const [langName, langSupport] of Object.entries(languageSnapshot.languages)) {
      const icon = langSupport.status === 'available' ? '✅' : '⚠️';
      const extList = langSupport.extensions.join(', ');
      const reason = langSupport.reason ? ` (${langSupport.reason})` : '';
      console.log(`  ${icon} ${langName}: ${extList}${reason}`);
    }
    const unsupported = languageSnapshot.detectedExtensions.filter(
      (ext) => !Object.values(languageSnapshot!.languages).some((l) => l.extensions.includes(ext)),
    );
    if (unsupported.length > 0) {
      console.log(`  ❌ Unsupported extensions: ${unsupported.join(', ')}`);
    }
  }

  // ---- Phase 3: AST Preview (no LLM keys needed) ----

  console.log('');
  console.log('--- AST Preview (no API keys required) ---');
  console.log('');

  if (!languageSnapshot || Object.keys(languageSnapshot.languages).length === 0) {
    console.log('No supported languages to preview. Skipping AST extraction.');
    printFinalAdvice(appearsAdopted, hasDistributableSnapshot);
    return;
  }

  const { previews, sampleLimit } = await generateASTPreviews(rootDir, languageSnapshot);
  const availableCount = Object.entries(languageSnapshot.languages).filter(
    ([, s]) => s.status === 'available',
  ).length;

  if (availableCount === 0) {
    console.log('No language packages available for AST extraction.');
    console.log('Install the missing @ast-grep/lang-* packages and retry.');
    printFinalAdvice(appearsAdopted, hasDistributableSnapshot);
    return;
  }

  for (const preview of previews) {
    const icon = preview.status === 'available' ? '✅' : '⚠️';
    console.log(
      `${icon} ${preview.language} (${preview.fileCount} source files, ${preview.extensions.join(', ')})`,
    );
    console.log(`  Sample: ${preview.sampleFile}`);
    console.log(preview.sampleResult);
  }

  if (previews.length === 0) {
    console.log('No sample files found for supported languages.');
  } else {
    console.log(`Showing ${previews.length} of ${availableCount} supported language(s).`);
  }

  // ---- Phase 4: Final Advice ----
  console.log('');
  printFinalAdvice(appearsAdopted, hasDistributableSnapshot);
}
