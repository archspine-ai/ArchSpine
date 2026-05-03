import { RuntimeService } from '../../services/runtime-service.js';
import { ArchSpineError, ErrorCodes } from '../../core/errors.js';

export interface ExecuteCheckCommandOptions {
  runtimeService: RuntimeService;
}

export async function executeCheckCommand({
  runtimeService,
}: ExecuteCheckCommandOptions): Promise<void> {
  console.log(
    '\x1b[33m%s\x1b[0m',
    '⚠️  [实验性] spine check 为实验性功能。推荐让 AI 编码 agent（Cursor、Claude Code）通过 MCP 直接阅读 .spine/ 控制面数据进行架构治理。\n',
  );

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
