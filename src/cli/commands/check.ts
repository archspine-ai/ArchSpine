import { RuntimeService } from '../../services/runtime-service.js';
import { ArchSpineError, ErrorCodes } from '../../core/errors.js';

export interface ExecuteCheckCommandOptions {
  runtimeService: RuntimeService;
}

export async function executeCheckCommand({
  runtimeService,
}: ExecuteCheckCommandOptions): Promise<void> {
  const checkSummary = await runtimeService.getCheckService().run();
  if (checkSummary.totalViolations > 0 || checkSummary.failedFiles > 0) {
    throw new ArchSpineError(
      ErrorCodes.CliCommandFailed,
      '[Check] Completed with violations or validation failures.',
      {
        context: {
          totalViolations: checkSummary.totalViolations,
          failedFiles: checkSummary.failedFiles,
        },
        exitCode: 1,
      },
    );
  }
}
