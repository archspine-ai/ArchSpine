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
    `### Instructions:`,
    `1. Analyze the original file content and the violations listed above.`,
    `2. Produce a corrected version of the ENTIRE file that resolves ALL listed violations.`,
    `3. Output ONLY the corrected file content, with no explanations, no markdown fences, and no surrounding text.`,
    `4. Preserve all existing functionality that is NOT related to the violation.`,
    `5. Do not remove imports, exports, or change the public API unless required by the fix.`,
    `6. The output must be valid, compilable source code.`,
    ``,
    `### Critical patterns for architectural fixes:`,
    `- Prefer importing and calling a single, well-named function from the correct layer (e.g. \`import { getUsers } from '../services/userService.js'\`) rather than instantiating service classes or calling connect/initialize methods.`,
    `- Keep the fixed module as thin as possible — it should delegate work, not orchestrate lifecycle.`,
    `- Preserve all log messages, string literals, and comments exactly as they appear in the original.`,
    `- For naming convention violations, only rename the identifier — do not change any other part of the declaration.`,
  ]
    .filter(Boolean)
    .join('\n\n');
}
