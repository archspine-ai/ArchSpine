import * as fs from 'fs';
import * as path from 'path';
import { throwCliUsage } from '../cli-utils.js';

export interface ExecuteTryCommandOptions {
  args: string[];
  rootDir: string;
  displayUIBanner: (cmd?: string, argsArr?: string[]) => void;
}

function directoryHasEntries(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath) && fs.readdirSync(dirPath).length > 0;
  } catch {
    return false;
  }
}

function formatState(value: boolean, positive: string, negative: string): string {
  return value ? positive : negative;
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

  const spineDir = path.join(rootDir, '.spine');
  const configPath = path.join(spineDir, 'config.json');
  const rulesDir = path.join(spineDir, 'rules');
  const manifestPath = path.join(spineDir, 'manifest.json');
  const indexDir = path.join(spineDir, 'index');
  const atlasDir = path.join(spineDir, 'atlas');
  const indexProjectPath = path.join(indexDir, 'project.json');

  const hasConfig = fs.existsSync(configPath);
  const hasRules = directoryHasEntries(rulesDir);
  const hasManifest = fs.existsSync(manifestPath);
  const hasIndexProject = fs.existsSync(indexProjectPath);
  const hasIndexEntries = directoryHasEntries(indexDir);
  const hasAtlasEntries = directoryHasEntries(atlasDir);
  const hasDistributableSnapshot = hasIndexEntries && hasAtlasEntries;
  const hasControlPlane = hasConfig || hasRules;
  const appearsAdopted =
    fs.existsSync(spineDir) && (hasControlPlane || hasManifest || hasDistributableSnapshot);

  let artifactStrategy = 'unknown';
  if (hasConfig) {
    try {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as {
        artifacts?: { strategy?: string };
      };
      if (raw.artifacts?.strategy === 'local' || raw.artifacts?.strategy === 'distributable') {
        artifactStrategy = raw.artifacts.strategy;
      }
    } catch {
      artifactStrategy = 'invalid-config';
    }
  }

  console.log('ArchSpine Try');
  console.log('-------------');
  if (hasDistributableSnapshot) {
    console.log('ArchSpine is already available in this repository.');
    console.log('');
    console.log(
      "You can inspect this repo's architectural context right now without installing anything.",
    );
    console.log('This preview is read-only and will not modify files, hooks, or package.json.');
    console.log('');
    console.log('Available now:');
    console.log('- repository control-plane inputs');
    console.log('- architectural rules');
    console.log('- distributable semantic snapshot');
    console.log('');
    console.log('Recommended next step:');
    console.log('  npx --yes archspine@latest info');
  } else if (appearsAdopted) {
    console.log(
      'This repository uses ArchSpine, but the local semantic snapshot is not fully available yet.',
    );
    console.log('');
    console.log('You can still inspect the control-plane setup now.');
    console.log('Nothing has been modified by this preview.');
    console.log('');
    console.log('Recommended next step:');
    console.log('  npx --yes archspine@latest build');
  } else {
    console.log('This repository is not using ArchSpine yet.');
    console.log('');
    console.log('You can preview the setup path without mutating anything.');
    console.log('ArchSpine will ask before changing repository files, hooks, or package scripts.');
    console.log('');
    console.log('Recommended next step:');
    console.log('  npx --yes archspine@latest init');
  }

  console.log('');
  console.log('Detected repository posture:');
  console.log(`- repository: ${path.basename(rootDir)}`);
  console.log(`- archspine adopted: ${formatState(appearsAdopted, 'yes', 'no')}`);
  console.log(`- control-plane inputs: ${formatState(hasControlPlane, 'present', 'missing')}`);
  console.log(`- rules: ${formatState(hasRules, 'present', 'missing')}`);
  console.log(`- runtime manifest: ${formatState(hasManifest, 'present', 'missing')}`);
  console.log(
    `- semantic snapshot: ${formatState(hasIndexProject || hasIndexEntries, 'present', 'missing')}`,
  );
  console.log(
    `- distributable snapshot: ${formatState(hasDistributableSnapshot, 'present', 'missing')}`,
  );
  console.log(`- artifact strategy: ${artifactStrategy}`);
}
