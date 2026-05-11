import * as path from 'path';
import { FileSkeleton } from '../ast/extractor.js';
import { SymbolDependencyEdge } from '../types/protocol.js';
import { Manifest } from '../infra/manifest.js';
import { resolveRelativeImportTarget } from './context-path-resolver.js';
import {
  extractRuleKeywords,
  scoreDependencyCandidate,
  scoreTargetPath,
} from './context-relevance.js';

export interface RelevanceScoreContribution {
  factor: string;
  score: number;
  reason: string;
}

export interface DependencyCandidateDiagnostics {
  path: string;
  importedSymbols: string[];
  role?: string;
  totalScore: number;
  contributions: RelevanceScoreContribution[];
}

export interface SymbolTargetDiagnostics {
  path: string;
  totalScore: number;
  contributions: RelevanceScoreContribution[];
}

export interface UsageTargetDiagnostics {
  usage: string;
  retainedTargets: SymbolTargetDiagnostics[];
  truncatedTargets: SymbolTargetDiagnostics[];
}

export interface ContextResolutionDiagnostics {
  retainedDependencyCandidates: DependencyCandidateDiagnostics[];
  truncatedDependencyCandidates: DependencyCandidateDiagnostics[];
  symbolTargets: UsageTargetDiagnostics[];
}

export interface ContextResolutionResult {
  contextData: string;
  symbolEdges: SymbolDependencyEdge[];
  diagnostics: ContextResolutionDiagnostics;
}

export interface ContextResolutionOptions {
  taskMode?: 'summarize' | 'validate';
  ruleData?: string;
}

interface ScoredPath {
  path: string;
  totalScore: number;
  contributions: RelevanceScoreContribution[];
}

function createDependencyDiagnostics(
  candidates: ScoredPath[],
  manifest: Manifest,
  importedSymbolMap: Map<string, string>,
  maxDependencySummaries: number,
  getImportedSymbolsForPath: (importedSymbols: Map<string, string>, filePath: string) => string[],
): Pick<
  ContextResolutionDiagnostics,
  'retainedDependencyCandidates' | 'truncatedDependencyCandidates'
> {
  return {
    retainedDependencyCandidates: candidates.slice(0, maxDependencySummaries).map((candidate) => ({
      path: candidate.path,
      importedSymbols: getImportedSymbolsForPath(importedSymbolMap, candidate.path),
      role: manifest.getFileDocs(candidate.path)?.semantic?.role,
      totalScore: candidate.totalScore,
      contributions: candidate.contributions,
    })),
    truncatedDependencyCandidates: candidates.slice(maxDependencySummaries).map((candidate) => ({
      path: candidate.path,
      importedSymbols: getImportedSymbolsForPath(importedSymbolMap, candidate.path),
      role: manifest.getFileDocs(candidate.path)?.semantic?.role,
      totalScore: candidate.totalScore,
      contributions: candidate.contributions,
    })),
  };
}

function buildContextSections(
  importLines: string[],
  dependencySummaries: string[],
  referenceLines: string[],
): string {
  const sections: string[] = [];
  if (importLines.length > 0) {
    sections.push(`Import Inventory:\n${importLines.join('\n')}`);
  }
  if (dependencySummaries.length > 0) {
    sections.push(`Known Internal Dependency Semantics:\n${dependencySummaries.join('\n')}`);
  }
  if (referenceLines.length > 0) {
    sections.push(`Resolved Symbol References:\n${referenceLines.join('\n')}`);
  }
  return sections.join('\n\n');
}

export class ContextEngine {
  private rootDir: string;
  private readonly maxDependencySummaries = 6;
  private readonly maxResponsibilitiesPerDependency = 3;
  private readonly maxReferencedSymbols = 8;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  public resolveDependencies(
    relativeFilePath: string,
    skeleton: FileSkeleton,
    manifest: Manifest,
    options: ContextResolutionOptions = {},
  ): ContextResolutionResult {
    const importLines: string[] = [];
    const dependencySummaries: string[] = [];
    const referenceLines: string[] = [];
    const symbolEdges: SymbolDependencyEdge[] = [];
    const sourceDir = path.dirname(relativeFilePath);
    const summarizedDeps = new Set<string>();
    const importTargets = new Set<string>();
    const dependencyCandidates: ScoredPath[] = [];
    const usageDiagnostics: UsageTargetDiagnostics[] = [];
    const ruleKeywords =
      options.taskMode === 'validate' ? extractRuleKeywords(options.ruleData || '') : [];

    const importedSymbolMap = new Map<string, string>();

    for (const imp of skeleton.imports) {
      const resolvedPath = this.resolveImportTarget(sourceDir, imp.source);
      if (resolvedPath) {
        importTargets.add(resolvedPath);
        imp.symbols.forEach((symbol: string) =>
          importedSymbolMap.set(symbol.replace('* as ', ''), resolvedPath),
        );
        if (!summarizedDeps.has(resolvedPath)) {
          dependencyCandidates.push({
            path: resolvedPath,
            ...scoreDependencyCandidate(
              relativeFilePath,
              resolvedPath,
              imp.symbols,
              manifest.getFileDocs(resolvedPath),
              ruleKeywords,
            ),
          });
          summarizedDeps.add(resolvedPath);
        }
      }

      if (imp.symbols.length > 0) {
        importLines.push(`- Imports from \`${imp.source}\`: ${imp.symbols.join(', ')}`);
      } else {
        importLines.push(`- Imports \`${imp.source}\` for side effects`);
      }
    }

    const usages = skeleton.usages || [];
    for (const usage of usages) {
      let targetPaths: string[] = [];
      const possibleTargets = manifest.resolveSymbol(usage);

      if (possibleTargets.length > 0) {
        targetPaths.push(...possibleTargets);
      } else {
        const directResolve = importedSymbolMap.get(usage);
        if (directResolve) {
          targetPaths.push(directResolve);
        }
      }

      targetPaths = [...new Set(targetPaths)].filter(
        (candidatePath) => candidatePath !== relativeFilePath,
      );
      const rankedTargets = targetPaths
        .map((targetPath) => ({
          path: targetPath,
          ...scoreTargetPath(
            relativeFilePath,
            usage,
            targetPath,
            importTargets,
            importedSymbolMap,
            manifest.getFileDocs(targetPath),
            ruleKeywords,
          ),
        }))
        .sort((a, b) => b.totalScore - a.totalScore || a.path.localeCompare(b.path));

      for (const target of rankedTargets) {
        const targetPath = target.path;
        const exists = symbolEdges.find(
          (edge) =>
            edge.targetPath === targetPath && edge.targetSymbol === `${targetPath}/${usage}#`,
        );
        if (!exists) {
          symbolEdges.push({
            sourceSymbol: `${relativeFilePath}/_file_#`,
            targetSymbol: `${targetPath}/${usage}#`,
            targetPath,
            relation: 'references',
            edgeProvenance: 'ast',
          });
        }
      }

      if (rankedTargets.length > 0) {
        usageDiagnostics.push({
          usage,
          retainedTargets: rankedTargets.slice(0, this.maxReferencedSymbols).map((target) => ({
            path: target.path,
            totalScore: target.totalScore,
            contributions: target.contributions,
          })),
          truncatedTargets: rankedTargets.slice(this.maxReferencedSymbols).map((target) => ({
            path: target.path,
            totalScore: target.totalScore,
            contributions: target.contributions,
          })),
        });
      }

      if (rankedTargets.length > 0 && referenceLines.length < this.maxReferencedSymbols) {
        referenceLines.push(
          `- Symbol \`${usage}\` likely references: ${rankedTargets.map((target) => `\`${target.path}\``).join(', ')}`,
        );
      }
    }

    const rankedDependencyCandidates = dependencyCandidates.sort(
      (a, b) => b.totalScore - a.totalScore || a.path.localeCompare(b.path),
    );

    rankedDependencyCandidates.slice(0, this.maxDependencySummaries).forEach((candidate) => {
      const doc = manifest.getFileDocs(candidate.path);
      if (!doc?.semantic) {
        return;
      }

      const responsibilities = (doc.semantic.responsibilities || [])
        .slice(0, this.maxResponsibilitiesPerDependency)
        .join('; ');
      dependencySummaries.push(
        `- \`${candidate.path}\`: role=${doc.semantic.role || 'Unknown'}; responsibilities=${responsibilities || 'N/A'}`,
      );
    });

    const dependencyDiagnostics = createDependencyDiagnostics(
      rankedDependencyCandidates,
      manifest,
      importedSymbolMap,
      this.maxDependencySummaries,
      (symbols, filePath) => this.getImportedSymbolsForPath(symbols, filePath),
    );

    return {
      contextData: buildContextSections(importLines, dependencySummaries, referenceLines),
      symbolEdges,
      diagnostics: {
        retainedDependencyCandidates: dependencyDiagnostics.retainedDependencyCandidates,
        truncatedDependencyCandidates: dependencyDiagnostics.truncatedDependencyCandidates,
        symbolTargets: usageDiagnostics,
      },
    };
  }

  private resolveImportTarget(dir: string, source: string): string | null {
    return resolveRelativeImportTarget(this.rootDir, dir, source);
  }

  private getImportedSymbolsForPath(
    importedSymbolMap: Map<string, string>,
    targetPath: string,
  ): string[] {
    return Array.from(importedSymbolMap.entries())
      .filter(([, resolvedPath]) => resolvedPath === targetPath)
      .map(([symbol]) => symbol);
  }
}
