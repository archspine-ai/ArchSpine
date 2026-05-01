import * as childProcess from 'child_process';
import type { ExecFileSyncOptionsWithStringEncoding } from 'child_process';

export interface ScannerGitClient {
  run(args: readonly string[], options: ExecFileSyncOptionsWithStringEncoding): string;
}

export const defaultScannerGitClient: ScannerGitClient = {
  run(args, options) {
    return childProcess.execFileSync('git', [...args], options);
  },
};
