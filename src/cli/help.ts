import { getDashboardData } from '../services/dashboard-service.js';

/**
 * Print the ArchSpine product dashboard when invoked with no arguments.
 */
export function printDashboard(rootDir: string): void {
  const data = getDashboardData(rootDir);

  const statusLine = data.hasSpine ? `  同步状态：${data.lastSync}` : '';
  const viewsLine = data.hasSpine
    ? `  已启视图：${data.enabledViews.length > 0 ? data.enabledViews.join(', ') : '(暂无)'}`
    : '';
  const rulesLine = data.hasSpine
    ? `  活跃规则：${data.rulesCount > 0 ? `${data.rulesCount} 条` : '0 条'}`
    : '';

  console.log(`
  ╭─────────────────────────────────────────────╮
  │           🏗️  ArchSpine                      │
  │      AI Agent 的架构记忆体                    │
  ╰─────────────────────────────────────────────╯

  ${data.hasSpine ? `📦 .spine/ 已就绪${statusLine}${viewsLine}${rulesLine}` : '📦 .spine/ 未初始化，请运行 spine init'}

  ├─ 快速入口 ─────────────────────────────
  │ spine scan --quick    30 秒快速扫描（无需 LLM）
  │ spine sync            增量语义同步
  │ spine view serve      Web 仪表板（端口 7899）
  │ spine mcp setup       配置 MCP 连接
  │ spine --help          查看全部命令
  └───────────────────────────────────────────

  MCP 工具：20 个 · 视图：6 个 · 规则模板：5 个
  更多：https://github.com/archspine-ai/archspine
  `);
}

/**
 * Prints the general help message for the ArchSpine CLI.
 */
export function printGeneralHelp() {
  console.log(`
Usage:
  spine <command> [options]

Getting Started:
  init             Initialize ArchSpine in the current directory
  try              Zero-config preview: see what ArchSpine detects
  scan --dry-run   Preview the effective scan boundary and ignore chain

Daily Use:
  sync             Incremental sync: refresh .spine/index/ and .spine/view/
                   Use --hook for pre-commit, --retry-failed for checkpoint recovery
  check            Audit project against architecture rules
  info             Show workspace configuration, sync status, and protocol summary
  view             Show, update, or manually generate enabled views

MCP Integration:
  mcp setup        One-click MCP connection for Claude Code, Claude Desktop, or Cursor
  mcp start        Start the MCP server on STDIO for IDE integration
  skill            Install or uninstall the ArchSpine Claude Code agent skill

Configuration & Rules:
  config           Read or write persisted configuration values
  llm              Manage global or project LLM settings
  rules            Pre-load architecture rule templates to .spine/rules/
  remove           Remove .spine state and ArchSpine-managed Git hook block

Recovery:
  build            Full rebuild of the semantic mirror baseline (new repos, recovery)

Environment:
  SPINE_PROVIDER         Fallback LLM provider when project config is unset
  SPINE_API_KEY          Your API key
  SPINE_MODEL            Fallback model when project config is unset
  SPINE_BASE_URL         Fallback base URL when project config is unset
  SPINE_PRECOMMIT        Override pre-commit sync toggle (true/false)
`);
}

/**
 * Prints the help message for a specific command.
 * @param cmd The command name to print help for.
 */
export function printCommandHelp(cmd: string) {
  switch (cmd) {
    case 'init':
      console.log(`
Usage:
  spine init [--agent-file <AGENTS.md|CLAUDE.md|GEMINI.md>] [--artifact-strategy <local|distributable>] [--inject-package-scripts|--no-inject-package-scripts]

Initializes ArchSpine in the current repository.
Prompts for documentation languages, rule templates, hook setup, and optional LLM setup.
Optionally injects an Agent instructions file during initialization, chooses how \`.spine\` artifacts are managed in Git,
and can inject optional npx-based helper scripts into package.json.
      `);
      break;
    case 'try':
      console.log(`
Usage:
  spine try

Runs a read-only preview of the current repository's ArchSpine posture.
It reports whether the repo already contains control-plane inputs and distributable snapshots,
then prints explicit next commands without mutating repository state.
      `);
      break;
    case 'sync':
      console.log(`
Usage:
  spine sync [--hook] [--repair-violations] [--retry-failed]

Everyday incremental sync: refreshes .spine/index/, .spine/view/, and agent briefing from changed files.
Use 'spine build' for a full baseline rebuild, --hook for the pre-commit-oriented index refresh path,
or --repair-violations to repair protected generated outputs and escalate to a build only when policy requires it.
Use --retry-failed to re-run failed summarization/state-commit files from the latest sync checkpoint.
      `);
      break;
    case 'build':
      console.log(`
Usage:
  spine build

Full rebuild of the semantic mirror baseline. Use for new repositories, major refactors,
runtime recovery, or whenever the trusted .spine baseline must be rebuilt from scratch.
Uses strict validation and semantic-first generation. For everyday use, prefer 'spine sync'.
      `);
      break;
    case 'scan':
      console.log(`
Usage:
  spine scan --dry-run

Preview the effective scan boundary and ignore chain without persisting anything.
      `);
      break;
    case 'check':
      console.log(`
Usage:
  spine check

Audit the project against architecture rules defined in .spine/rules/.
Uses strict validation by default for thorough analysis.
      `);
      break;
    case 'info':
      console.log(`
Usage:
  spine info [--verbose]

Show workspace configuration, sync status, and protocol summary.
Use --verbose to see detailed runtime resolution.
      `);
      break;
    case 'config':
      console.log(`
Usage:
  spine config <get|set> <key> [value]

Read or write persisted configuration values in .spine/config.json.
      `);
      break;
    case 'remove':
      console.log(`
Usage:
  spine remove [--yes]

Removes .spine state and the ArchSpine-managed Git hook block from your repo.
Add --yes to skip the confirmation prompt.
      `);
      break;
    case 'view':
      console.log(`
    Usage:
    spine view [show|set|enable|disable|describe|generate]

    Use 'show' to print view status and the currently enabled views.
    Use 'set' to reopen the interactive view selector.
    Use 'enable' or 'disable' to toggle a single view id directly.
    Use 'describe' to inspect one registered view.
    Use 'generate' to manually derive the enabled views from the current index without running a full build.
    `);
      break;
    case 'llm':
      console.log(`
Usage:
  spine llm [--global|--project] [show|setup|set|clear|test]

Examples:
  spine llm show
  spine llm show --verbose
  spine llm setup
  spine llm --project set provider openai
  spine llm --global clear api-key

Use 'spine llm set generation-flow <together|json-only>' to control the generation strategy.
      `);
      break;
    case 'skill':
      console.log(`
Usage:
  spine skill <install|uninstall>

Installs or uninstalls the ArchSpine Claude Code agent skill.
When installed, Claude Code agents will automatically consult the .spine/ control plane
when entering repositories that use ArchSpine.

  spine skill install     Install the ArchSpine agent skill to ~/.claude/skills/archspine/
  spine skill uninstall   Remove the ArchSpine agent skill
      `);
      break;
    case 'mcp':
      console.log(`
Usage:
  spine mcp <start|setup>

  spine mcp start   Start the MCP server on STDIO for IDE integration (Claude Desktop, Cursor).
                    MCP is read-only and does not write \`.spine\` protocol artifacts.

  spine mcp setup   Auto-detect and configure MCP for Claude Code, Claude Desktop, or Cursor.
                    Writes the appropriate config files so agents can use ArchSpine MCP tools.
      `);
      break;
    case 'rules':
      console.log(`
Usage:
  spine rules add <template-name>

Adds a pre-built architecture rule template to .spine/rules/.

Available templates:
  no-core-to-cli       Core modules cannot be imported by CLI modules
  no-cross-layer       Strict layer isolation (one-directional dependencies)
  no-circular-deps     Circular dependency detection
  public-surface-stable  Public API surface must remain backward compatible
  test-must-exist      Every module must have adjacent tests
      `);
      break;
    default:
      printGeneralHelp();
  }
}
