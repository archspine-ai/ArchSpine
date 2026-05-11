import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const WATCH_TARGETS = ['src', 'scripts/build.mjs', 'tsconfig.json', 'package.json'];

const POLL_INTERVAL_MS = 1000;

let lastSignature = '';
let building = false;
let queued = false;
let pendingReason = 'initial';

function collectEntries(relativeTarget) {
  const targetPath = path.join(repoRoot, relativeTarget);
  if (!fs.existsSync(targetPath)) {
    return [];
  }

  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    return [`${relativeTarget}:${Math.floor(stat.mtimeMs)}:${stat.size}`];
  }

  const entries = [];
  walkDirectory(relativeTarget, targetPath, entries);
  return entries;
}

function walkDirectory(relativeRoot, fullRoot, entries) {
  for (const entry of fs.readdirSync(fullRoot, { withFileTypes: true })) {
    const relativePath = path.join(relativeRoot, entry.name);
    const fullPath = path.join(fullRoot, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(relativePath, fullPath, entries);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    const stat = fs.statSync(fullPath);
    entries.push(`${relativePath}:${Math.floor(stat.mtimeMs)}:${stat.size}`);
  }
}

function computeSignature() {
  return WATCH_TARGETS.flatMap(collectEntries).sort().join('|');
}

function runBuild() {
  if (building) {
    queued = true;
    return;
  }

  building = true;
  const reason = pendingReason;
  pendingReason = 'change';
  const startedAt = Date.now();

  console.log(`[dev:build] Rebuilding (${reason})...`);

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npmCommand, ['run', 'build'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    building = false;
    const durationMs = Date.now() - startedAt;

    if (signal) {
      console.error(`[dev:build] Build interrupted by signal ${signal}.`);
    } else if (code === 0) {
      console.log(`[dev:build] Build completed in ${durationMs}ms.`);
    } else {
      console.error(`[dev:build] Build failed with exit code ${code}. Watching for next change...`);
    }

    lastSignature = computeSignature();

    if (queued) {
      queued = false;
      runBuild();
    }
  });
}

function poll() {
  const nextSignature = computeSignature();
  if (!lastSignature) {
    lastSignature = nextSignature;
  } else if (nextSignature !== lastSignature) {
    pendingReason = 'file change';
    lastSignature = nextSignature;
    runBuild();
  }
}

console.log(`[dev:build] Polling ${WATCH_TARGETS.join(', ')} every ${POLL_INTERVAL_MS}ms...`);
runBuild();
setInterval(poll, POLL_INTERVAL_MS);
