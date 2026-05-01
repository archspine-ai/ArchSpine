import * as fs from 'fs';
import * as path from 'path';
import { FileSystemManager } from './fs.js';

export type InstallGitHookResult =
  | { status: 'installed' | 'updated' | 'appended' | 'standardized' }
  | {
      status: 'skipped-no-git-root';
      message: string;
    };

function getManagedHookBlock(): string {
  return [
    '# >>> ArchSpine pre-commit >>>',
    '# Spine Pre-commit Hook — delegated to ArchSpine config resolution',
    'if [ -x "./node_modules/.bin/spine" ]; then',
    '  SPINE_CMD="./node_modules/.bin/spine"',
    'elif command -v spine >/dev/null 2>&1; then',
    '  SPINE_CMD="spine"',
    'elif [ -f "dist/cli/index.js" ]; then',
    '  SPINE_CMD="node dist/cli/index.js"',
    'else',
    '  echo "Spine: CLI entrypoint not found. Skipping pre-commit sync."',
    '  exit 0',
    'fi',
    'PRE_COMMIT_ENABLED=$($SPINE_CMD hook should-run 2>/dev/null)',
    'if [ "$PRE_COMMIT_ENABLED" = "false" ]; then',
    '  exit 0',
    'fi',
    'echo "Spine: 正在同步语义镜像中..."',
    '$SPINE_CMD hook run',
    'git add .spine/',
    'echo "Spine: 同步完成并已自动暂存 .spine/ 目录。"',
    '# <<< ArchSpine pre-commit <<<',
    '',
  ].join('\n');
}

function getManagedHookPattern(): RegExp {
  return /# >>> ArchSpine pre-commit >>>[\s\S]*?# <<< ArchSpine pre-commit <<<\n?/g;
}

function isEffectivelyEmptyHook(content: string): boolean {
  const normalized = content.replace(/^#![^\n]*\n?/, '').trim();
  return normalized.length === 0;
}

export function installGitHook(): InstallGitHookResult {
  const hookDir = path.join(process.cwd(), '.git', 'hooks');
  if (!fs.existsSync(hookDir)) {
    return {
      status: 'skipped-no-git-root',
      message: [
        'ArchSpine Git hook setup requires a Git repository root.',
        "If this project is already a Git repo, cd to the repository root and rerun 'spine init'.",
        "If this directory is not a Git repo yet, run 'git init' first, then rerun 'spine init'.",
      ].join('\n'),
    };
  }
  const hookPath = path.join(hookDir, 'pre-commit');
  const hookBlock = getManagedHookBlock();

  if (fs.existsSync(hookPath)) {
    const currentHook = fs.readFileSync(hookPath, 'utf-8');
    if (
      currentHook.includes('# >>> ArchSpine pre-commit >>>') &&
      currentHook.includes('# <<< ArchSpine pre-commit <<<')
    ) {
      const updatedHook = currentHook.replace(
        /# >>> ArchSpine pre-commit >>>[\s\S]*?# <<< ArchSpine pre-commit <<</,
        hookBlock.trimEnd(),
      );
      FileSystemManager.backupFile(hookPath);
      FileSystemManager.safeWriteFile(
        hookPath,
        updatedHook.endsWith('\n') ? updatedHook : `${updatedHook}\n`,
      );
      fs.chmodSync(hookPath, 0o755);
      return { status: 'updated' };
    } else if (
      !currentHook.includes('hook run') &&
      !currentHook.includes('node dist/index.js sync')
    ) {
      FileSystemManager.backupFile(hookPath);
      const separator = currentHook.endsWith('\n') ? '' : '\n';
      fs.appendFileSync(hookPath, `${separator}${hookBlock}`);
      fs.chmodSync(hookPath, 0o755);
      return { status: 'appended' };
    } else {
      const migratedHook = currentHook
        .replace(/# Spine Pre-commit Hook[^\n]*\n?/g, '')
        .replace(
          /if grep -q '"enablePreCommit": false' \.spine\/config\.json 2>\/dev\/null; then\n {2}exit 0\nfi\n?/g,
          '',
        )
        .replace(
          /PRE_COMMIT_ENABLED=\$\(node -e "[\s\S]*?" 2>\/dev\/null\)\n\nif \[ "\$PRE_COMMIT_ENABLED" = "false" \]; then\n {2}exit 0\nfi\n\n?/g,
          '',
        )
        .replace(
          /if \[ -x "\.\/node_modules\/\.bin\/spine" \]; then\n {2}SPINE_CMD="\.\/node_modules\/\.bin\/spine"\nelif command -v spine >\/dev\/null 2>&1; then\n {2}SPINE_CMD="spine"\nelif \[ -f "dist\/cli\/index\.js" \]; then\n {2}SPINE_CMD="node dist\/cli\/index\.js"\nelse\n {2}echo "Spine: CLI entrypoint not found\. Skipping pre-commit sync\."\n {2}exit 0\nfi\nPRE_COMMIT_ENABLED=\$\(\$SPINE_CMD hook should-run 2>\/dev\/null\)\nif \[ "\$PRE_COMMIT_ENABLED" = "false" \]; then\n {2}exit 0\nfi\n?/g,
          '',
        )
        .replace(
          /echo "Spine: 正在同步语义镜像中\.\.\."\nnode dist\/index\.js sync\ngit add \.spine\/\necho "Spine: 同步完成并已自动暂存 \.spine\/ 目录。"\n?/g,
          '',
        )
        .replace(
          /echo "Spine: 正在同步语义镜像中\.\.\."\nnode dist\/cli\/index\.js sync\ngit add \.spine\/\necho "Spine: 同步完成并已自动暂存 \.spine\/ 目录。"\n?/g,
          '',
        )
        .replace(
          /echo "Spine: 正在同步语义镜像中\.\.\."\nnode dist\/cli\/index\.js sync --hook\ngit add \.spine\/\necho "Spine: 同步完成并已自动暂存 \.spine\/ 目录。"\n?/g,
          '',
        )
        .replace(
          /echo "Spine: 正在同步语义镜像中\.\.\."\n(?:\.\/node_modules\/\.bin\/spine|spine|node dist\/cli\/index\.js) hook run\ngit add \.spine\/\necho "Spine: 同步完成并已自动暂存 \.spine\/ 目录。"\n?/g,
          '',
        );

      const separator = migratedHook.endsWith('\n') || migratedHook.length === 0 ? '' : '\n';
      const updatedHook = `${migratedHook}${separator}${hookBlock}`;
      FileSystemManager.backupFile(hookPath);
      FileSystemManager.safeWriteFile(hookPath, updatedHook);
      fs.chmodSync(hookPath, 0o755);
      return { status: 'standardized' };
    }
  } else {
    fs.writeFileSync(hookPath, `#!/bin/sh\n${hookBlock}`, { mode: 0o755 });
    return { status: 'installed' };
  }
}

export function uninstallGitHook(): boolean {
  const hookPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
  if (!fs.existsSync(hookPath)) {
    return false;
  }

  const currentHook = fs.readFileSync(hookPath, 'utf-8');
  if (
    !currentHook.includes('# >>> ArchSpine pre-commit >>>') ||
    !currentHook.includes('# <<< ArchSpine pre-commit <<<')
  ) {
    return false;
  }

  const updatedHook = currentHook.replace(getManagedHookPattern(), '');
  FileSystemManager.backupFile(hookPath);

  if (isEffectivelyEmptyHook(updatedHook)) {
    fs.unlinkSync(hookPath);
  } else {
    FileSystemManager.safeWriteFile(
      hookPath,
      updatedHook.endsWith('\n') ? updatedHook : `${updatedHook}\n`,
    );
    fs.chmodSync(hookPath, 0o755);
  }

  return true;
}
