import { ArchSpineMCPServer } from '../../infra/mcp/server.js';
import { throwCliUsage } from '../cli-utils.js';

export interface ExecuteMcpCommandOptions {
  args: string[];
  rootDir: string;
}

export async function executeMcpCommand({
  args,
  rootDir,
}: ExecuteMcpCommandOptions): Promise<void> {
  if (args[0] === 'start') {
    const mcpServer = new ArchSpineMCPServer(rootDir);
    await mcpServer.start();
    // Keep process running for STDIO communication
  } else {
    throwCliUsage('Usage: spine mcp start');
  }
}
