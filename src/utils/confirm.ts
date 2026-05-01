import prompts from 'prompts';
import * as readline from 'readline';
import kleur from 'kleur';

function parseConfirmation(value: string | boolean | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'y' || normalized === 'yes') {
    return true;
  }

  if (normalized === 'n' || normalized === 'no') {
    return false;
  }

  return undefined;
}

export async function promptForExplicitConfirmation(message: string): Promise<boolean> {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message,
    validate: (input: string) => {
      return parseConfirmation(input) !== undefined
        ? true
        : 'Type y/yes or n/no, then press Enter.';
    },
  });

  return parseConfirmation(response.value) ?? false;
}

export async function promptForImmediateConfirmation(
  message: string,
  options: { skipNewline?: boolean } = {},
): Promise<boolean> {
  if (
    !process.stdin.isTTY ||
    !process.stdout.isTTY ||
    typeof process.stdin.setRawMode !== 'function'
  ) {
    return promptForExplicitConfirmation(message);
  }

  return new Promise<boolean>((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    const previousRawMode = stdin.isRaw;

    const cleanup = () => {
      stdin.removeListener('data', onData);
      if (!previousRawMode) {
        stdin.setRawMode(false);
      }
      stdin.pause();
    };

    const finish = (value: boolean) => {
      const symbol = value ? kleur.green('✔') : kleur.red('✖');
      const answer = value ? 'yes' : 'no';
      stdout.write(`\r\x1b[2K${symbol} ${message} › ${answer}${options.skipNewline ? '' : '\n'}`);
      cleanup();
      resolve(value);
    };

    const onData = (chunk: string | Buffer) => {
      const key = chunk.toString();
      if (key === 'y' || key === 'Y') {
        finish(true);
        return;
      }
      if (key === 'n' || key === 'N') {
        finish(false);
        return;
      }
      if (key === '\u001b') {
        finish(false);
        return;
      }
      if (key === '\u0003') {
        cleanup();
        stdout.write('^C\n');
        process.kill(process.pid, 'SIGINT');
      }
    };

    stdout.write(`? ${message} › `);
    readline.emitKeypressEvents(stdin);
    if (!previousRawMode) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.on('data', onData);
  });
}
