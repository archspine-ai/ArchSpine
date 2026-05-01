/* eslint-disable no-console, @typescript-eslint/no-explicit-any -- Foldable output module wraps console */
import * as util from 'util';
import chalk from 'chalk';

const IS_CI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

/**
 * Runs an async action with its console output folded.
 * Displays a blinking orange dot and allows the user to press SPACE to unfold details.
 */
export async function runWithFoldableOutput<T>(
  action: () => Promise<T>,
  options: { fallbackMessage?: string } = {},
): Promise<T> {
  // If not a TTY or is CI, fallback to native behavior completely for safety
  if (!process.stdout.isTTY || IS_CI) {
    if (options.fallbackMessage) {
      console.log(options.fallbackMessage);
    }
    return action();
  }

  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  const logBuffer: string[] = [];
  let isExpanded = false;
  let intervalId: NodeJS.Timeout | null = null;
  let tick = 0;

  const animateDot = () => {
    if (isExpanded) {
      return;
    }
    tick++;
    const showDot = tick % 2 === 0;
    const dot = showDot ? chalk.hex('#FFA500')('·') : ' ';
    process.stdout.write(
      `\r${chalk.dim('Syncing architecture state...')} [${dot}] ${chalk.dim("(Press 'SPACE' for details)")}\x1b[K`,
    );
  };

  const expandNow = (forcePrintBuffered: boolean) => {
    if (isExpanded) {
      return;
    }
    isExpanded = true;

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    // Clear the current line
    process.stdout.write('\r\x1b[K');

    if (forcePrintBuffered && logBuffer.length > 0) {
      originalConsoleLog(logBuffer.join('\n'));
    }

    // Restore original console
    console.log = originalConsoleLog;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;

    // Restore input mode
    try {
      process.stdin.setRawMode(false);
      process.stdin.removeAllListeners('data');
      process.stdin.pause();
    } catch {
      // Ignore — stdin setRawMode not supported
    }

    // Show cursor
    process.stdout.write('\x1b[?25h');
  };

  // Setup interception
  console.log = (...args: any[]) => {
    logBuffer.push(util.format(...args));
  };
  console.info = (...args: any[]) => {
    logBuffer.push(util.format(...args));
  };

  // Intercept warnings and errors to force expansion
  console.warn = (...args: any[]) => {
    if (!isExpanded) {
      expandNow(true);
    }
    originalConsoleWarn(...args);
  };
  console.error = (...args: any[]) => {
    if (!isExpanded) {
      expandNow(true);
    }
    originalConsoleError(...args);
  };

  // Setup terminal
  process.stdout.write('\x1b[?25l'); // Hide cursor

  // Setup input
  let rawModeSupported = false;
  try {
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      process.stdin.on('data', (key: string) => {
        // ctrl-c (end of text)
        if (key === '\u0003') {
          expandNow(true);
          process.exit(1);
        }

        // space bar
        if (key === ' ') {
          expandNow(true);
        }
      });
      rawModeSupported = true;
    }
  } catch (e) {
    // Ignore error, raw mode degrades to standard
  }

  if (!rawModeSupported) {
    expandNow(false);
    return action();
  }

  intervalId = setInterval(animateDot, 500);
  animateDot(); // Initial draw

  try {
    const result = await action();
    // Exit successfully. If user never pressed space, those logs are safely skipped from terminal
    // and we clear the folding line so it's clean for the final summary.
    expandNow(false);
    return result;
  } catch (error) {
    // If it fails, force expand the logs so the user can debug the trace leading up to failure
    expandNow(true);
    throw error;
  }
}
