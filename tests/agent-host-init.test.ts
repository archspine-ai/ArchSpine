import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  injectArchSpineScripts,
  removeArchSpineScripts,
  removeManagedAgentInstructionsFile,
  removeManagedGitAttributesFile,
  removeManagedGitIgnoreFile,
  removeManagedSearchIgnoreFile,
  removeManagedSpineIgnoreFile,
  syncGitAttributesFile,
  syncGitIgnoreFile,
  syncAgentInstructionsFile,
  syncSearchIgnoreFile,
  syncSpineIgnoreFile,
} from '../src/utils/agent-instructions.js';
import { runRepositoryBootstrap } from '../src/cli/init/repository-bootstrap.js';
import { Config } from '../src/infra/config.js';

describe('Agent instructions injection utilities', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-agent-host-'));
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('creates missing instructions document with managed block', () => {
    const result = syncAgentInstructionsFile(testDir, 'AGENTS.md');

    expect(result.status).toBe('created');
    const content = fs.readFileSync(path.join(testDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('<!-- ARCHSPINE:BEGIN -->');
    expect(content).toContain('<!-- ARCHSPINE:END -->');
    expect(content).toContain('npx --yes archspine@latest try');
    expect(content).toContain('Prefer the local MCP server');
    expect(content).toContain('not searching generated `.spine/index/**` or `.spine/atlas/**`');
    expect(content).toContain('`.spine/config.json` and `.spine/rules/**`');
  });

  it('updates existing instructions block without rewriting unrelated content', () => {
    const hostPath = path.join(testDir, 'AGENTS.md');
    fs.writeFileSync(
      hostPath,
      [
        '# Team Guide',
        '',
        '<!-- ARCHSPINE:BEGIN -->',
        'legacy',
        '<!-- ARCHSPINE:END -->',
        '',
        'Keep this section.',
      ].join('\n'),
    );

    const result = syncAgentInstructionsFile(testDir, 'AGENTS.md');

    expect(result.status).toBe('updated');
    const content = fs.readFileSync(hostPath, 'utf-8');
    expect(content).toContain('# Team Guide');
    expect(content).toContain('Keep this section.');
    expect(content).not.toContain('\nlegacy\n');
  });

  it('appends instructions block when document exists without block', () => {
    const hostPath = path.join(testDir, 'AGENTS.md');
    fs.writeFileSync(hostPath, '# Existing\n\nUser content\n');

    const result = syncAgentInstructionsFile(testDir, 'AGENTS.md');

    expect(result.status).toBe('appended');
    const content = fs.readFileSync(hostPath, 'utf-8');
    expect(content).toContain('# Existing');
    expect(content).toMatch(/User content[\s\S]*<!-- ARCHSPINE:BEGIN -->/);
  });

  it('injects minimal scripts without overriding existing script entries', () => {
    const packagePath = path.join(testDir, 'package.json');
    fs.writeFileSync(
      packagePath,
      JSON.stringify(
        {
          name: 'demo',
          scripts: {
            test: 'vitest run',
            'spine:sync': 'custom-sync',
          },
        },
        null,
        2,
      ),
    );

    const result = injectArchSpineScripts(testDir);

    expect(result.status).toBe('updated');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts['spine:init']).toBe('npx --yes archspine@latest init');
    expect(pkg.scripts['spine:publish']).toBe('npx --yes archspine@latest publish');
    expect(pkg.scripts['spine:check']).toBe('npx --yes archspine@latest check');
    expect(pkg.scripts['spine:fix']).toBe('npx --yes archspine@latest fix');
    expect(pkg.scripts['spine:sync']).toBe('custom-sync');
  });

  it('supports alternate instructions filenames such as CLAUDE.md', () => {
    const result = syncAgentInstructionsFile(testDir, 'CLAUDE.md');

    expect(result.status).toBe('created');
    const content = fs.readFileSync(path.join(testDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('<!-- ARCHSPINE:BEGIN -->');
  });

  it('creates a search ignore file that excludes generated .spine outputs', () => {
    const result = syncSearchIgnoreFile(testDir);

    expect(result.status).toBe('created');
    const content = fs.readFileSync(path.join(testDir, '.ignore'), 'utf-8');
    expect(content).toContain('.spine/index/');
    expect(content).toContain('.spine/atlas/');
    expect(content).not.toContain('.spine/rules/');
    expect(content).not.toContain('.spine/config.json');
  });

  it('creates a .spineignore template with recommended semantic ignore defaults', () => {
    const result = syncSpineIgnoreFile(testDir);

    expect(result.status).toBe('created');
    const content = fs.readFileSync(path.join(testDir, '.spineignore'), 'utf-8');
    expect(content).toContain('# >>> ArchSpine recommended >>>');
    expect(content).toContain(
      'Human-facing repository docs usually already have an authoritative readable form.',
    );
    expect(content).toContain('.env');
    expect(content).toContain('.env.*');
    expect(content).toContain('*.pem');
    expect(content).toContain('*.key');
    expect(content).toContain('docs/');
    expect(content).toContain('README.md');
    expect(content).toContain('CONTRIBUTING.md');
    expect(content).toContain('SECURITY.md');
    expect(content).toContain('docs/.vitepress/dist/');
    expect(content).toContain('externaldocs/');
    expect(content).toContain('!.github/workflows/');
    expect(content).toContain('.next/');
    expect(content).not.toContain('package.json');
  });

  it('creates a local-first .gitignore block that ignores runtime and generated snapshot outputs', () => {
    const result = syncGitIgnoreFile(testDir, 'local');

    expect(result.status).toBe('created');
    const content = fs.readFileSync(path.join(testDir, '.gitignore'), 'utf-8');
    expect(content).toContain('.spine/cache.db*');
    expect(content).toContain('.spine/.lock');
    expect(content).toContain('.spine/secrets.json');
    expect(content).toContain('secrets.json');
    expect(content).toContain('.spine/index/');
    expect(content).toContain('.spine/atlas/');
    expect(content).toContain('.spine/manifest.json');
  });

  it('updates .gitignore managed block when switching to distributable strategy', () => {
    syncGitIgnoreFile(testDir, 'local');

    const result = syncGitIgnoreFile(testDir, 'distributable');

    expect(result.status).toBe('updated');
    const content = fs.readFileSync(path.join(testDir, '.gitignore'), 'utf-8');
    expect(content).toContain('.spine/cache.db*');
    expect(content).toContain('.spine/secrets.json');
    expect(content).toContain('secrets.json');
    expect(content).not.toContain('.spine/index/');
    expect(content).not.toContain('.spine/atlas/');
  });

  it('appends a .gitattributes managed block without overwriting user content', () => {
    const attrsPath = path.join(testDir, '.gitattributes');
    fs.writeFileSync(attrsPath, '*.png binary\n');

    const result = syncGitAttributesFile(testDir);

    expect(result.status).toBe('appended');
    const content = fs.readFileSync(attrsPath, 'utf-8');
    expect(content).toContain('*.png binary');
    expect(content).toContain('.spine/index/** linguist-generated=true');
    expect(content).toContain('.spine/atlas/** linguist-generated=true');
  });

  it('removes only the managed ArchSpine block from an instructions file', () => {
    const hostPath = path.join(testDir, 'AGENTS.md');
    fs.writeFileSync(
      hostPath,
      [
        '# Team Guide',
        '',
        '<!-- ARCHSPINE:BEGIN -->',
        'legacy',
        '<!-- ARCHSPINE:END -->',
        '',
        'Keep this section.',
      ].join('\n'),
    );

    const result = removeManagedAgentInstructionsFile(testDir, 'AGENTS.md', false);

    expect(result.status).toBe('updated');
    const content = fs.readFileSync(hostPath, 'utf-8');
    expect(content).toContain('# Team Guide');
    expect(content).toContain('Keep this section.');
    expect(content).not.toContain('ARCHSPINE:BEGIN');
  });

  it('deletes an ArchSpine-created instructions file when removal leaves it empty', () => {
    syncAgentInstructionsFile(testDir, 'AGENTS.md');

    const result = removeManagedAgentInstructionsFile(testDir, 'AGENTS.md', true);

    expect(result.status).toBe('deleted');
    expect(fs.existsSync(path.join(testDir, 'AGENTS.md'))).toBe(false);
  });

  it('removes tracked ArchSpine scripts without touching custom script overrides', () => {
    const packagePath = path.join(testDir, 'package.json');
    fs.writeFileSync(
      packagePath,
      JSON.stringify(
        {
          name: 'demo',
          scripts: {
            'spine:init': 'npx --yes archspine@latest init',
            'spine:sync': 'custom-sync',
            'spine:check': 'npx --yes archspine@latest check',
            test: 'vitest run',
          },
        },
        null,
        2,
      ),
    );

    const result = removeArchSpineScripts(testDir, ['spine:init', 'spine:sync', 'spine:check']);

    expect(result.status).toBe('updated');
    expect(result.removedScripts).toEqual(['spine:init', 'spine:check']);
    expect(result.skippedScripts).toEqual(['spine:sync']);
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.test).toBe('vitest run');
    expect(pkg.scripts['spine:sync']).toBe('custom-sync');
    expect(pkg.scripts['spine:init']).toBeUndefined();
  });

  it('removes managed .ignore content while preserving unrelated user entries', () => {
    const ignorePath = path.join(testDir, '.ignore');
    fs.writeFileSync(
      ignorePath,
      [
        '.spine/index/',
        '.spine/atlas/',
        '.spine/cache.db*',
        '.spine/.lock',
        '.spine/diagnostics/',
        'dist/',
      ].join('\n'),
    );

    const result = removeManagedSearchIgnoreFile(testDir, false);

    expect(result.status).toBe('updated');
    const content = fs.readFileSync(ignorePath, 'utf-8');
    expect(content.trim()).toBe('dist/');
  });

  it('removes only the managed .gitignore block while preserving unrelated entries', () => {
    const ignorePath = path.join(testDir, '.gitignore');
    fs.writeFileSync(ignorePath, 'dist/\n');
    syncGitIgnoreFile(testDir, 'distributable');

    const result = removeManagedGitIgnoreFile(testDir, false);

    expect(result.status).toBe('updated');
    const content = fs.readFileSync(ignorePath, 'utf-8');
    expect(content.trim()).toBe('dist/');
  });

  it('removes only the managed .spineignore block while preserving unrelated entries', () => {
    const ignorePath = path.join(testDir, '.spineignore');
    fs.writeFileSync(ignorePath, 'benchmarks/\n');
    syncSpineIgnoreFile(testDir);

    const result = removeManagedSpineIgnoreFile(testDir, false);

    expect(result.status).toBe('updated');
    const content = fs.readFileSync(ignorePath, 'utf-8');
    expect(content.trim()).toBe('benchmarks/');
  });

  it('deletes an ArchSpine-created .spineignore file when removal leaves it empty', () => {
    syncSpineIgnoreFile(testDir);

    const result = removeManagedSpineIgnoreFile(testDir, true);

    expect(result.status).toBe('deleted');
    expect(fs.existsSync(path.join(testDir, '.spineignore'))).toBe(false);
  });

  it('deletes an ArchSpine-created .gitattributes file when removal leaves it empty', () => {
    syncGitAttributesFile(testDir);

    const result = removeManagedGitAttributesFile(testDir, true);

    expect(result.status).toBe('deleted');
    expect(fs.existsSync(path.join(testDir, '.gitattributes'))).toBe(false);
  });

  it('repository bootstrap honors distributable artifact strategy without interactive selection', async () => {
    const config = new Config(testDir);

    await runRepositoryBootstrap({
      rootDir: testDir,
      config,
      runtimeService: {} as any,
      printStep: () => {},
      artifactStrategyArg: 'distributable',
      promptForImmediateConfirmation: async () => false,
    });

    const gitIgnore = fs.readFileSync(path.join(testDir, '.gitignore'), 'utf-8');
    const gitAttributes = fs.readFileSync(path.join(testDir, '.gitattributes'), 'utf-8');
    const spineIgnore = fs.readFileSync(path.join(testDir, '.spineignore'), 'utf-8');

    expect(config.getArtifactStrategy()).toBe('distributable');
    expect(config.getInitArtifactStrategy()).toBe('distributable');
    expect(config.isSpineIgnoreManaged()).toBe(true);
    expect(config.isSpineIgnoreCreatedByArchSpine()).toBe(true);
    expect(gitIgnore).toContain('.spine/cache.db*');
    expect(gitIgnore).not.toContain('.spine/index/');
    expect(gitAttributes).toContain('.spine/index/** linguist-generated=true');
    expect(gitAttributes).toContain('.spine/atlas/** linguist-generated=true');
    expect(spineIgnore).toContain('.env');
    expect(spineIgnore).toContain('*.pem');
    expect(spineIgnore).toContain('docs/.vitepress/dist/');
  });
});
