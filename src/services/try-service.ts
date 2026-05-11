import * as fs from 'node:fs';
import * as path from 'node:path';
import { Scanner } from '../engines/scanner.js';
import { Config } from '../infra/config.js';
import { discoverLanguages } from '../ast/lang-discovery.js';
import { LangRegistry } from '../ast/lang-registry.js';
import { ASTExtractor } from '../ast/extractor.js';
import type { LanguageSnapshot } from '../types/protocol.js';

export interface RepoPosture {
  hasConfig: boolean;
  hasRules: boolean;
  hasManifest: boolean;
  hasIndex: boolean;
  hasView: boolean;
}

export function checkRepoPosture(rootDir: string): RepoPosture {
  return {
    hasConfig: fs.existsSync(path.join(rootDir, '.spine', 'config.json')),
    hasRules: fs.existsSync(path.join(rootDir, '.spine', 'rules')),
    hasManifest: fs.existsSync(path.join(rootDir, '.spine', 'manifest.json')),
    hasIndex: fs.existsSync(path.join(rootDir, '.spine', 'index')),
    hasView: fs.existsSync(path.join(rootDir, '.spine', 'view')),
  };
}

export interface LanguagePreview {
  language: string;
  extensions: string[];
  status: string;
  fileCount: number;
  sampleFile: string;
  sampleResult: string;
}

export interface ASTPreviewResult {
  previews: LanguagePreview[];
  sampleLimit: number;
}

const SAMPLE_PREVIEW_LIMIT = 3;

export async function discoverLanguageLandscape(
  rootDir: string,
  config: Config,
): Promise<LanguageSnapshot | undefined> {
  const scanner = new Scanner(rootDir, config.getScanPolicy());
  const sourceFiles = scanner.getAllFiles().filter((f) => LangRegistry.isSourceFile(f));
  return discoverLanguages(sourceFiles);
}

export async function generateASTPreviews(
  rootDir: string,
  languageSnapshot: LanguageSnapshot,
): Promise<ASTPreviewResult> {
  const extractor = new ASTExtractor();
  const availableLangs = Object.entries(languageSnapshot.languages).filter(
    ([, s]) => s.status === 'available',
  );

  const previews: LanguagePreview[] = [];

  for (const [langName, langSupport] of availableLangs) {
    if (previews.length >= SAMPLE_PREVIEW_LIMIT) {
      break;
    }

    const scanner = new Scanner(rootDir);
    const allFiles = scanner.getAllFiles();
    const langFiles = allFiles.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return langSupport.extensions.includes(ext);
    });

    if (langFiles.length === 0) {
      continue;
    }

    const withSizes = langFiles
      .map((f) => {
        try {
          return { file: f, size: fs.statSync(path.join(rootDir, f)).size };
        } catch {
          return { file: f, size: 0 };
        }
      })
      .filter((f) => f.size > 0)
      .sort((a, b) => a.size - b.size);

    if (withSizes.length === 0) {
      continue;
    }

    const sampleFile = withSizes[Math.floor(withSizes.length / 2)].file;

    try {
      const content = fs.readFileSync(path.join(rootDir, sampleFile), 'utf-8');
      const skeleton = await extractor.extract(content, sampleFile);

      let result = '';
      if (skeleton.imports.length > 0) {
        const previewImports = skeleton.imports.slice(0, 5);
        result += `  Imports (${skeleton.imports.length} total):\n`;
        for (const imp of previewImports) {
          const symbols = imp.symbols.slice(0, 3).join(', ');
          const more = imp.symbols.length > 3 ? ` +${imp.symbols.length - 3} more` : '';
          result += `    from "${imp.source}": ${symbols}${more}\n`;
        }
        if (skeleton.imports.length > 5) {
          result += `    ... and ${skeleton.imports.length - 5} more imports\n`;
        }
      }

      if (skeleton.exports.length > 0) {
        result += `  Exports (${skeleton.exports.length} total):\n`;
        const previewExports = skeleton.exports.slice(0, 5);
        for (const exp of previewExports) {
          result += `    ${exp.kind}: ${exp.name} — ${exp.signature}\n`;
        }
        if (skeleton.exports.length > 5) {
          result += `    ... and ${skeleton.exports.length - 5} more exports\n`;
        }
      }

      if (skeleton.usages && skeleton.usages.length > 0) {
        const uniqueUsages = [...new Set(skeleton.usages)].slice(0, 8);
        result += `  Symbol usages: ${uniqueUsages.join(', ')}`;
        if (skeleton.usages.length > 8) {
          result += ` +${skeleton.usages.length - 8} more`;
        }
        result += '\n';
      }

      if (!result) {
        result = '  (no imports, exports, or usages detected)\n';
      }

      previews.push({
        language: langName,
        extensions: langSupport.extensions,
        status: langSupport.status,
        fileCount: langFiles.length,
        sampleFile,
        sampleResult: result,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      previews.push({
        language: langName,
        extensions: langSupport.extensions,
        status: 'extraction-failed',
        fileCount: langFiles.length,
        sampleFile,
        sampleResult: `  AST extraction failed: ${message}\n`,
      });
    }
  }

  return { previews, sampleLimit: SAMPLE_PREVIEW_LIMIT };
}
