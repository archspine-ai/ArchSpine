import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('ts-node/esm', pathToFileURL(`${process.cwd()}/`));

const [{ LockManager }] = await Promise.all([import('../../src/utils/lock.ts')]);

const [rootDir, mode = 'acquire-release', holdMsArg = '0'] = process.argv.slice(2);
const holdMs = Number(holdMsArg) || 0;
let keepAliveTimer = null;

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function holdProcessOpenUntilExit() {
  if (!keepAliveTimer) {
    keepAliveTimer = setInterval(() => {}, 1000);
  }
}

function registerSignalExit() {
  const exitSoon = () => {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
    setImmediate(() => process.exit(0));
  };

  process.once('SIGINT', exitSoon);
  process.once('SIGTERM', exitSoon);
}

async function main() {
  const lockManager = new LockManager(rootDir);

  try {
    lockManager.acquire();

    if (mode === 'acquire-hold') {
      emit({ status: 'acquired', pid: process.pid });
      registerSignalExit();
      setTimeout(() => {
        lockManager.release();
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
        process.exit(0);
      }, holdMs);
      holdProcessOpenUntilExit();
      return;
    }

    if (mode === 'acquire-release-rewrite') {
      emit({ status: 'acquired', pid: process.pid });
      registerSignalExit();
      holdProcessOpenUntilExit();
      return;
    }

    lockManager.release();
    emit({ status: 'acquired-and-released', pid: process.pid });
  } catch (error) {
    emit({
      status: 'error',
      pid: process.pid,
      code: error?.code || null,
      message: error?.message || 'Unknown lock worker error.',
    });
    process.exitCode = 1;
  }
}

await main();
