export interface FixViolationContext {
  filePath: string;
  fileContent: string;
  structuralSkeleton: string;
  violations: {
    ruleId: string;
    severity: string;
    reason: string;
    ruleContent?: string;
  }[];
}

export function generateFixPrompt(ctx: FixViolationContext): string {
  const violationsBlock = ctx.violations
    .map((v, idx) => {
      let block = `### Violation ${idx + 1}\n`;
      block += `- Rule ID: ${v.ruleId}\n`;
      block += `- Severity: ${v.severity}\n`;
      block += `- Reason: ${v.reason}\n`;
      if (v.ruleContent) {
        block += `\n#### Full Rule Text:\n${v.ruleContent}\n`;
      }
      return block;
    })
    .join('\n\n');

  const skeletonSection = ctx.structuralSkeleton
    ? `### Structural Skeleton (AST)\n${ctx.structuralSkeleton}`
    : '';

  return [
    `You are an expert developer assistant tasked with fixing architectural violations in source code.`,
    `### File: ${ctx.filePath}`,
    `### Original File Content:\n${ctx.fileContent}`,
    skeletonSection,
    `### Violations to Fix:\n${violationsBlock}`,
    `### Instructions:\n1. Analyze the original file content and the violations listed above.\n2. Produce a corrected version of the ENTIRE file that resolves ALL listed violations.\n3. Output ONLY the corrected file content, with no explanations, no markdown fences, and no surrounding text.\n4. Preserve all existing functionality that is NOT related to the violation.\n5. Do not remove imports, exports, or change the public API unless required by the fix.\n6. The output must be valid, compilable source code.`,
  ]
    .filter(Boolean)
    .join('\n\n');
}
