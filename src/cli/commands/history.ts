import { Manifest } from '../../infra/manifest.js';
import { ErrorCodes, toArchSpineError } from '../../core/errors.js';

import { throwCliUsage } from '../cli-utils.js';

export interface ExecuteHistoryCommandOptions {
  args: string[];
  rootDir: string;
}

export async function executeHistoryCommand({
  args,
  rootDir,
}: ExecuteHistoryCommandOptions): Promise<void> {
  const filePath = args[0];
  if (!filePath) {
    throwCliUsage('Usage: spine history <file_path>');
  }

  try {
    const manifest = Manifest.open(rootDir);
    const limit = 50;
    const events = manifest.getDriftHistory(filePath, limit);

    if (events.length === 0) {
      console.log(`No semantic drift history found for '${filePath}'.`);
      return;
    }

    const currentDocs = manifest.getFileDocs(filePath);
    const currentSemantic = currentDocs?.semantic || { role: 'Unknown', responsibilities: [] };

    console.log(`\nSemantic Drift History for: ${filePath}\n`);

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const newRole = i === 0 ? currentSemantic.role : events[i - 1].previousRole;
      const newResp =
        i === 0 ? currentSemantic.responsibilities || [] : events[i - 1].previousResponsibilities;

      const detectedDate = new Date(event.detectedAt);
      const dateStr = !isNaN(detectedDate.getTime())
        ? detectedDate
            .toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
            .replace(/\//g, '-')
        : event.detectedAt;

      console.log(`🕒 ${dateStr} | ${filePath}`);
      console.log(`   [Drift Reason]: ${event.driftReason}`);

      if (event.previousRole !== newRole) {
        console.log(`   [Role Change]:`);
        console.log(`     - (Before) ${event.previousRole}`);
        console.log(`     + (After)  ${newRole}`);
      }

      console.log(`   [Responsibilities Drift]:`);

      const prevSet = new Set(event.previousResponsibilities);
      const newSet = new Set(newResp);

      let changedResp = false;

      for (const pr of event.previousResponsibilities) {
        if (!newSet.has(pr)) {
          console.log(`     - (Removed) ${pr}`);
          changedResp = true;
        }
      }

      for (const nr of newResp) {
        if (!prevSet.has(nr)) {
          console.log(`     + (Added)   ${nr}`);
          changedResp = true;
        }
      }

      if (!changedResp) {
        console.log(`     (Minor semantic shift, bullet points remained stable)`);
      }

      console.log('');
    }
  } catch (error) {
    throw toArchSpineError(
      error,
      ErrorCodes.CliCommandFailed,
      `Failed to retrieve history for ${filePath}.`,
      { context: { command: 'history', filePath } },
    );
  }
}
