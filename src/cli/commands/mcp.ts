import { ArchSpineMCPServer } from '../../infra/mcp/server.js';
import { setupMcpConfigs, formatResolvedCommand } from '../../infra/mcp/setup.js';
import { Config } from '../../infra/config.js';
import { throwCliUsage } from '../cli-utils.js';

export interface ExecuteMcpCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
}

// ---- MCP Start ----

export async function executeMcpStart(rootDir: string): Promise<void> {
  const mcpServer = new ArchSpineMCPServer(rootDir);
  await mcpServer.start();
  // Keep process running for STDIO communication
}

// ---- MCP Setup ----

export async function executeMcpSetup(rootDir: string): Promise<void> {
  const output = setupMcpConfigs(rootDir);
  const { resolvedCommand, tools, alreadyConfigured, results } = output;

  console.log('ArchSpine MCP Setup');
  console.log('===================');
  console.log('');
  console.log(`Resolved command: ${formatResolvedCommand(resolvedCommand)}`);
  console.log('');

  if (alreadyConfigured.length > 0) {
    console.log('Already configured:');
    for (const t of alreadyConfigured) {
      console.log(`  ✅ ${t.name} (${t.configPath})`);
    }
    console.log('');
  }

  console.log('Available targets:');
  for (const tool of tools) {
    const configExisted = output.configFileExisted[tool.configPath] ?? false;
    const hasArchSpine = alreadyConfigured.includes(tool);
    const marker = hasArchSpine
      ? '✅ (already configured)'
      : configExisted
        ? '📝 (will update)'
        : '🆕 (new file)';
    console.log(`  ${marker} ${tool.name}`);
    console.log(`       Config: ${tool.configPath}`);
  }

  console.log('');
  console.log('Writing configurations...');

  console.log('');
  for (const r of results) {
    const icon = r.status === 'configured' ? '✅' : '❌';
    console.log(`  ${icon} ${r.name}: ${r.configPath}`);
    if (r.error) {
      console.log(`       Error: ${r.error}`);
    }
  }

  console.log('');
  console.log('Next steps:');
  console.log('  1. Restart your IDE / Claude Desktop for changes to take effect');
  console.log('  2. Verify the connection: look for "archspine" in MCP server list');
  console.log('  3. Try an MCP tool: ask your agent "what modules are in this project?"');
  console.log('');
  console.log('To remove a configuration, manually edit the config file listed above.');
}

// ---- Main dispatch ----

export async function executeMcpCommand({
  args,
  rootDir,
  config: _config,
}: ExecuteMcpCommandOptions): Promise<void> {
  if (args[0] === 'start') {
    await executeMcpStart(rootDir);
  } else if (args[0] === 'setup') {
    await executeMcpSetup(rootDir);
  } else if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage:
  spine mcp <start|setup>

  spine mcp start   Start the MCP server on STDIO for IDE integration.
  spine mcp setup   Auto-detect and configure MCP for Claude Code, Claude Desktop, or Cursor.
`);
  } else {
    throwCliUsage('Usage: spine mcp <start|setup>');
  }
}
