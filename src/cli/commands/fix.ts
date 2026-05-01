import { RuntimeService } from '../../services/runtime-service.js';
import { ArchSpineError, ErrorCodes } from '../../core/errors.js';

export interface ExecuteFixCommandOptions {
  runtimeService: RuntimeService;
}

export async function executeFixCommand({
  runtimeService,
}: ExecuteFixCommandOptions): Promise<void> {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  [EXPERIMENTAL] "spine fix" is a generative feature.');
  console.log(
    '\x1b[33m%s\x1b[0m',
    '   It may produce syntactically correct but logically unexpected code.',
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    '   Always review the proposed diff and ensure tests pass after applying.\n',
  );

  const fixSummary = await runtimeService.getFixService().run();
  if (fixSummary.remainingViolations > 0) {
    throw new ArchSpineError(
      ErrorCodes.CliCommandFailed,
      `[Fix] ${fixSummary.remainingViolations} violation(s) remain unresolved.`,
      { context: { remainingViolations: fixSummary.remainingViolations }, exitCode: 1 },
    );
  }
}
