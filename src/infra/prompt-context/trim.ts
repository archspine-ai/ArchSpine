import type { FileSkeleton } from '../../ast/extractor.js';
import type { PreviousSemanticContext } from '../llm/base.js';
import type { PromptBudgets } from './types.js';

export function trimLines(value: string, maxLines: number): string {
  const lines = value.split('\n');
  const trimmed = lines.slice(0, maxLines).join('\n');
  return lines.length > maxLines ? `${trimmed}\n...` : trimmed;
}

export function trimTextByChars(value: string, maxChars: number): string {
  if (!value || value.length <= maxChars) {
    return value;
  }

  const lines = value.split('\n');
  const kept: string[] = [];
  let current = 0;
  for (const line of lines) {
    const nextSize = current + line.length + (kept.length > 0 ? 1 : 0);
    if (nextSize > maxChars) {
      break;
    }
    kept.push(line);
    current = nextSize;
  }

  if (kept.length === 0) {
    return value.slice(0, maxChars);
  }
  return `${kept.join('\n')}\n...`;
}

export function splitRuleBlocks(ruleData: string): string[] {
  return ruleData
    .split(/\n(?=\[Rule: )/g)
    .map((block) => block.trim())
    .filter(Boolean);
}

export function trimRuleBlocks(ruleData: string, maxChars: number): string {
  if (!ruleData || ruleData.length <= maxChars) {
    return ruleData;
  }

  const blocks = splitRuleBlocks(ruleData);
  if (blocks.length === 0) {
    return trimTextByChars(ruleData, maxChars);
  }

  const kept: string[] = [];
  let current = 0;
  for (const block of blocks) {
    const addition = block.length + (kept.length > 0 ? 2 : 0);
    if (current + addition > maxChars) {
      break;
    }
    kept.push(block);
    current += addition;
  }

  if (kept.length === 0) {
    return trimTextByChars(ruleData, maxChars);
  }
  return kept.join('\n\n');
}

export function trimSectionedContext(contextData: string, maxChars: number): string {
  if (!contextData || contextData.length <= maxChars) {
    return contextData;
  }

  const sections = contextData
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean);
  if (sections.length === 0) {
    return trimTextByChars(contextData, maxChars);
  }

  const kept: string[] = [];
  let current = 0;
  for (const section of sections) {
    const addition = section.length + (kept.length > 0 ? 2 : 0);
    if (current + addition > maxChars) {
      break;
    }
    kept.push(section);
    current += addition;
  }

  if (kept.length === 0) {
    return trimTextByChars(contextData, maxChars);
  }
  return kept.join('\n\n');
}

export function compactSkeletonForPrompt(
  skeleton: FileSkeleton,
  budgets: PromptBudgets,
): FileSkeleton {
  return {
    imports: skeleton.imports.slice(0, budgets.maxImports),
    exports: skeleton.exports.slice(0, budgets.maxExports).map((symbol) => ({
      ...symbol,
      implementation_clue: symbol.implementation_clue
        ? trimLines(symbol.implementation_clue, budgets.maxImplementationClueLines)
        : undefined,
    })),
    usages: (skeleton.usages || []).slice(0, budgets.maxUsages),
  };
}

export function trimPreviousSemantic(
  previousSemantic: PreviousSemanticContext | undefined,
  maxResponsibilities: number,
): PreviousSemanticContext | undefined {
  if (!previousSemantic) {
    return undefined;
  }

  return {
    role: previousSemantic.role,
    responsibilities: previousSemantic.responsibilities.slice(0, maxResponsibilities),
  };
}
