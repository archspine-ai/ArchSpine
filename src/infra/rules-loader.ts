import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
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
  const structuredRules = parseStructuredYamlRules(content);
  return structuredRules.length > 0 ? structuredRules : parseYamlRuleBlocks(content);
}

function getStringField(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function getRuleScope(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }
  if (Array.isArray(value)) {
    return value.find((entry): entry is string => typeof entry === 'string' && entry.trim() !== '');
  }
  return undefined;
}

function parseStructuredYamlRules(content: string): SpineRuleDocument[] {
  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const rules: SpineRuleDocument[] = [];
  for (const entry of parsed) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      continue;
    }

    const record = entry as Record<string, unknown>;
    const title = getStringField(record.rule) || getStringField(record.title);
    const scope = getRuleScope(record.scope) || getRuleScope(record.appliesTo);
    if (!title || !scope) {
      continue;
    }

    const constraint = getStringField(record.constraint);
    const reason = getStringField(record.reason) || getStringField(record.rationale);
    const summary = constraint || reason || title;
    const bodyLines = [];
    if (constraint) {
      bodyLines.push(`Constraint: ${constraint}`);
    }
    if (reason) {
      bodyLines.push(`Reason: ${reason}`);
    }

    rules.push({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      ruleId: getStringField(record.ruleId) || slugifyRuleId(title),
      title,
      summary,
      appliesTo: [scope],
      severity: normalizeSeverity(getStringField(record.severity)),
      enforceable: record.enforceable !== undefined ? Boolean(record.enforceable) : true,
      rationale: reason || null,
      bodyMarkdown: bodyLines.join('\n'),
    });
  }

  return rules;
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
