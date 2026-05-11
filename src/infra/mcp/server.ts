import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
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
    const manifest = Manifest.open(rootDir, { readonly: true });
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
          prompts: {},
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

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'architectural_context',
            description:
              "Get the architectural context for a file before modifying it. Use this prompt template when you need to understand a file's role, dependencies, and constraints before making changes.",
            arguments: [
              {
                name: 'filePath',
                description: 'Relative file path to get context for (e.g. src/services/foo.ts)',
                required: true,
              },
            ],
          },
          {
            name: 'pre_write_checklist',
            description:
              'Run a safety checklist before writing to a file. Use this prompt template when you are about to create, modify, or delete a file and want to check architectural constraints first.',
            arguments: [
              {
                name: 'filePath',
                description: 'Relative file path to check',
                required: true,
              },
              {
                name: 'operation',
                description:
                  'The operation you plan to perform (read, write, delete, rename, import)',
                required: true,
              },
              {
                name: 'importTarget',
                description: 'Required when operation is "import": the file being imported',
                required: false,
              },
            ],
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const promptName = request.params.name;
      const promptArgs = request.params.arguments || {};

      if (promptName === 'architectural_context') {
        const filePath = promptArgs.filePath as string;
        if (!filePath) {
          throw new Error('filePath is required for architectural_context prompt');
        }
        return {
          description: `Architectural context for ${filePath}`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `You are about to modify the file "${filePath}". Before making changes, you should understand its architectural context.

1. First, call spine_get_file_context with filePath="${filePath}" to understand what this file does and what rules apply.
2. Then, call spine_get_change_impact with file="${filePath}" to understand what other modules depend on this file.
3. Finally, call spine_check_operation with filePath="${filePath}" and operation="write" to check for any rule violations.

Only after completing these three checks should you proceed with the modification.`,
              },
            },
          ],
        };
      }

      if (promptName === 'pre_write_checklist') {
        const filePath = promptArgs.filePath as string;
        const operation = promptArgs.operation as string;
        const importTarget = promptArgs.importTarget as string | undefined;

        if (!filePath || !operation) {
          throw new Error('filePath and operation are required for pre_write_checklist prompt');
        }

        let checklist = `You are about to perform "${operation}" on "${filePath}". Run this safety checklist:\n\n`;

        checklist += `1. Call spine_check_operation with filePath="${filePath}", operation="${operation}"`;
        if (importTarget) {
          checklist += `, importTarget="${importTarget}"`;
        }
        checklist += `\n   → Check if the operation is allowed. If violations are returned, do NOT proceed.\n\n`;

        checklist += `2. Call spine_get_file_context with filePath="${filePath}"\n`;
        checklist += `   → Read the file's role, responsibilities, and matching architectural rules.\n\n`;

        if (operation === 'write' || operation === 'delete') {
          checklist += `3. Call spine_get_change_impact with file="${filePath}"\n`;
          checklist += `   → Understand what other modules will be affected by this change.\n\n`;
        }

        checklist += `Only proceed with the operation if all checks pass without violations.`;

        return {
          description: `Pre-write checklist for ${operation} on ${filePath}`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: checklist,
              },
            },
          ],
        };
      }

      throw new Error(`Unknown prompt: ${promptName}`);
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
