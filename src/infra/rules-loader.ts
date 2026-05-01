import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { CURRENT_SCHEMA_VERSION, SpineRuleDocument } from '../types/protocol.js';

interface LoadedRuleFile {
  filePath: string;
  rule: SpineRuleDocument;
}

function slugifyRuleId(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unnamed-rule'
  );
}

function normalizeSeverity(value: string | undefined): SpineRuleDocument['severity'] {
  const normalized = (value || 'warning').trim().toLowerCase();
  if (normalized === 'error' || normalized === 'warning' || normalized === 'advisory') {
    return normalized;
  }
  return 'warning';
}

function parseMarkdownRule(filePath: string): SpineRuleDocument | null {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(rawContent);
  const data = parsed.data;
  const appliesTo = data.appliesTo || data.paths || [];

  if (!Array.isArray(appliesTo) || appliesTo.length === 0) {
    return null;
  }

  return {
    schemaVersion: data.schemaVersion || CURRENT_SCHEMA_VERSION,
    ruleId: data.ruleId || path.basename(filePath, '.md'),
    title: data.title || 'Untitled Rule',
    summary: data.summary || '',
    appliesTo,
    severity: normalizeSeverity(data.severity),
    enforceable: data.enforceable !== undefined ? data.enforceable : true,
    rationale: data.rationale || null,
    bodyMarkdown: parsed.content.trim(),
  };
}

function parseYamlRuleBlocks(content: string): SpineRuleDocument[] {
  const rules: SpineRuleDocument[] = [];
  const lines = content.split(/\r?\n/);
  let current: {
    title: string;
    scope?: string;
    constraint?: string;
    severity?: string;
    reason?: string;
  } | null = null;

  const flushCurrent = () => {
    if (!current?.title || !current.scope) {
      return;
    }

    const ruleId = slugifyRuleId(current.title);
    const summary = current.constraint || current.reason || current.title;
    const bodyLines = [];
    if (current.constraint) {
      bodyLines.push(`Constraint: ${current.constraint}`);
    }
    if (current.reason) {
      bodyLines.push(`Reason: ${current.reason}`);
    }

    rules.push({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      ruleId,
      title: current.title,
      summary,
      appliesTo: [current.scope],
      severity: normalizeSeverity(current.severity),
      enforceable: true,
      rationale: current.reason || null,
      bodyMarkdown: bodyLines.join('\n'),
    });
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const titleMatch = line.match(/^- \[Rule:\s*(.+?)\]$/);
    if (titleMatch) {
      flushCurrent();
      current = { title: titleMatch[1].trim() };
      continue;
    }

    if (!current) {
      continue;
    }

    const fieldMatch = line.match(/^- (Scope|Constraint|Severity|Reason):\s*(.+)$/i);
    if (!fieldMatch) {
      continue;
    }

    const [, key, value] = fieldMatch;
    const normalizedKey = key.toLowerCase();
    if (normalizedKey === 'scope') {
      current.scope = value.trim();
    }
    if (normalizedKey === 'constraint') {
      current.constraint = value.trim();
    }
    if (normalizedKey === 'severity') {
      current.severity = value.trim();
    }
    if (normalizedKey === 'reason') {
      current.reason = value.trim();
    }
  }

  flushCurrent();
  return rules;
}

function parseYamlRules(filePath: string): SpineRuleDocument[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseYamlRuleBlocks(content);
}

export function loadRulesFromDir(rulesDir: string): LoadedRuleFile[] {
  if (!fs.existsSync(rulesDir)) {
    return [];
  }

  const loaded: LoadedRuleFile[] = [];
  for (const file of fs.readdirSync(rulesDir)) {
    const fullPath = path.join(rulesDir, file);
    if (file.endsWith('.md')) {
      const rule = parseMarkdownRule(fullPath);
      if (rule) {
        loaded.push({ filePath: fullPath, rule });
      }
      continue;
    }
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      for (const rule of parseYamlRules(fullPath)) {
        loaded.push({ filePath: fullPath, rule });
      }
    }
  }

  return loaded;
}
