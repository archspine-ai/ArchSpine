import kleur from 'kleur';
import { ArchSpineError, ErrorCodes } from '../core/errors.js';
import { LanguageSnapshot } from '../types/protocol.js';
import { printFullBanner, printMiniBanner } from '../utils/banner.js';

function formatLanguageList(languages: string[]): string {
  return languages.join(', ') || 'none';
}

function shouldShowFullBanner(cmd?: string, _argsArr: string[] = []): boolean {
  const isHelp = !cmd || cmd.startsWith('-') || cmd === 'help';
  return isHelp || cmd === 'init' || cmd === 'build';
}

function shouldShowMiniBanner(cmd?: string): boolean {
  return cmd === 'sync';
}

export function parseConfigValue(raw: string): unknown {
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  if (normalized === 'null') {
    return null;
  }
  if (normalized === 'undefined') {
    return undefined;
  }

  const asNumber = Number(raw);
  if (raw.trim() !== '' && Number.isFinite(asNumber)) {
    return asNumber;
  }

  if (
    (raw.startsWith('{') && raw.endsWith('}')) ||
    (raw.startsWith('[') && raw.endsWith(']')) ||
    (raw.startsWith('"') && raw.endsWith('"'))
  ) {
    try {
      return JSON.parse(raw);
    } catch {
      // Fall back to raw string if the user did not provide valid JSON.
    }
  }

  return raw;
}

export function formatConfigValue(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

export function throwCliUsage(message: string): never {
  throw new ArchSpineError(ErrorCodes.CliUsageInvalid, message, { exitCode: 1 });
}

export function normalizeOptionalString(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export function printStep(message: string, options: { inline?: boolean } = {}): void {
  if (options.inline && process.stdout.isTTY) {
    process.stdout.write(` ${kleur.dim('›')} ${message}\n`);
  } else {
    console.log(`> ${message}`);
  }
}

/**
 * Utility to print language discovery results to CLI.
 */
export function printLanguageDiscovery(snapshot: LanguageSnapshot) {
  const table: string[] = [];
  table.push(`Detected languages:          ${formatLanguageList(Object.keys(snapshot.languages))}`);

  const available = Object.entries(snapshot.languages)
    .filter(([_, s]) => s.status === 'available')
    .map(([l]) => l);
  table.push(`Supported (package found):   ${formatLanguageList(available)}`);

  const unavailable = Object.entries(snapshot.languages)
    .filter(([_, s]) => s.status === 'unavailable')
    .map(([l, s]) => `${l} (${s.reason})`);
  if (unavailable.length > 0) {
    table.push(`Unavailable (package miss):  ${unavailable.join(', ')}`);
  }

  const allSupportedExtensions = Object.values(snapshot.languages).flatMap((l) => l.extensions);
  const unsupportedExts = snapshot.detectedExtensions.filter(
    (e) => !allSupportedExtensions.includes(e) && !['.md', '.json'].includes(e),
  );

  if (unsupportedExts.length > 0) {
    table.push(`Unsupported (no mapping):    ${unsupportedExts.join(', ')}`);
  }

  console.log(`\nLanguage Discovery Report:`);
  console.log(table.map((line) => `  ${line}`).join('\n'));
}

/**
 * Handles the display of CLI banners based on command and context.
 */
export function displayUIBanner(cmd?: string, _argsArr: string[] = []) {
  // Never show in hooks to prevent log pollution
  if (process.env.SPINE_INTERNAL_HOOK === 'true') {
    return;
  }

  if (shouldShowFullBanner(cmd, _argsArr)) {
    printFullBanner();
  } else if (shouldShowMiniBanner(cmd)) {
    printMiniBanner();
  }
}

function wrapParagraph(paragraph: string, width: number): string {
  const trimmed = paragraph.trim();
  if (!trimmed || width <= 0) {
    return trimmed;
  }

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
      continue;
    }

    if (currentLine.length + 1 + word.length <= width) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}

export function wrapPromptText(text: string, width = 80, indent = 0): string {
  const effectiveWidth = Math.max(24, width - indent);
  return text
    .split('\n')
    .map((paragraph) => wrapParagraph(paragraph, effectiveWidth))
    .join('\n');
}
