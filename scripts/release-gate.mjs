import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const gates = [
  { label: 'build', command: 'npm run build' },
  { label: 'unit-tests', command: 'npm run test:unit' },
  { label: 'schema-tests', command: 'npm run test:schema' },
  { label: 'protocol-validate', command: 'npm run validate' },
  { label: 'pack-check', command: 'npm run pack:check' },
];

for (const gate of gates) {
  console.log(`[release:gate] starting ${gate.label}`);
  execSync(gate.command, {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  console.log(`[release:gate] passed ${gate.label}`);
}

console.log('[release:gate] all gates passed');
