/**
 * Prints the general help message for the ArchSpine CLI.
 */
export function printGeneralHelp() {
  console.log(`
Usage:
  spine <command> [options]

Setup & Config:
  try            Read-only preview of the current repository's ArchSpine posture
  init           Initialize Spine configuration in current directory
  llm            Manage global or project LLM settings (defaults to global)
  hook           Enable or disable Git pre-commit synchronization
                 Advanced: set hook sync strategy with 'spine hook set-mode <hook|standard|heavy>'
  config         Read or write persisted configuration values
  languages      Show or update configured documentation languages
  view           Show, update, or manually generate the enabled experimental view set
  remove         Remove .spine state and ArchSpine-managed Git hook block
                 Add --yes to skip the confirmation prompt

Analysis:
  build          Build the heavy semantic mirror baseline for a new repo or full recovery
  sync           Sync machine index/runtime state (incremental JSON refresh by default)
                 Use 'spine build' for heavy baseline regeneration; add --hook to run the hook-oriented index refresh path
                 Use 'spine sync --retry-failed' for narrow sync recovery and 'spine publish' when Atlas docs need backfill
  status         Check sync status of the repository
  history        View the semantic drift history of a specific file
  scan --dry-run Preview the effective scan boundary and ignore chain

Governance:
  check          Audit project against architecture rules
  fix            Auto-fix for rule violations (add --yes to skip prompts, --dry-run to preview)
  repo           Repository-level lifecycle management
                 Use 'spine repo check' to detect drift between config and managed Git files
                 Use 'spine repo strategy set <local|distributable>' to migrate artifact strategy

Infrastructure:
  mcp start      Start the read-only Model Context Protocol (MCP) server
  info           Show workspace configuration, sync, and protocol summary
  usage          Show LLM token consumption and cost report
  publish        Refresh the canonical .spine distributable snapshot for Git distribution
                 Runs lightweight index refresh + markdown backfill and prints maintainer-oriented publish guidance
  god            Human-only joke mode that emits one giant <repo>-god.md
                 Add --yes to skip the confirmation prompt

Environment:
  SPINE_PROVIDER    Fallback LLM provider when project config is unset
  SPINE_API_KEY     Your API key
  SPINE_MODEL       Fallback model when project config is unset
  SPINE_BASE_URL    Fallback base URL when project config is unset
  SPINE_MODE        Fallback high-level runtime mode (standard|heavy)
  SPINE_PRECOMMIT   Override pre-commit sync toggle (true/false)
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

Runs an incremental sync by default.
Use 'spine build' for a full baseline rebuild, --hook for the pre-commit-oriented index refresh path,
or --repair-violations to repair protected generated outputs and escalate to a build only when policy requires it.
Use --retry-failed to re-run failed summarization/state-commit files from the latest sync checkpoint.
If the .spine/index/ baseline already exists and only Atlas docs are stale or missing, prefer 'spine publish' instead of retrying sync.
      `);
      break;
    case 'build':
      console.log(`
Usage:
  spine build

Builds the heavy semantic mirror baseline for new repositories, major semantic shifts, runtime recovery,
and any situation where ArchSpine needs to rebuild the trusted .spine baseline from scratch.
      `);
      break;
    case 'publish':
      console.log(`
Usage:
  spine publish

Refreshes the canonical distributable snapshot (.spine/index/**, .spine/atlas/**, and enabled .spine/view/** outputs) for Git distribution.
This runs a lightweight sync for JSON refresh, then attempts markdown backfill when text-generation is available, requires an existing .spine runtime baseline, and fails closed if .spine/.lock is present.
Prefer this command when the .spine/index/ baseline is already present and you mainly need Atlas backfill; use 'spine sync --retry-failed' when the sync pipeline itself failed on a limited file set.
Emits a warning if the current artifact strategy is 'local' (snapshots are gitignored; committing them conflicts with that strategy).
      `);
      break;
    case 'god':
      console.log(`
Usage:
  spine god [--yes]

Runs the human-only god mode and overwrites .spine/<repo>-god.md.
This mode is intentionally not for production workflows.
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

Audits the project against architecture rules defined in .spine/rules/.
      `);
      break;
    case 'fix':
      console.log(`
Usage:
  spine fix [--yes] [--dry-run]

(Experimental) Auto-fix for the currently active rule violations.
Add --yes to skip confirmation prompts. Add --dry-run to preview proposed diffs without applying them.
Run 'spine check' first to detect violations before running 'spine fix'.
      `);
      break;
    case 'usage':
      console.log(`
Usage:
  spine usage

Show LLM token consumption and cost report over time.
      `);
      break;
    case 'info':
      console.log(`
Usage:
  spine info [--verbose]

Show workspace configuration, sync status, and protocol summary.
Use --verbose to see detailed runtime resolution behind the current mode.
      `);
      break;
    case 'config':
      console.log(`
Usage:
  spine config <get|set> <key> [value]

Read or write persisted configuration values in .spine/config.json.
      `);
      break;
    case 'status':
      console.log(`
Usage:
  spine status

Check the sync status of the repository to see how many files are pending or synced.
      `);
      break;
    case 'history':
      console.log(`
Usage:
  spine history <file_path>

View the semantic drift history of a specific file. This command reads from the local
drift database and visually outlines what responsibilities and roles were added or removed over time.
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
    case 'hook':
      console.log(`
Usage:
  spine hook [on|off|should-run|run|set-mode]

Use 'on' to install or refresh the managed Git hook block.
Use 'off' to disable sync and remove the managed Git hook block.
Use 'set-mode' to control whether the hook runs hook, standard, or heavy sync behavior.
      `);
      break;
    case 'languages':
      console.log(`
Usage:
  spine languages [show|set]

Use 'show' to print configured documentation languages and the latest language snapshot.
Use 'set' to reopen the interactive language selector.
      `);
      break;
    case 'view':
      console.log(`
    Usage:
    spine view [show|set|enable|disable|describe|generate]

    Use 'show' to print experimental view status and the currently enabled views.
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
  spine llm --project set mode heavy
  spine llm --global clear api-key

Default surface:
  Use 'mode' as the normal control surface.

Advanced commands:
  Advanced overrides still exist, but are intentionally hidden from the default help path.
  Check the official RUNBOOK for details.
      `);
      break;
    case 'mcp':
      console.log(`
Usage:
  spine mcp start

Starts the Model Context Protocol (MCP) server on STDIO for IDE integration (e.g. Claude Desktop, Cursor).
MCP is read-only and does not write \`.spine\` protocol artifacts.
      `);
      break;
    default:
      printGeneralHelp();
  }
}
