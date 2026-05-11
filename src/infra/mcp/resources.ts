import * as fs from 'fs';
import * as path from 'path';
import { MCPContextGate } from './context.js';
import { ArchSpineError, ErrorCodes } from '../../core/errors.js';
import { isCompatibleIndexDocument, readIndexDocument } from '../index-reader.js';

export class SpineResources {
  private spineDir: string;
  private contextGate?: MCPContextGate;
  private readonly spineRootDir: string;

  constructor(rootDir: string, contextGate?: MCPContextGate) {
    this.spineDir = path.join(rootDir, '.spine');
    this.spineRootDir = path.resolve(this.spineDir);
    this.contextGate = contextGate;
  }

  public getResourceTemplates() {
    return [
      {
        uriTemplate: 'spine://project',
        name: 'Project Architecture topology',
        description:
          'Get the full project-level architecture overview and high-level module decomposition.',
      },
      {
        uriTemplate: 'spine://folder/{dirPath}',
        name: 'Folder Level Architecture',
        description: 'Get the architecture and file responsibilities within a specific directory.',
      },
      {
        uriTemplate: 'spine://file/{filePath}',
        name: 'File Semantic Contract',
        description:
          'Get the semantic contract, architectural invariants, and structural skeleton for a specific file.',
      },
      {
        uriTemplate: 'spine://view/{viewType}',
        name: 'View Data',
        description:
          'Get the pre-computed view data for any enabled view type. Supported types: public-surface, risk-hotspots, architecture-diagram, project-health, agent-briefing, change-impact.',
      },
    ];
  }

  public async getResource(uri: string): Promise<{ uri: string; name: string; text: string }> {
    if (uri === 'spine://project') {
      const mdPath = path.join(this.spineDir, 'docs', 'en-US', 'project.md');
      const jsonPath = path.join(this.spineDir, 'index', 'project.json');
      const p = fs.existsSync(mdPath) ? mdPath : jsonPath;
      const resource = this.readAndFormat(uri, 'Project Topology', p);
      this.contextGate?.noteResourceRead(uri);
      return resource;
    } else if (uri.startsWith('spine://folder/')) {
      const accessError = this.contextGate?.requireResourceAccess('folder');
      if (accessError) {
        throw new ArchSpineError(ErrorCodes.McpContextAccessDenied, accessError, {
          context: { uri },
        });
      }
      const folderPath = this.normalizeResourcePath(
        uri,
        uri.substring('spine://folder/'.length),
        'folder path',
      );
      const mdPath = this.resolveSpinePath(uri, 'docs', 'en-US', folderPath, 'folder.md');
      const jsonPath = this.resolveSpinePath(uri, 'index', folderPath, 'folder.json');
      const p = fs.existsSync(mdPath) ? mdPath : jsonPath;
      const resource = this.readAndFormat(uri, `Folder: ${folderPath}`, p);
      this.contextGate?.noteResourceRead(uri);
      return resource;
    } else if (uri.startsWith('spine://file/')) {
      const accessError = this.contextGate?.requireResourceAccess('file');
      if (accessError) {
        throw new ArchSpineError(ErrorCodes.McpContextAccessDenied, accessError, {
          context: { uri },
        });
      }
      const filePath = this.normalizeResourcePath(
        uri,
        uri.substring('spine://file/'.length),
        'file path',
      );
      const p = this.resolveSpinePath(uri, 'index', `${filePath}.json`);
      const resource = this.readAndFormatFile(uri, filePath, p);
      this.contextGate?.noteResourceRead(uri);
      return resource;
    } else if (uri.startsWith('spine://view/')) {
      const viewType = uri.substring('spine://view/'.length);
      const validViews = [
        'public-surface',
        'risk-hotspots',
        'architecture-diagram',
        'project-health',
        'agent-briefing',
        'change-impact',
      ];
      if (!validViews.includes(viewType)) {
        throw new ArchSpineError(
          ErrorCodes.McpResourceInvalidUri,
          `Invalid view type: ${viewType}. Valid: ${validViews.join(', ')}`,
          { context: { uri } },
        );
      }
      const viewPath = path.join(this.spineDir, 'view', 'data', `${viewType}.json`);
      if (!fs.existsSync(viewPath)) {
        throw new ArchSpineError(
          ErrorCodes.McpResourceNotFound,
          `View data not found for ${viewType}. Run 'spine sync' first.`,
          { context: { uri, viewPath } },
        );
      }
      const content = fs.readFileSync(viewPath, 'utf-8');
      this.contextGate?.noteResourceRead(uri);
      return { uri, name: `View: ${viewType}`, text: content };
    }

    throw new ArchSpineError(ErrorCodes.McpResourceInvalidUri, `Invalid resource URI: ${uri}`, {
      context: { uri },
    });
  }

  private readAndFormat(
    uri: string,
    name: string,
    fullPath: string,
  ): { uri: string; name: string; text: string } {
    if (!fs.existsSync(fullPath)) {
      throw new ArchSpineError(
        ErrorCodes.McpResourceNotFound,
        `[ArchSpine MCP Error] Resource not found. The index file does not exist at ${fullPath}. Please ensure the user has executed 'spine build'.`,
        { context: { uri, fullPath } },
      );
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (path.extname(fullPath) === '.json') {
      const readResult = readIndexDocument<Record<string, unknown>>(
        path.dirname(this.spineDir),
        fullPath,
      );
      if (!isCompatibleIndexDocument(readResult)) {
        throw new ArchSpineError(
          ErrorCodes.McpResourceInvalidContent,
          `[ArchSpine MCP Error] Resource content is invalid at ${fullPath}. Run 'spine build' to rebuild the local runtime mirror.`,
          { context: { uri, fullPath, status: readResult.status } },
        );
      }
      return { uri, name, text: JSON.stringify(readResult.data, null, 2) };
    }
    return { uri, name, text: content };
  }

  private readAndFormatFile(
    uri: string,
    name: string,
    fullPath: string,
  ): { uri: string; name: string; text: string } {
    if (!fs.existsSync(fullPath)) {
      throw new ArchSpineError(
        ErrorCodes.McpResourceNotFound,
        `[ArchSpine MCP Error] Resource not found: ${name}. The index file does not exist. Please ensure the user has executed 'spine build'.`,
        { context: { uri, fullPath, name } },
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Parsed JSON with dynamic property stripping
    const readResult = readIndexDocument<Record<string, any>>(
      path.dirname(this.spineDir),
      fullPath,
    );
    if (!isCompatibleIndexDocument(readResult)) {
      throw new ArchSpineError(
        ErrorCodes.McpResourceInvalidContent,
        `[ArchSpine MCP Error] Resource content is invalid for ${name}. Run 'spine build' to rebuild the local runtime mirror.`,
        { context: { uri, fullPath, name, status: readResult.status } },
      );
    }
    const parsed = readResult.data;

    // Data stripping to prevent Agent Context Bloat (as per Spec Mapping)
    if (parsed.provenance) {
      delete parsed.provenance;
    }
    if (parsed.skeleton && parsed.skeleton.declaredSymbols) {
      delete parsed.skeleton.declaredSymbols; // Internals, too noisy.
    }
    if (parsed.graph && parsed.graph.dependedBy) {
      // Expose dependedBy now since it's computed
    }
    if (parsed.graph && (!parsed.graph.symbolEdges || parsed.graph.symbolEdges.length === 0)) {
      delete parsed.graph.symbolEdges;
    }

    return { uri, name: `File: ${name}`, text: JSON.stringify(parsed, null, 2) };
  }

  private normalizeResourcePath(
    uri: string,
    rawPath: string,
    pathKind: 'folder path' | 'file path',
  ): string {
    let decodedPath = rawPath;
    try {
      decodedPath = decodeURIComponent(rawPath);
    } catch {
      throw new ArchSpineError(
        ErrorCodes.McpResourceInvalidUri,
        `Invalid resource URI: ${uri}. ${pathKind} contains invalid percent-encoding.`,
        { context: { uri, rawPath, pathKind } },
      );
    }

    if (decodedPath.includes('\0')) {
      throw new ArchSpineError(
        ErrorCodes.McpResourceInvalidUri,
        `Invalid resource URI: ${uri}. ${pathKind} must not contain null bytes.`,
        { context: { uri, decodedPath, pathKind } },
      );
    }

    const normalizedSeparators = decodedPath.replace(/\\/g, '/').trim();
    if (
      normalizedSeparators.length === 0 ||
      path.posix.isAbsolute(normalizedSeparators) ||
      path.win32.isAbsolute(decodedPath)
    ) {
      throw new ArchSpineError(
        ErrorCodes.McpResourceInvalidUri,
        `Invalid resource URI: ${uri}. ${pathKind} must be a non-empty relative path.`,
        { context: { uri, decodedPath, pathKind } },
      );
    }

    const normalizedPath = path.posix.normalize(normalizedSeparators);
    if (normalizedPath === '.' || normalizedPath === '') {
      throw new ArchSpineError(
        ErrorCodes.McpResourceInvalidUri,
        `Invalid resource URI: ${uri}. ${pathKind} must be a non-empty relative path.`,
        { context: { uri, decodedPath, pathKind } },
      );
    }

    if (normalizedPath.split('/').some((segment) => segment === '..')) {
      throw new ArchSpineError(
        ErrorCodes.McpResourceInvalidUri,
        `Invalid resource URI: ${uri}. Resource path traversal is not allowed.`,
        { context: { uri, decodedPath, normalizedPath } },
      );
    }

    return normalizedPath;
  }

  private resolveSpinePath(uri: string, ...segments: string[]): string {
    const resolvedPath = path.resolve(this.spineDir, ...segments);
    const normalizedRoot = this.spineRootDir.endsWith(path.sep)
      ? this.spineRootDir
      : `${this.spineRootDir}${path.sep}`;
    if (resolvedPath !== this.spineRootDir && !resolvedPath.startsWith(normalizedRoot)) {
      throw new ArchSpineError(
        ErrorCodes.McpResourceInvalidUri,
        `Invalid resource URI: ${uri}. Resource path traversal is not allowed.`,
        { context: { uri, resolvedPath } },
      );
    }
    return resolvedPath;
  }
}
