import { parse } from '@ast-grep/napi';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { LangRegistry } from './lang-registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ExtractedSymbol {
  name: string;
  kind: 'Class' | 'Function' | 'Variable' | 'Interface' | 'Type' | 'Unknown';
  signature: string;
  implementation_clue?: string;
}

export interface ExtractedImport {
  source: string;
  symbols: string[];
}

export interface FileSkeleton {
  imports: ExtractedImport[];
  exports: ExtractedSymbol[];
  usages?: string[];
}

type RulePattern = string | Record<string, unknown>;

interface RuleSet {
  imports: Array<{ id: string; pattern: string }>;
  exports: Array<{ id: string; pattern: RulePattern; kind: ExtractedSymbol['kind'] }>;
  usages?: Array<{ id: string; pattern: string }>;
}

function isObjectPattern(pattern: RulePattern): pattern is Record<string, unknown> {
  return typeof pattern === 'object' && pattern !== null;
}

const FUNCTION_RULE_IDS = new Set([
  'function',
  'async_function',
  'default_function',
  'public_function',
  'protected_function',
  'private_function',
]);
const CLASS_RULE_IDS = new Set([
  'class',
  'default_class',
  'public_class',
  'struct',
  'public_struct',
  'template_class',
]);
const INTERFACE_RULE_IDS = new Set([
  'interface',
  'public_interface',
  'type_interface',
  'trait',
  'public_trait',
]);
const TYPE_RULE_IDS = new Set(['type', 'type_alias', 'namespace', 'impl']);

export class ASTExtractor {
  private rulesCache: Record<string, RuleSet> = {};

  private loadRules(language: string): RuleSet | null {
    if (this.rulesCache[language]) {
      return this.rulesCache[language];
    }

    const rulePath = path.join(__dirname, 'rules', `${language}.yml`);
    if (!fs.existsSync(rulePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(rulePath, 'utf-8');
      const rules = yaml.load(content) as RuleSet;
      this.rulesCache[language] = rules;
      return rules;
    } catch (e) {
      // eslint-disable-next-line no-console -- Debug log for failed rule load
      console.error(`Failed to load AST rules for ${language}:`, e);
      return null;
    }
  }

  public async extract(content: string, filePath: string): Promise<FileSkeleton> {
    const resolved = await LangRegistry.resolve(filePath);
    if (!resolved.supported) {
      LangRegistry.announceUnavailableLanguage(filePath, resolved.reason);
      return { imports: [], exports: [] };
    }

    const rules = this.loadRules(resolved.config.ruleName);
    if (!rules) {
      return { imports: [], exports: [] };
    }

    const root = parse(resolved.config.langKey, content).root();

    const imports: ExtractedImport[] = [];
    const exports: ExtractedSymbol[] = [];

    // Extract imports
    for (const rule of rules.imports || []) {
      const nodes = root.findAll(rule.pattern);
      for (const node of nodes) {
        const sourceNode = node.getMatch('SOURCE');
        const symbolsNode = node.getMultipleMatches('SYMBOLS');
        const symbolNode = node.getMatch('SYMBOL');

        const source = sourceNode?.text() || 'unknown';
        let symbols: string[] = [];

        if (symbolsNode && symbolsNode.length > 0) {
          symbols = symbolsNode.map((n) => n.text().replace(/,/g, '').trim()).filter((t) => t);
        } else if (symbolNode) {
          const symText = symbolNode.text();
          if (!symText.includes('{')) {
            symbols = rule.id === 'namespace' ? [`* as ${symText}`] : [symText];
          }
        }

        if (source !== 'unknown' && symbols.length > 0) {
          imports.push({ source, symbols });
        }
      }
    }

    // Extract exports
    for (const rule of rules.exports || []) {
      const pattern = isObjectPattern(rule.pattern)
        ? (rule.pattern as Record<string, unknown>)
        : rule.pattern;
      const nodes = root.findAll(pattern as string);
      for (const node of nodes) {
        let name = node.getMatch('NAME')?.text();
        const argsNode = node.getMultipleMatches('ARGS');
        const valNode = node.getMatch('VAL');
        const symbolsNode = node.getMultipleMatches('SYMBOLS');

        let kind = rule.kind;
        let signature = '';

        if (rule.id === 'list' && symbolsNode.length > 0) {
          const symbols = symbolsNode
            .map((n) => n.text().replace(/,/g, '').trim())
            .map((s) => s.replace(/^['"](.*)['"]$/, '$1'))
            .filter((t) => t);
          for (const sym of symbols) {
            exports.push({ name: sym, kind: 'Unknown', signature: `export { ${sym} }` });
          }
          continue;
        }

        if (rule.id === 'default') {
          name = 'default';
          signature = `default ${valNode?.text().split(' ')[0] || ''}`;
        } else if (FUNCTION_RULE_IDS.has(rule.id)) {
          if (isObjectPattern(rule.pattern)) {
            const argsText = node.getMatch('ARGS')?.text() || '()';
            signature = `${name}${argsText}`;
          } else {
            const args = argsNode.map((n) => n.text()).join(', ');
            signature = `${name}(${args})`;
          }
        } else if (CLASS_RULE_IDS.has(rule.id)) {
          const prefix = rule.id.includes('struct') ? 'struct' : 'class';
          signature = `${prefix} ${name}`;
        } else if (INTERFACE_RULE_IDS.has(rule.id)) {
          const prefix = rule.id.includes('trait') ? 'trait' : 'interface';
          signature = `${prefix} ${name}`;
        } else if (TYPE_RULE_IDS.has(rule.id)) {
          const prefix =
            rule.id === 'namespace' ? 'namespace' : rule.id === 'impl' ? 'impl' : 'type';
          signature = `${prefix} ${name}`;
        } else if (
          rule.id === 'const' ||
          rule.id === 'let' ||
          rule.id === 'var' ||
          rule.id === 'variable'
        ) {
          // skip __all__ which is handled by the dedicated list rule
          if (name === '__all__') {
            continue;
          }
          signature = `${rule.id} ${name}`;
          const valText = valNode ? valNode.text() : '';

          if (valText.includes('=>')) {
            kind = 'Function';
            const sigMatch = valText.match(/^\s*(\(.*?\)|[a-zA-Z0-9_]+)\s*=>/);
            if (sigMatch) {
              signature = sigMatch[1] + ' => ...';
            }
          }
        }

        let implementation_clue = '';
        if (!INTERFACE_RULE_IDS.has(rule.id) && !TYPE_RULE_IDS.has(rule.id)) {
          const fullNodeText = node.text();
          const lines = fullNodeText.split('\n');
          const snippetLines = lines.slice(0, 5);
          implementation_clue = snippetLines.join('\n');
          if (lines.length > 5) {
            implementation_clue += '\n...';
          }
        }

        if (name) {
          exports.push({ name, kind, signature, implementation_clue });
        }
      }
    }

    // Extract usages
    const usages: string[] = [];
    for (const rule of rules.usages || []) {
      const nodes = root.findAll(rule.pattern);
      for (const node of nodes) {
        const nameNode = node.getMatch('NAME');
        if (nameNode) {
          const text = nameNode.text();
          if (
            ![
              'if',
              'for',
              'while',
              'switch',
              'catch',
              'typeof',
              'console',
              'require',
              'import',
              'export',
              'super',
              'this',
            ].includes(text)
          ) {
            usages.push(text);
          }
        }
      }
    }

    return { imports, exports, usages };
  }
}
