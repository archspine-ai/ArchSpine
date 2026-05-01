import { runGodMode } from '../../engines/god.js';
import { promptForExplicitConfirmation } from '../../utils/confirm.js';

export interface ExecuteGodCommandOptions {
  args: string[];
  rootDir: string;
}

export async function executeGodCommand({
  args,
  rootDir,
}: ExecuteGodCommandOptions): Promise<void> {
  console.log('WARNING: God Mode is not a production feature.');
  console.log(
    'It exists for human reading only and will generate one giant repository document named after the repo, for example `.spine/archspine-god.md`.',
  );
  console.log('Running it again will overwrite the existing repo-specific god file.\\n');

  if (!args.includes('--yes')) {
    const shouldRunGodMode = await promptForExplicitConfirmation('Run God Mode now? (y/n)');
    if (!shouldRunGodMode) {
      console.log('God Mode cancelled.');
      return;
    }
  }

  const { outputPath } = runGodMode(rootDir);
  console.log(`God Mode completed. Wrote ${outputPath}`);
}
