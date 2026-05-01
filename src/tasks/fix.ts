import * as fs from 'fs';
import * as path from 'path';
import { createTwoFilesPatch } from 'diff';
import { parse } from '@ast-grep/napi';
import { SpineTask, TaskContext } from '../core/task.js';
import type { FixStageInput, FixStageOutput, FixViolation } from '../core/task-types.js';
import { addTaskUsage } from '../core/task-state.js';
import { generateFixPrompt, type FixViolationContext } from '../engines/fix-prompt.js';
import { FileSystemManager } from '../utils/fs.js';
import { LangRegistry } from '../ast/lang-registry.js';

interface FileViolationGroup {
  filePath: string;
  violations: {
    ruleId: string;
    severity: string;
    reason: string;
    ruleContent?: string;
  }[];
}

export class FixTask extends SpineTask<FixStageInput, FixStageOutput> {
  name = 'Architectural Auto-fix';
  checkpointId = 'fix';

  async execute(ctx: TaskContext, input: FixStageInput): Promise<FixStageOutput> {
    if (!ctx.llmClient) {
      ctx.runtimeIO.error(
        '[Task: Fix] Cannot run without an LLM provider. Configure one with "spine init" or "spine llm setup".',
      );
      return { fixed: 0, skipped: 0, failed: 0, recheckFiles: [] };
    }

    if (!ctx.llmClient.generateText) {
      ctx.runtimeIO.error('[Task: Fix] The current LM provider does not support generateText.');
      return { fixed: 0, skipped: 0, failed: 0, recheckFiles: [] };
    }

    const violations = input.violations;
    if (violations.length === 0) {
      ctx.runtimeIO.info('[Task: Fix] No active violations to fix.');
      return { fixed: 0, skipped: 0, failed: 0, recheckFiles: [] };
    }

    const grouped = this.groupViolationsByFile(violations);
    ctx.runtimeIO.info(
      `[Task: Fix] Found ${violations.length} violations across ${grouped.length} file(s).`,
    );

    let fixed = 0;
    let skipped = 0;
    let failed = 0;
    const recheckFiles = new Set<string>();

    for (const group of grouped) {
      ctx.executionCheckpoint?.markItemStarted(this.checkpointId, group.filePath, {
        violationCount: group.violations.length,
      });
      const result = await this.fixFile(ctx, group);
      if (result === 'fixed') {
        fixed++;
        recheckFiles.add(group.filePath);
        ctx.executionCheckpoint?.markItemCompleted(this.checkpointId, group.filePath, { result });
      } else if (result === 'skipped') {
        skipped++;
        ctx.executionCheckpoint?.markItemSkipped(this.checkpointId, group.filePath, { result });
      } else {
        failed++;
        ctx.executionCheckpoint?.markItemFailed(this.checkpointId, group.filePath, 'fix-failed', {
          result,
        });
      }
    }

    return { fixed, skipped, failed, recheckFiles: Array.from(recheckFiles) };
  }

  private groupViolationsByFile(violations: FixViolation[]): FileViolationGroup[] {
    const map = new Map<string, FileViolationGroup>();
    for (const v of violations) {
      if (!map.has(v.file_path)) {
        map.set(v.file_path, { filePath: v.file_path, violations: [] });
      }
      map.get(v.file_path)!.violations.push({
        ruleId: v.rule_id,
        severity: v.severity,
        reason: v.reason,
      });
    }
    return Array.from(map.values());
  }

  private async fixFile(
    ctx: TaskContext,
    group: FileViolationGroup,
  ): Promise<'fixed' | 'skipped' | 'failed'> {
    const absPath = path.join(ctx.rootDir, group.filePath);

    if (!fs.existsSync(absPath)) {
      ctx.runtimeIO.warn(`[Task: Fix] File not found: ${group.filePath}. Skipping.`);
      return 'skipped';
    }

    const originalContent = fs.readFileSync(absPath, 'utf-8');

    for (const v of group.violations) {
      const rulesForFile = ctx.ruleEngine.getRulesForFile(group.filePath);
      const matchingRule = rulesForFile.find((r) => r.includes(`[Rule: ${v.ruleId}]`));
      if (matchingRule) {
        v.ruleContent = matchingRule;
      }
    }

    let structuralSkeleton = '';
    try {
      if (
        LangRegistry.isSourceFile(group.filePath) &&
        !ctx.runtimeCache.unsupportedFiles.has(group.filePath)
      ) {
        const skeleton = await ctx.extractor.extract(originalContent, group.filePath);
        structuralSkeleton = JSON.stringify(skeleton, null, 2);
      }
    } catch (e) {
      ctx.runtimeIO.warn(
        `[Task: Fix] AST extraction failed for ${group.filePath}, proceeding without skeleton.`,
      );
    }

    const fixContext: FixViolationContext = {
      filePath: group.filePath,
      fileContent: originalContent,
      structuralSkeleton,
      violations: group.violations,
    };

    const prompt = generateFixPrompt(fixContext);

    ctx.runtimeIO.info(
      `\n[Task: Fix] Requesting fix for ${group.filePath} (${group.violations.length} violation(s))...`,
    );

    let fixedContent: string;
    try {
      const result = await ctx.llmClient!.generateText!(prompt);
      fixedContent = result.content;
      addTaskUsage(ctx, result.usage);
    } catch (e) {
      ctx.runtimeIO.error(`[Task: Fix] LLM request failed for ${group.filePath}:`, e);
      return 'failed';
    }

    fixedContent = this.cleanLLMOutput(fixedContent);

    if (fixedContent === originalContent) {
      ctx.runtimeIO.info(
        `[Task: Fix] LLM returned unchanged content for ${group.filePath}. Skipping.`,
      );
      return 'skipped';
    }

    if (!(await this.validateSyntax(group.filePath, fixedContent))) {
      ctx.runtimeIO.warn(
        `\n⚠️  [Task: Fix] LLM generated syntactically invalid code for ${group.filePath}. Skipping to prevent corruption.`,
      );
      return 'failed';
    }

    const diff = this.generateUnifiedDiff(group.filePath, originalContent, fixedContent);

    ctx.runtimeIO.info(`\n--- Proposed Fix for ${group.filePath} ---`);
    ctx.runtimeIO.info(diff);
    ctx.runtimeIO.info(`--- End of Diff ---\n`);

    const confirm = await ctx.runtimeIO.confirm(`Apply fix to ${group.filePath}?`);

    if (!confirm) {
      ctx.runtimeIO.info(`[Task: Fix] Skipped ${group.filePath}.`);
      return 'skipped';
    }

    try {
      FileSystemManager.safeWriteFile(absPath, fixedContent);
      ctx.manifest.clearViolations(group.filePath);
      ctx.runtimeIO.info(`[Task: Fix] Applied fix to ${group.filePath}.`);
      return 'fixed';
    } catch (e) {
      ctx.runtimeIO.error(`[Task: Fix] Failed to apply safe write for ${group.filePath}:`, e);
      return 'failed';
    }
  }

  public async validateSyntax(filePath: string, content: string): Promise<boolean> {
    const resolved = await LangRegistry.resolve(filePath);
    if (!resolved.supported) {
      return true;
    }

    try {
      const root = parse(resolved.config.langKey, content).root();
      // In ast-grep, we check for ERROR nodes to identify syntax errors
      const errorNode = root.find({ rule: { kind: 'ERROR' } });
      return errorNode === null;
    } catch (e) {
      return false;
    }
  }

  private cleanLLMOutput(content: string): string {
    let cleaned = content.trim();
    // Remove potential markdown fences
    const markdownFence = /^```[\w]*\n([\s\S]*?)```$/;
    const match = cleaned.match(markdownFence);
    if (match) {
      cleaned = match[1].trim();
    }
    return cleaned;
  }

  private generateUnifiedDiff(filePath: string, oldContent: string, newContent: string): string {
    return createTwoFilesPatch(
      `a/${filePath}`,
      `b/${filePath}`,
      oldContent,
      newContent,
      'original',
      'fixed',
      { context: 3 },
    );
  }
}
