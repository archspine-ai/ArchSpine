import * as path from 'path';
import { PublicSurfaceEntry, SpineUnit } from '../types/protocol.js';
import type { RelevanceScoreContribution } from './context.js';

type IndexedDoc = SpineUnit | undefined;

const RULE_KEYWORD_STOPWORDS = new Set([
  'rule',
  'rules',
  'severity',
  'title',
  'summary',
  'content',
  'must',
  'mustn',
  'mustnt',
  'should',
  'shall',
  'only',
  'with',
  'from',
  'into',
  'that',
  'this',
  'these',
  'those',
  'their',
  'there',
  'avoid',
  'using',
  'used',
  'direct',
  'directly',
  'architecture',
  'architectural',
  'violation',
  'violations',
  'evidence',
  'supported',
  'report',
  'error',
  'warning',
  'critical',
  'file',
  'files',
  'module',
  'modules',
  'service',
  'services',
  'layer',
  'layers',
  'code',
  'path',
  'paths',
  'import',
  'imports',
  'imported',
  'dependency',
  'dependencies',
  'public',
  'surface',
  'symbol',
  'symbols',
  'source',
  'sources',
  'shouldn',
  'cannot',
  'never',
  'under',
]);

export function extractRuleKeywords(ruleData: string): string[] {
  const tokens = extractSearchTokens(ruleData);
  return [...new Set(tokens)].filter((token) => !RULE_KEYWORD_STOPWORDS.has(token)).slice(0, 16);
}

export function scoreDependencyCandidate(
  relativeFilePath: string,
  targetPath: string,
  importedSymbols: string[],
  doc: IndexedDoc,
  ruleKeywords: string[],
): { totalScore: number; contributions: RelevanceScoreContribution[] } {
  const contributions: RelevanceScoreContribution[] = [];

  if (path.dirname(targetPath) === path.dirname(relativeFilePath)) {
    contributions.push({
      factor: 'same-directory',
      score: 30,
      reason: 'Dependency is in the same directory as the source file.',
    });
  }

  if (doc?.semantic) {
    contributions.push({
      factor: 'semantic-doc',
      score: 25,
      reason: 'Dependency already has semantic docs in the manifest.',
    });
  }

  const symbolEvidenceScore = Math.min(getSymbolEvidenceScore(doc), 20);
  if (symbolEvidenceScore > 0) {
    contributions.push({
      factor: 'symbol-evidence',
      score: symbolEvidenceScore,
      reason: 'Dependency exposes a richer public surface or export evidence.',
    });
  }

  const importedSymbolScore = Math.min(importedSymbols.filter(Boolean).length * 4, 16);
  if (importedSymbolScore > 0) {
    contributions.push({
      factor: 'imported-symbol-count',
      score: importedSymbolScore,
      reason: `Source imports ${importedSymbols.filter(Boolean).length} named symbol(s) from this dependency.`,
    });
  }

  const distancePenalty = computePathDistance(relativeFilePath, targetPath);
  if (distancePenalty > 0) {
    contributions.push({
      factor: 'path-distance',
      score: -distancePenalty,
      reason: 'More distant relative paths are deprioritized.',
    });
  }

  const ruleMatch = scoreRuleKeywordMatch(ruleKeywords, {
    path: targetPath,
    role: doc?.semantic?.role,
    importedSymbols,
    publicSurfaceSymbols: getPublicSurfaceSymbols(doc),
  });
  if (ruleMatch) {
    contributions.push(ruleMatch);
  }

  return {
    totalScore: contributions.reduce((sum, contribution) => sum + contribution.score, 0),
    contributions,
  };
}

export function scoreTargetPath(
  relativeFilePath: string,
  usage: string,
  targetPath: string,
  importTargets: Set<string>,
  importedSymbolMap: Map<string, string>,
  doc: IndexedDoc,
  ruleKeywords: string[],
): { totalScore: number; contributions: RelevanceScoreContribution[] } {
  const contributions: RelevanceScoreContribution[] = [];

  if (importTargets.has(targetPath)) {
    contributions.push({
      factor: 'direct-import-target',
      score: 40,
      reason: 'Target is directly imported by the source file.',
    });
  }

  if (importedSymbolMap.get(usage) === targetPath) {
    contributions.push({
      factor: 'exact-imported-symbol',
      score: 35,
      reason: `Imported symbol \`${usage}\` resolves directly to this target.`,
    });
  }

  if (targetContainsSymbol(doc, usage)) {
    contributions.push({
      factor: 'matching-public-surface',
      score: 25,
      reason: `Target exports or documents symbol \`${usage}\`.`,
    });
  }

  if (path.dirname(targetPath) === path.dirname(relativeFilePath)) {
    contributions.push({
      factor: 'same-directory',
      score: 15,
      reason: 'Target is in the same directory as the source file.',
    });
  }

  if (doc?.semantic) {
    contributions.push({
      factor: 'semantic-doc',
      score: 10,
      reason: 'Target already has semantic docs in the manifest.',
    });
  }

  const ruleMatch = scoreRuleKeywordMatch(ruleKeywords, {
    path: targetPath,
    role: doc?.semantic?.role,
    usage,
    importedSymbols: [],
    publicSurfaceSymbols: getPublicSurfaceSymbols(doc),
  });
  if (ruleMatch) {
    contributions.push(ruleMatch);
  }

  const distancePenalty = computePathDistance(relativeFilePath, targetPath);
  if (distancePenalty > 0) {
    contributions.push({
      factor: 'path-distance',
      score: -distancePenalty,
      reason: 'More distant relative paths are deprioritized.',
    });
  }

  return {
    totalScore: contributions.reduce((sum, contribution) => sum + contribution.score, 0),
    contributions,
  };
}

function scoreRuleKeywordMatch(
  ruleKeywords: string[],
  input: {
    path: string;
    role?: string;
    usage?: string;
    importedSymbols: string[];
    publicSurfaceSymbols: string[];
  },
): RelevanceScoreContribution | null {
  if (ruleKeywords.length === 0) {
    return null;
  }

  const fieldMatches = new Map<string, Set<string>>();
  collectFieldMatches(fieldMatches, 'path', extractSearchTokens(input.path), ruleKeywords);
  collectFieldMatches(fieldMatches, 'role', extractSearchTokens(input.role || ''), ruleKeywords);
  collectFieldMatches(
    fieldMatches,
    'imported-symbols',
    input.importedSymbols.flatMap((symbol) => extractSearchTokens(symbol)),
    ruleKeywords,
  );
  collectFieldMatches(
    fieldMatches,
    'public-surface',
    input.publicSurfaceSymbols.flatMap((symbol) => extractSearchTokens(symbol)),
    ruleKeywords,
  );
  if (input.usage) {
    collectFieldMatches(
      fieldMatches,
      'symbol-usage',
      extractSearchTokens(input.usage),
      ruleKeywords,
    );
  }

  const matchedKeywords = new Set<string>();
  for (const keywords of fieldMatches.values()) {
    for (const keyword of keywords) {
      matchedKeywords.add(keyword);
    }
  }

  if (matchedKeywords.size === 0) {
    return null;
  }

  const matchedFieldCount = fieldMatches.size;
  const score = Math.min(24, matchedKeywords.size * 4 + Math.max(0, matchedFieldCount - 1) * 2);
  const fieldSummary = Array.from(fieldMatches.entries())
    .map(([field, keywords]) => `${field}=${Array.from(keywords).sort().join(',')}`)
    .join('; ');

  return {
    factor: 'rule-keyword-match',
    score,
    reason: `Rule keywords matched ${fieldSummary}.`,
  };
}

function collectFieldMatches(
  target: Map<string, Set<string>>,
  field: string,
  fieldTokens: string[],
  ruleKeywords: string[],
): void {
  const fieldTokenSet = new Set(fieldTokens);
  const matches = ruleKeywords.filter((keyword) => fieldTokenSet.has(keyword));
  if (matches.length === 0) {
    return;
  }

  target.set(field, new Set(matches));
}

function extractSearchTokens(value: string): string[] {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .toLowerCase();
  return normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function getSymbolEvidenceScore(doc: IndexedDoc): number {
  if (!doc) {
    return 0;
  }

  const publicSurfaceCount = Array.isArray(doc.semantic?.publicSurface)
    ? doc.semantic.publicSurface.length
    : 0;
  const exportCount = Array.isArray(doc.skeleton?.exports) ? doc.skeleton.exports.length : 0;
  const responsibilityCount = Array.isArray(doc.semantic?.responsibilities)
    ? doc.semantic.responsibilities.length
    : 0;
  return publicSurfaceCount * 4 + exportCount * 2 + responsibilityCount * 2;
}

function targetContainsSymbol(doc: IndexedDoc, usage: string): boolean {
  if (!doc) {
    return false;
  }

  const inPublicSurface =
    Array.isArray(doc.semantic?.publicSurface) &&
    doc.semantic.publicSurface.some((entry: PublicSurfaceEntry) => entry.symbolName === usage);
  const inExports =
    Array.isArray(doc.skeleton?.exports) &&
    doc.skeleton.exports.some((entry) => entry.name === usage);

  return inPublicSurface || inExports;
}

function computePathDistance(sourcePath: string, targetPath: string): number {
  const sourceParts = path.dirname(sourcePath).split(path.sep).filter(Boolean);
  const targetParts = path.dirname(targetPath).split(path.sep).filter(Boolean);
  let common = 0;

  while (
    common < sourceParts.length &&
    common < targetParts.length &&
    sourceParts[common] === targetParts[common]
  ) {
    common++;
  }

  return sourceParts.length - common + (targetParts.length - common);
}

function getPublicSurfaceSymbols(doc: IndexedDoc): string[] {
  const semanticSymbols = Array.isArray(doc?.semantic?.publicSurface)
    ? doc.semantic.publicSurface
        .map((entry: PublicSurfaceEntry) => entry.symbolName)
        .filter((entry: unknown): entry is string => typeof entry === 'string' && entry.length > 0)
    : [];
  const exportedSymbols = Array.isArray(doc?.skeleton?.exports)
    ? doc.skeleton.exports
        .map((entry) => entry.name)
        .filter((entry: unknown): entry is string => typeof entry === 'string' && entry.length > 0)
    : [];

  return [...new Set([...semanticSymbols, ...exportedSymbols])];
}
