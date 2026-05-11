import { Config } from '../../infra/config.js';
import { Scanner } from '../../engines/scanner.js';
import { runQuickScan, saveQuickScanResults } from '../../engines/quick-scan.js';
import { throwCliUsage } from '../cli-utils.js';

export interface ExecuteScanCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
}

export async function executeScanCommand({
  args,
  rootDir,
  config,
}: ExecuteScanCommandOptions): Promise<void> {
  // --quick: pure AST scan without LLM
  if (args.includes('--quick')) {
    console.log('Scanning repository (quick mode, no LLM)...');
    const result = runQuickScan(rootDir);
    const outputPath = saveQuickScanResults(rootDir, result);

    console.log(
      `Quick scan complete: ${result.fileCount} files, ${result.nodes.length} modules, ${result.edges.length} dependencies`,
    );
    console.log(
      `Languages: ${Object.entries(result.languageStats)
        .map(([k, v]) => `${k} (${v})`)
        .join(', ')}`,
    );
    console.log(`Output: ${outputPath.replace(rootDir + '/', '')}`);
    return;
  }

  // --dry-run: show what would be scanned
  if (args[0] === '--dry-run') {
    const scanner = new Scanner(rootDir, config.getScanPolicy());
    console.log(scanner.formatDryRunReport());
    return;
  }

  throwCliUsage('Usage: spine scan --quick | --dry-run');
}
