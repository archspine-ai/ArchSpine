import * as fs from 'fs';
import * as path from 'path';

/**
 * Quick-scan engine: pure AST (regex-based) analysis with no LLM calls.
 * Designed to complete in under 30 seconds for a 50k-line repo.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface QuickScanNode {
  id: string;
  label: string;
  filePath: string;
  language: string;
  exportCount: number;
  importCount: number;
  type: 'module' | 'unknown';
}

export interface QuickScanEdge {
  from: string;
  to: string;
  type: 'import' | 'unknown';
}

export interface QuickScanResult {
  scannedAt: string;
  fileCount: number;
  languageStats: Record<string, number>;
  nodes: QuickScanNode[];
  edges: QuickScanEdge[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPPORTED_EXTENSIONS = new Set([
  '.ts',
  '.js',
  '.tsx',
  '.jsx',
  '.py',
  '.go',
  '.java',
  '.rs',
  '.rb',
  '.php',
]);

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.spine',
  'tests',
  '__tests__',
  'fixtures',
  'coverage',
  'out',
]);

const EXT_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'TypeScript',
  '.js': 'JavaScript',
  '.tsx': 'TypeScript React',
  '.jsx': 'JavaScript React',
  '.py': 'Python',
  '.go': 'Go',
  '.java': 'Java',
  '.rs': 'Rust',
  '.rb': 'Ruby',
  '.php': 'PHP',
};

// ---------------------------------------------------------------------------
// Import-parsing regex patterns (per language)
// ---------------------------------------------------------------------------

interface LanguageImportPattern {
  /** Human-readable label (used for debugging only). */
  label: string;
  /** The regex to match import statements. Must produce capture group 1 as the module name. */
  regex: RegExp;
}

const IMPORT_PATTERNS: Record<string, LanguageImportPattern[]> = {
  '.ts': [
    { label: 'esm', regex: /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g },
    { label: 'require', regex: /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
    { label: 'dynamic-import', regex: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
  ],
  '.js': [
    { label: 'esm', regex: /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g },
    { label: 'require', regex: /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
    { label: 'dynamic-import', regex: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
  ],
  '.tsx': [
    { label: 'esm', regex: /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g },
    { label: 'require', regex: /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
    { label: 'dynamic-import', regex: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
  ],
  '.jsx': [
    { label: 'esm', regex: /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g },
    { label: 'require', regex: /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
    { label: 'dynamic-import', regex: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
  ],
  '.py': [
    { label: 'import', regex: /^import\s+(\S+)/gm },
    { label: 'from-import', regex: /^from\s+(\S+)\s+import/gm },
  ],
  '.go': [
    { label: 'import', regex: /^\s*import\s+["]([^"]+)["]/gm },
    { label: 'import-multi', regex: /"\w[^"]+"/g },
  ],
  '.java': [{ label: 'import', regex: /^import\s+(?:static\s+)?([\w.*]+);/gm }],
  '.rs': [{ label: 'use', regex: /^use\s+([\w:{}*]+)/gm }],
  '.rb': [
    { label: 'require', regex: /require\s+['"]([^'"]+)['"]/g },
    { label: 'require_relative', regex: /require_relative\s+['"]([^'"]+)['"]/g },
  ],
  '.php': [
    { label: 'use', regex: /^use\s+([\w\\]+);/gm },
    { label: 'require', regex: /(?:require|include)(?:_once)?\s+['"]([^'"]+)['"]/g },
  ],
};

// ---------------------------------------------------------------------------
// File walking (simple recursive, respects SKIP_DIRS)
// ---------------------------------------------------------------------------

function walkFiles(dir: string, rootDir: string): string[] {
  const results: string[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    // Permission denied or missing directory — skip silently.
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) {
        continue;
      }
      results.push(...walkFiles(fullPath, rootDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        const relative = path.relative(rootDir, fullPath);
        results.push(relative);
      }
    }
  }

  return results;
}

/**
 * Determine the entry directory for scanning.
 * Prefer `src/`; fall back to the root if `src/` does not exist.
 */
function resolveScanRoot(rootDir: string): string {
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir) && fs.statSync(srcDir).isDirectory()) {
    return srcDir;
  }
  return rootDir;
}

// ---------------------------------------------------------------------------
// Import extraction
// ---------------------------------------------------------------------------

/**
 * Parse a file's content and return the list of import specifiers found,
 * preserving the original text as-is (no path resolution yet).
 */
function extractImports(fileContent: string, ext: string): string[] {
  const patterns = IMPORT_PATTERNS[ext];
  if (!patterns) {
    return [];
  }

  const imports: string[] = [];
  for (const pattern of patterns) {
    // Reset lastIndex for global regexes.
    pattern.regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.regex.exec(fileContent)) !== null) {
      const moduleName = match[1];
      if (moduleName && moduleName.length > 0 && moduleName.length < 500) {
        imports.push(moduleName);
      }
    }
  }

  return imports;
}

/**
 * Resolve a bare import specifier against the file's directory.
 * Returns `null` for external packages (non-relative imports).
 * Tries common extensions and index files.
 */
function resolveImportPath(
  specifier: string,
  fileDir: string,
  knownFiles: Set<string>,
  rootDir: string,
): string | null {
  // Only resolve relative imports.
  if (!specifier.startsWith('.')) {
    return null;
  }

  // Normalize the specifier relative to the file's directory.
  const resolved = path.resolve(fileDir, specifier);
  const relative = path.relative(rootDir, resolved);

  // Direct match (e.g., specifier already has the right extension).
  if (knownFiles.has(relative)) {
    return relative;
  }

  // Strip the existing extension from the relative path so we can try
  // all supported extensions. This handles ESM imports with .js extension
  // that actually resolve to .ts source files.
  const parsed = path.parse(relative);
  const baseWithoutExt = path.posix.join(parsed.dir, parsed.name);

  // Try with each supported extension.
  for (const ext of SUPPORTED_EXTENSIONS) {
    const withExt = baseWithoutExt + ext;
    if (knownFiles.has(withExt)) {
      return withExt;
    }
  }

  // Try as a directory with index file.
  for (const ext of SUPPORTED_EXTENSIONS) {
    const indexPath = `${baseWithoutExt}/index${ext}`;
    if (knownFiles.has(indexPath)) {
      return indexPath;
    }
  }

  // Could not resolve — skip.
  return null;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Persist the quick-scan knowledge graph to `.spine/view/data/knowledge-graph.json`.
 */
export function saveQuickScanResults(rootDir: string, result: QuickScanResult): string {
  const outputDir = path.join(rootDir, '.spine', 'view', 'data');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'knowledge-graph.json');

  // Remove existing file if it exists (may be read-only from a prior run).
  try {
    fs.unlinkSync(outputPath);
  } catch {
    // File does not exist — that is fine.
  }

  const kgData = {
    schemaVersion: '2.0.0',
    generatedAt: result.scannedAt,
    viewType: 'knowledge-graph',
    summary: `Quick scan: ${result.fileCount} files across ${Object.keys(result.languageStats).length} languages`,
    nodes: result.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      layer: n.filePath.split('/')[2] || 'unknown',
      fanIn: result.edges.filter((e) => e.to === n.id).length,
      fanOut: result.edges.filter((e) => e.from === n.id).length,
      violationCount: 0,
    })),
    edges: result.edges.map((e) => ({
      from: e.from,
      to: e.to,
      type: e.type,
      compliant: true,
    })),
  };

  fs.writeFileSync(outputPath, JSON.stringify(kgData, null, 2), 'utf-8');

  return outputPath;
}

/**
 * Perform a quick scan of the repository, building a dependency graph
 * from import statements using regex-based parsing (no LLM, no full AST).
 *
 * @param rootDir - The repository root directory.
 * @returns A `QuickScanResult` containing nodes, edges, and language statistics.
 */
export function runQuickScan(rootDir: string): QuickScanResult {
  const scannedAt = new Date().toISOString();

  // 1. Resolve the scan root (src/ preferred, else root).
  const scanRoot = resolveScanRoot(rootDir);

  // 2. Walk the file tree.
  const files = walkFiles(scanRoot, rootDir);

  // Build a set of known file paths for fast lookup during import resolution.
  const knownFiles = new Set(files);

  // 3. Build the node and edge lists.
  const nodes: QuickScanNode[] = [];
  const edges: QuickScanEdge[] = [];
  const languageStats: Record<string, number> = {};

  for (const filePath of files) {
    const ext = path.extname(filePath);
    const language = EXT_TO_LANGUAGE[ext] || 'unknown';

    // Count language occurrence.
    languageStats[language] = (languageStats[language] || 0) + 1;

    const fullPath = path.resolve(rootDir, filePath);
    let fileContent: string;
    try {
      fileContent = fs.readFileSync(fullPath, 'utf-8');
    } catch {
      // Skip files we cannot read (binary, permissions, etc.).
      continue;
    }

    // Extract imports from the file.
    const importSpecifiers = extractImports(fileContent, ext);
    const uniqueSpecifiers = [...new Set(importSpecifiers)];

    // Resolve each specifier to an internal file path.
    const fileDir = path.dirname(path.resolve(rootDir, filePath));
    const resolvedEdges: string[] = [];

    for (const specifier of uniqueSpecifiers) {
      const resolved = resolveImportPath(specifier, fileDir, knownFiles, rootDir);
      if (resolved !== null && resolved !== filePath) {
        resolvedEdges.push(resolved);
      }
    }

    // Create a node for this file.
    const nodeId = filePath.replace(/\\/g, '/');
    const label = path.basename(filePath);

    nodes.push({
      id: nodeId,
      label,
      filePath: nodeId,
      language,
      exportCount: 0,
      importCount: uniqueSpecifiers.length,
      type: 'module',
    });

    // Create edges for each resolved dependency.
    for (const target of resolvedEdges) {
      const targetId = target.replace(/\\/g, '/');
      edges.push({
        from: nodeId,
        to: targetId,
        type: 'import',
      });
    }
  }

  return {
    scannedAt,
    fileCount: files.length,
    languageStats,
    nodes,
    edges,
  };
}
