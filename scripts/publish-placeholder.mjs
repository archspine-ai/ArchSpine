import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(repoRoot, 'package.json');
const npmRegistry = 'https://registry.npmjs.org/';
const packageName = 'archspine';
const placeholderVersion = '0.0.1';

function readPackageJson() {
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function assertPlaceholderPackage(packageJson) {
  if (packageJson.name !== packageName) {
    throw new Error(
      `[publish:placeholder] expected package name "${packageName}", found "${packageJson.name}"`,
    );
  }

  if (packageJson.version !== placeholderVersion) {
    throw new Error(
      `[publish:placeholder] expected placeholder version "${placeholderVersion}", found "${packageJson.version}". ` +
        'Refuse to publish until the package metadata is reset to the placeholder version.',
    );
  }
}

function isPackageAlreadyPublished() {
  try {
    const output = execFileSync(
      'npm',
      ['view', packageName, 'version', '--registry', npmRegistry, '--json'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    ).trim();

    return output.length > 0;
  } catch (error) {
    const stderr = String(error?.stderr ?? error?.message ?? '');
    if (
      stderr.includes('E404') ||
      stderr.includes('404 Not Found') ||
      stderr.includes('Not Found') ||
      stderr.includes('is not in this registry')
    ) {
      return false;
    }

    throw new Error(
      `[publish:placeholder] failed to query ${packageName} from the official npm registry.\n${stderr}`,
    );
  }
}

function run(command, args) {
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

const packageJson = readPackageJson();
assertPlaceholderPackage(packageJson);

console.log(
  `[publish:placeholder] checking whether ${packageName} is available on the official npm registry...`,
);
if (isPackageAlreadyPublished()) {
  throw new Error(
    `[publish:placeholder] ${packageName} already exists on npm. Stop here and choose a different package name.`,
  );
}

console.log('[publish:placeholder] registry check passed');
console.log('[publish:placeholder] running release gate');
run('npm', ['run', 'release:gate']);

console.log(
  `[publish:placeholder] publishing ${packageName}@${placeholderVersion} to the official npm registry`,
);
run('npm', ['publish', '--registry', npmRegistry]);

console.log('[publish:placeholder] publish complete');
console.log(
  `[publish:placeholder] verify with: npm view ${packageName} version --registry=${npmRegistry}`,
);
