import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import { SpineTask, TaskContext, TaskContextFor } from '../core/task.js';
import type { ExtractionStageOutput } from '../core/task-types.js';
import type { PreviousSemanticContext } from '../infra/llm.js';
import {
  buildSourcePromptArtifacts,
  RelevanceDiagnosticsSnapshot,
} from '../infra/prompt-context.js';
import { resolveValidatePolicy } from '../infra/prompt-policy.js';
import { LangRegistry } from '../ast/lang-registry.js';
import { RuleViolation } from '../types/protocol.js';
import { addTaskUsage, pushValidateDiagnostics } from '../core/task-state.js';

const VALIDATE_POLICY = resolveValidatePolicy('validate');

type ValidationTaskContext = TaskContextFor<
  | 'rootDir'
  | 'scanner'
  | 'manifest'
  | 'outputManager'
  | 'ruleEngine'
  | 'contextEngine'
  | 'extractor'
  | 'llmClient'
  | 'runtimeIO'
  | 'executionCheckpoint'
  | 'state'
>;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeRuleViolations(value: unknown): RuleViolation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowedSeverity = new Set(['advisory', 'warning', 'error']);
  const normalized = value
    .filter(isObjectRecord)
    .map((entry) => ({
      id: typeof entry.id === 'string' ? entry.id.trim() : '',
      severity:
        typeof entry.severity === 'string' && allowedSeverity.has(entry.severity)
          ? entry.severity
          : 'warning',
      reason: typeof entry.reason === 'string' ? entry.reason.trim() : '',
    }))
    .filter((entry) => entry.id.length > 0 && entry.id !== 'rule-id');

  return normalized.filter(
    (entry, index, items) =>
      items.findIndex(
        (candidate) =>
          candidate.id === entry.id &&
          candidate.severity === entry.severity &&
          candidate.reason === entry.reason,
      ) === index,
  );
}

export interface ValidationSummary {
  auditedFiles: number;
  filesWithRules: number;
  filesWithViolations: number;
  totalViolations: number;
  failedFiles: number;
}

export interface ValidationTaskResult {
  summary: ValidationSummary;
  stage: ExtractionStageOutput;
}

function createEmptyValidationSummary(): ValidationSummary {
  return {
    auditedFiles: 0,
    filesWithRules: 0,
    filesWithViolations: 0,
    totalViolations: 0,
    failedFiles: 0,
  };
}

function getTaskFileKind(file: string): 'source' | 'config' | 'document' {
  if (LangRegistry.isSourceFile(file)) {
    return 'source';
  }
  if (file.endsWith('.json')) {
    return 'config';
  }
  return 'document';
}

function recordValidationViolations(
  taskCtx: ValidationTaskContext,
  file: string,
  actualViolations: RuleViolation[],
): number {
  // Sync index JSON so it stays consistent with the DB violation state.
  // SpineSemantic fields are readonly in the type system but the runtime
  // object from JSON.parse is mutable.
  const existingIndex = taskCtx.outputManager.readIndex(file);
  if (existingIndex) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (existingIndex as any).semantic.ruleViolations = actualViolations;
    taskCtx.outputManager.saveIndex(file, existingIndex);
  }

  if (actualViolations.length === 0) {
    taskCtx.runtimeIO.info(`✅ [Check Passed] ${file}`);
    return 0;
  }

  taskCtx.runtimeIO.error(`\n❌ [Check Failed] ${file} violates architecture rules:`);
  for (const violation of actualViolations) {
    taskCtx.runtimeIO.error(`   - Rule ID: ${violation.id}`);
    taskCtx.runtimeIO.error(`     Severity: ${violation.severity || 'warning'}`);
    taskCtx.runtimeIO.error(`     Reason: ${violation.reason}`);
    taskCtx.manifest.recordViolation(
      file,
      violation.id,
      violation.severity || 'warning',
      violation.reason,
    );
  }
  taskCtx.runtimeIO.error('');
  return actualViolations.length;
}

export class ValidationTask extends SpineTask<ExtractionStageOutput, ValidationTaskResult> {
  name = 'Semantic Architecture Audit';
  checkpointId = 'validation';

  async execute(ctx: TaskContext, input: ExtractionStageOutput): Promise<ValidationTaskResult> {
    const taskCtx: ValidationTaskContext = ctx;

    // Purge stale violations from rules that have been deleted since the last check run.
    const activeRuleIds = taskCtx.ruleEngine.getAllRuleIds();
    const deletedCount = taskCtx.manifest.deleteOrphanViolations(activeRuleIds);
    if (deletedCount > 0) {
      ctx.runtimeIO.info(
        `[Task: Validation] Cleaned ${deletedCount} stale violation(s) from deleted rules.`,
      );
    }

    if (!ctx.llmClient) {
      let filesWithRules = 0;
      for (const file of input.selection.filteredFiles) {
        const rulesForFile = taskCtx.ruleEngine.getRulesForFile(file);
        if (rulesForFile.length === 0) {
          taskCtx.executionCheckpoint?.markItemSkipped(this.checkpointId, file, {
            reason: 'no-rules',
          });
        } else {
          filesWithRules++;
          taskCtx.executionCheckpoint?.markItemSkipped(this.checkpointId, file, {
            reason: 'llm-unavailable',
          });
        }
      }
      ctx.runtimeIO.warn(
        `[Task: Validation] Skipping semantic audit because LLM Client is not configured (${filesWithRules} file(s) had rules).`,
      );
      return {
        summary: {
          ...createEmptyValidationSummary(),
          filesWithRules,
        },
        stage: input,
      };
    }

    const limit = pLimit(5);
    const branch = taskCtx.scanner.getBranchName();
    const status = taskCtx.scanner.getGitStatusInfo();

    let auditedFiles = 0;
    let filesWithRules = 0;
    let filesWithViolations = 0;
    let totalViolations = 0;
    let failedFiles = 0;

    const validationPromises = input.selection.filteredFiles.map((file) =>
      limit(async () => {
        const rulesForFile = taskCtx.ruleEngine.getRulesForFile(file);
        if (rulesForFile.length === 0) {
          taskCtx.executionCheckpoint?.markItemSkipped(this.checkpointId, file, {
            reason: 'no-rules',
          });
          return;
        }

        filesWithRules++;
        auditedFiles++;
        // Rebuild the violation state for this file from the current validation pass.
        taskCtx.manifest.clearViolations(file);
        taskCtx.runtimeIO.info(
          `[Task: Validation] Auditing ${file} with ${rulesForFile.length} rules...`,
        );
        taskCtx.executionCheckpoint?.markItemStarted(this.checkpointId, file, {
          ruleCount: rulesForFile.length,
        });

        const filePath = path.join(taskCtx.rootDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const gitIntent = taskCtx.scanner.getFileLastCommit(file);
        let ruleData = rulesForFile.join('\n\n');
        const fileKind = getTaskFileKind(file);
        const previousUnit = taskCtx.manifest.getFileDocs(file);
        let previousSemantic: PreviousSemanticContext | undefined = previousUnit?.semantic
          ? {
              role: previousUnit.semantic.role,
              responsibilities: previousUnit.semantic.responsibilities || [],
            }
          : undefined;

        let fileInput = content;
        let contextData = '';
        try {
          if (fileKind === 'source') {
            if (input.artifacts.unsupportedFiles.has(file)) {
              taskCtx.executionCheckpoint?.markItemSkipped(this.checkpointId, file, {
                reason: 'unsupported-language',
              });
              return;
            }
            const skeleton =
              input.artifacts.skeletons.get(file) ||
              (await taskCtx.extractor.extract(content, file));
            const resolved = taskCtx.contextEngine.resolveDependencies(
              file,
              skeleton,
              taskCtx.manifest,
              {
                taskMode: 'validate',
                ruleData,
              },
            );
            const promptArtifacts = buildSourcePromptArtifacts({
              content,
              skeleton,
              dependencyContext: resolved.contextData,
              dependencyDiagnostics: resolved.diagnostics,
              ruleData,
              previousSemantic,
              taskMode: 'validate',
              validatePolicy: VALIDATE_POLICY,
            });
            fileInput = promptArtifacts.fileInput;
            contextData = promptArtifacts.contextData;
            previousSemantic = promptArtifacts.previousSemantic;
            ruleData = promptArtifacts.ruleData;
            if (taskCtx.state.telemetry.diagnostics.mode !== 'off') {
              pushValidateDiagnostics(ctx, {
                filePath: file,
                prompt: promptArtifacts.diagnostics,
                context: resolved.diagnostics,
              });
            }
          }
        } catch (e) {
          const reason = e instanceof Error ? e.message : String(e);
          taskCtx.runtimeIO.warn(
            `[Validation] AST extraction or context resolution failed for ${file}, using raw content. Reason: ${reason}`,
          );
        }

        try {
          const result = await taskCtx.llmClient!.generateSummary(
            file,
            fileInput,
            contextData || undefined,
            ruleData,
            gitIntent || undefined,
            branch,
            status,
            previousSemantic,
            fileKind,
            'validate',
          );

          addTaskUsage(ctx, result.usage);

          const actualViolations = normalizeRuleViolations(result.json?.semantic?.ruleViolations);

          const violationsRecorded = recordValidationViolations(taskCtx, file, actualViolations);
          if (violationsRecorded > 0) {
            filesWithViolations++;
            totalViolations += violationsRecorded;
          }
          taskCtx.executionCheckpoint?.markItemCompleted(this.checkpointId, file, {
            violations: actualViolations.length,
          });
        } catch (e) {
          failedFiles++;
          taskCtx.executionCheckpoint?.markItemFailed(this.checkpointId, file, e);
          taskCtx.runtimeIO.error(`[Validation] Failed to audit ${file}:`, e);
        }
      }),
    );

    await Promise.all(validationPromises);
    if (
      taskCtx.state.telemetry.diagnostics.mode !== 'off' &&
      taskCtx.state.telemetry.diagnostics.validate.length > 0
    ) {
      const snapshot: RelevanceDiagnosticsSnapshot = {
        taskMode: 'validate',
        validatePolicy: VALIDATE_POLICY,
        generatedAt: new Date().toISOString(),
        files: taskCtx.state.telemetry.diagnostics.validate,
      };
      taskCtx.outputManager.saveDiagnostics('validate-diagnostics.json', snapshot);
      taskCtx.runtimeIO.info(
        `[Diagnostics] Wrote validate relevance snapshot for ${snapshot.files.length} file(s).`,
      );
    }
    const summary: ValidationSummary = {
      auditedFiles,
      filesWithRules,
      filesWithViolations,
      totalViolations,
      failedFiles,
    };
    taskCtx.runtimeIO.info(
      `[Task: Validation] Summary: audited ${summary.auditedFiles} file(s), found ${summary.totalViolations} violation(s) across ${summary.filesWithViolations} file(s).`,
    );
    return {
      summary,
      stage: input,
    };
  }
}
