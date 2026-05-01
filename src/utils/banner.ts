/* eslint-disable no-console -- CLI banner output is inherently console-based */
import chalk from 'chalk';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';

let cachedVersion = '';
function getVersion(): string {
  if (cachedVersion) {
    return cachedVersion;
  }
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const pkgContent = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgContent);
    cachedVersion = `v${pkg.version || '0.0.0'}`;
  } catch (e) {
    cachedVersion = 'v0.0.0'; // Fallback if unable to read
  }
  return cachedVersion;
}

const BANNER_LINES = [
  ' █████╗ ██████╗  ██████╗██╗  ██╗███████╗██████╗ ██╗███╗   ██╗███████╗',
  '██╔══██╗██╔══██╗██╔════╝██║  ██║██╔════╝██╔══██╗██║████╗  ██║██╔════╝',
  '███████║██████╔╝██║     ███████║███████╗██████╔╝██║██╔██╗ ██║█████╗  ',
  '██╔══██║██╔══██╗██║     ██╔══██║╚════██║██╔═══╝ ██║██║╚██╗██║██╔══╝  ',
  '██║  ██║██║  ██║╚██████╗██║  ██║███████║██║     ██║██║ ╚████║███████╗',
  '╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═══╝╚══════╝',
];

const COMPACT_A_LINES = BANNER_LINES.map((line) => line.slice(0, 8));
const COMPACT_S_LINES = [' ██████╗', '██╔════╝', '╚██████╗', ' ╚═══██╗', '███████║', '╚══════╝'];

const ARCH_END = 32;
const MIN_FULL_BANNER_WIDTH = 76;

export function printFullBanner() {
  const brandBlue = '#ec9877';
  const brandYellow = '#ebefbb';
  const brandSubtitle = '#b5b5b5ff'; // 您可以在这里单独调整下行文字的颜色
  const termWidth = process.stdout.columns || 80;

  if (termWidth < MIN_FULL_BANNER_WIDTH) {
    printCompactBanner();
    return;
  }

  const maxWidth = BANNER_LINES[0].length;
  const leftPadding = Math.max(0, Math.floor((termWidth - maxWidth) / 2));
  const pad = ' '.repeat(leftPadding);

  console.log('');
  for (const line of BANNER_LINES) {
    let colored = pad;
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== ' ') {
        const color = i < ARCH_END ? brandBlue : brandYellow;
        colored += chalk.hex(color)(line[i]);
      } else {
        colored += ' ';
      }
    }
    console.log(colored);
  }

  const subtitle = 'Architectural Governance & Semantic Layer for the AI Era';
  const subPadding = Math.max(0, Math.floor((termWidth - subtitle.length) / 2));
  console.log('\n' + ' '.repeat(subPadding) + chalk.hex(brandSubtitle).italic(subtitle) + '\n');
}

/**
 * Renders a compact version of the ArchSpine logo for narrow terminals.
 */
export function printMiniBanner() {
  const arch = chalk.hex('#ec9877').bold('Arch');
  const spine = chalk.hex('#ebefbb').bold('Spine');
  console.log(`\n🦴 ${arch}${spine} | ${getVersion()}\n`);
}

function printCompactBanner() {
  const brandBlue = '#ec9877';
  const brandYellow = '#ebefbb';
  const termWidth = process.stdout.columns || 80;
  const compactWidth = COMPACT_A_LINES[0].length + 1 + COMPACT_S_LINES[0].length;
  const leftPadding = Math.max(0, Math.floor((termWidth - compactWidth) / 2));

  console.log('');
  for (let i = 0; i < COMPACT_A_LINES.length; i++) {
    let colored = ' '.repeat(leftPadding);
    for (const char of COMPACT_A_LINES[i]) {
      colored += char === ' ' ? ' ' : chalk.hex(brandBlue)(char);
    }
    colored += ' ';
    for (const char of COMPACT_S_LINES[i]) {
      colored += char === ' ' ? ' ' : chalk.hex(brandYellow)(char);
    }
    console.log(colored);
  }
  console.log('');
}
