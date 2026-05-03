import { RuntimeService } from '../../services/runtime-service.js';
import { ArchSpineError, ErrorCodes } from '../../core/errors.js';

export interface ExecuteFixCommandOptions {
  args: string[];
  runtimeService: RuntimeService;
}

export async function executeFixCommand({
  args,
  runtimeService,
}: ExecuteFixCommandOptions): Promise<void> {
  console.log(
    '\x1b[33m%s\x1b[0m',
    '⚠️  [实验性] spine fix 为实验性功能。推荐让 AI 编码 agent（Cursor、Claude Code）通过 MCP 直接阅读 .spine/ 控制面数据进行治理和修复。\n',
  );

  const skipConfirmation = args.includes('--yes');
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    console.log(
      '\x1b[36m%s\x1b[0m',
      '🔍  [DRY-RUN] Diffs will be displayed but no files will be modified.\n',
    );
  }

  const fixSummary = await runtimeService.getFixService({}, skipConfirmation, dryRun).run();
  if (fixSummary.remainingViolations > 0) {
    throw new ArchSpineError(
      ErrorCodes.CliCommandFailed,
      `[Fix] ${fixSummary.remainingViolations} violation(s) remain unresolved.`,
      { context: { remainingViolations: fixSummary.remainingViolations }, exitCode: 1 },
    );
  }
}
