import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');
const rulesSrcDir = path.join(repoRoot, 'src', 'ast', 'rules');
const rulesDistDir = path.join(distDir, 'ast', 'rules');
const assetsSrcDir = path.join(repoRoot, 'src', 'assets');
const assetsDistDir = path.join(distDir, 'assets');

export function shouldExcludeDistEntry(sourcePath) {
  return sourcePath.split(path.sep).includes('__mocks__');
}

export function main() {
  fs.rmSync(distDir, { recursive: true, force: true });

  execSync('tsc', {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  fs.mkdirSync(rulesDistDir, { recursive: true });
  for (const file of fs.readdirSync(rulesSrcDir)) {
    fs.copyFileSync(path.join(rulesSrcDir, file), path.join(rulesDistDir, file));
  }

  copyDir(assetsSrcDir, assetsDistDir);
  removeMockDirectories(distDir);

  const cliEntry = path.join(distDir, 'cli', 'index.js');
  if (fs.existsSync(cliEntry)) {
    fs.chmodSync(cliEntry, 0o755);
  }
}

function copyDir(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    if (shouldExcludeDistEntry(sourcePath)) {
      continue;
    }
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function removeMockDirectories(sourceDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name === '__mocks__') {
      fs.rmSync(sourcePath, { recursive: true, force: true });
      continue;
    }
    removeMockDirectories(sourcePath);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
