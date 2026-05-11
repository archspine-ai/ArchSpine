import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface McpResolvedCommand {
  command: string;
  resolveArgs: string[];
}

export interface ToolConfig {
  name: string;
  configPath: string;
}

export interface SetupResultItem {
  name: string;
  status: 'configured' | 'failed';
  configPath: string;
  error?: string;
}

export interface SetupResult {
  resolvedCommand: McpResolvedCommand;
  tools: ToolConfig[];
  alreadyConfigured: ToolConfig[];
  results: SetupResultItem[];
  /** Snapshot of which config files already existed before any writes. */
  configFileExisted: Record<string, boolean>;
}

// ---------------------------------------------------------------------------
// Command resolution
// ---------------------------------------------------------------------------

/** Resolve the archspine command to embed in MCP configs. */
export function resolveArchSpineCommand(dir: string): McpResolvedCommand {
  const localDist = path.join(dir, 'node_modules', '.bin', 'archspine');
  if (fs.existsSync(localDist)) {
    return { command: localDist, resolveArgs: [] };
  }
  const localTs = path.join(dir, 'dist', 'cli', 'index.js');
  if (fs.existsSync(localTs)) {
    return { command: 'node', resolveArgs: [localTs] };
  }
  return { command: 'npx', resolveArgs: ['--yes', 'archspine@latest'] };
}

export function formatResolvedCommand(resolved: McpResolvedCommand): string {
  return [resolved.command, ...resolved.resolveArgs].join(' ');
}

// ---------------------------------------------------------------------------
// Tool detection
// ---------------------------------------------------------------------------

export function detectTools(repoPath: string): ToolConfig[] {
  const results: ToolConfig[] = [];

  // Claude Code
  results.push({
    name: 'Claude Code (project)',
    configPath: path.join(repoPath, '.mcp.json'),
  });
  results.push({
    name: 'Claude Code (global)',
    configPath: path.join(os.homedir(), '.claude', 'mcp.json'),
  });

  // Claude Desktop
  if (process.platform === 'darwin') {
    results.push({
      name: 'Claude Desktop',
      configPath: path.join(
        os.homedir(),
        'Library',
        'Application Support',
        'Claude',
        'claude_desktop_config.json',
      ),
    });
  } else if (process.platform === 'win32') {
    results.push({
      name: 'Claude Desktop',
      configPath: path.join(
        process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
        'Claude',
        'claude_desktop_config.json',
      ),
    });
  }

  // Cursor
  results.push({
    name: 'Cursor',
    configPath: path.join(os.homedir(), '.cursor', 'mcp.json'),
  });

  return results;
}

// ---------------------------------------------------------------------------
// Config file I/O
// ---------------------------------------------------------------------------

/** Write (or update) an MCP config file, inserting the archspine server entry. */
export function writeMcpConfig(configPath: string, resolved: McpResolvedCommand): void {
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  let existing: Record<string, unknown> = {};
  if (fs.existsSync(configPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {
      // Corrupt file — start fresh.
    }
  }

  const mcpServers = (existing.mcpServers as Record<string, unknown>) || {};
  mcpServers['archspine'] = {
    command: resolved.command,
    args: [...resolved.resolveArgs, 'mcp', 'start'],
  };

  existing.mcpServers = mcpServers;
  fs.writeFileSync(configPath, JSON.stringify(existing, null, 2) + '\n');
}

/** Detect which tool configs already contain an archspine MCP entry. */
export function detectExistingMcpConfigs(tools: ToolConfig[]): ToolConfig[] {
  return tools.filter((t) => {
    if (!fs.existsSync(t.configPath)) {
      return false;
    }
    try {
      const raw = JSON.parse(fs.readFileSync(t.configPath, 'utf-8'));
      const servers = raw.mcpServers as Record<string, unknown> | undefined;
      return servers !== undefined && 'archspine' in servers;
    } catch {
      return false;
    }
  });
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

/** Run the full MCP setup: resolve command, detect tools, write configs. */
export function setupMcpConfigs(rootDir: string): SetupResult {
  const resolvedCommand = resolveArchSpineCommand(rootDir);
  const tools = detectTools(rootDir);
  const alreadyConfigured = detectExistingMcpConfigs(tools);

  // Snapshot which config files already existed before we write to them.
  const configFileExisted: Record<string, boolean> = {};
  for (const tool of tools) {
    configFileExisted[tool.configPath] = fs.existsSync(tool.configPath);
  }

  const results: SetupResultItem[] = [];
  for (const tool of tools) {
    try {
      writeMcpConfig(tool.configPath, resolvedCommand);
      results.push({ name: tool.name, status: 'configured', configPath: tool.configPath });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      results.push({ name: tool.name, status: 'failed', configPath: tool.configPath, error });
    }
  }

  return { resolvedCommand, tools, alreadyConfigured, results, configFileExisted };
}
