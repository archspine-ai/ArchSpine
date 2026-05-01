import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SpineResources } from './resources.js';
import { SpineTools } from './tools.js';
import { Manifest } from '../manifest.js';
import { Config } from '../config.js';
import { MCPContextGate } from './context.js';
import { toArchSpineError, ErrorCodes } from '../../core/errors.js';
import { CURRENT_PACKAGE_VERSION } from '../../types/protocol.js';

export class ArchSpineMCPServer {
  private server: Server;
  private resources: SpineResources;
  private toolsManager: SpineTools;

  constructor(rootDir: string) {
    const manifest = Manifest.open(rootDir);
    const config = new Config(rootDir);
    const contextGate = new MCPContextGate(config.getMCPContextMode());
    this.resources = new SpineResources(rootDir, contextGate);
    this.toolsManager = new SpineTools(rootDir, manifest, contextGate);

    this.server = new Server(
      {
        name: 'archspine-mcp',
        version: CURRENT_PACKAGE_VERSION,
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'spine://project',
            name: 'Project Architecture topology',
            mimeType: 'application/json',
            description: 'Get the full project-level architecture overview.',
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      try {
        const resource = await this.resources.getResource(request.params.uri);
        return {
          contents: [
            {
              uri: resource.uri,
              mimeType: 'application/json',
              text: resource.text,
            },
          ],
        };
      } catch (error: unknown) {
        const wrapped = toArchSpineError(
          error,
          ErrorCodes.McpReadFailed,
          'Failed to read resource.',
          { context: { uri: request.params.uri } },
        );
        throw new Error(`[${wrapped.code}] ${wrapped.message}`);
      }
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.toolsManager.getToolDefinitions(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const toolArgs = request.params.arguments || {};
      let resultText = '';
      try {
        resultText = await this.toolsManager.executeTool(toolName, toolArgs);
      } catch (error) {
        const wrapped = toArchSpineError(
          error,
          ErrorCodes.McpToolExecutionFailed,
          `Failed to execute MCP tool '${toolName}'.`,
          { context: { toolName } },
        );
        throw new Error(`[${wrapped.code}] ${wrapped.message}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: resultText,
          },
        ],
      };
    });
  }

  public async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // eslint-disable-next-line no-console -- MCP protocol requires logging on stderr
    console.error('ArchSpine MCP Server started on STDIO');
  }
}
