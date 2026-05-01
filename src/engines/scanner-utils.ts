import picomatch from 'picomatch';
import type { ScanDryRunReport } from './scanner.js';

export interface NotableExclusion {
  pattern: string;
  source: string;
  reason?: string;
}

export function normalizeScannerPath(file: string): string {
  return file.replace(/\\/g, '/').replace(/^\.\//, '');
}

export function normalizeScannerPattern(pattern: string): string {
  const normalized = normalizeScannerPath(pattern);
  if (normalized.endsWith('/')) {
    return `${normalized}**`;
  }
  return normalized;
}

export function createScannerMatcher(pattern: string): (input: string) => boolean {
  const matcher = picomatch(normalizeScannerPattern(pattern), { dot: true });
  return (input: string) => matcher(normalizeScannerPath(input));
}

export function splitScannerOutput(output: string): string[] {
  return output
    .split('\n')
    .map((line) => normalizeScannerPath(line))
    .filter((line) => line.trim() !== '');
}

export function uniqueScannerPaths(files: string[]): string[] {
  return [...new Set(files.map((file) => normalizeScannerPath(file)).filter(Boolean))];
}

export function getScannerGroupLabel(file: string): string {
  if (file.startsWith('.spine/rules/')) {
    return '.spine/rules/';
  }
  if (file === '.spine/config.json') {
    return '.spine/config.json';
  }
  if (!file.includes('/')) {
    return file;
  }
  const [firstSegment] = file.split('/');
  return `${firstSegment}/**`;
}

export function buildDryRunGroupedCounts(
  files: string[],
  isProtocolIncluded: (file: string) => boolean,
): ScanDryRunReport['groupedCounts'] {
  const groupedCountsMap = new Map<string, { count: number; protocolIncluded: boolean }>();

  for (const file of files) {
    const label = getScannerGroupLabel(file);
    const current = groupedCountsMap.get(label) || { count: 0, protocolIncluded: false };
    current.count += 1;
    current.protocolIncluded = current.protocolIncluded || isProtocolIncluded(file);
    groupedCountsMap.set(label, current);
  }

  return Array.from(groupedCountsMap.entries())
    .map(([label, group]) => ({
      label,
      count: group.count,
      protocolIncluded: group.protocolIncluded,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function formatDryRunReport(report: ScanDryRunReport): string {
  const lines: string[] = [];
  lines.push('Scan Policy');
  lines.push(`  File Source:        ${report.fileSource}`);
  lines.push(
    `  Inherit .gitignore: ${report.inheritGitIgnore ? 'true' : 'false'}${report.inheritGitIgnore ? ' ✓' : ''}`,
  );
  lines.push('Ignore Chain (applied in order)');

  report.ignoreChain.forEach((layer, index) => {
    const suffix = layer.applied ? `${layer.rulesCount} rules` : 'not found, skipped';
    lines.push(`  [${index + 1}] ${layer.label.padEnd(28, ' ')} ${suffix}`);
  });

  lines.push(`Would scan: ${report.wouldScan.length} files`);
  report.groupedCounts.slice(0, 10).forEach((group) => {
    const marker = group.protocolIncluded ? '  <- protocol-included' : '';
    lines.push(
      `  ${group.label.padEnd(20, ' ')} ${String(group.count).padStart(4, ' ')} files${marker}`,
    );
  });

  if (report.notableExclusions.length > 0) {
    lines.push('Notable exclusions');
    report.notableExclusions.forEach((item) => {
      const detail = item.reason ? ` (${item.reason})` : '';
      lines.push(`  ${item.pattern.padEnd(18, ' ')} -> ${item.source}${detail}`);
    });
  }

  return lines.join('\n');
}

export function collectNotableExclusions(
  ignoreChain: ScanDryRunReport['ignoreChain'],
  protocolExclusions: string[],
): NotableExclusion[] {
  const notablePatterns = new Set([
    'node_modules/',
    'dist/',
    'build/',
    'out/',
    'coverage/',
    '.spine/cache.db*',
    '.spine/.lock',
    '.spine/index/',
    '.spine/atlas/',
  ]);

  const collected: NotableExclusion[] = [];
  for (const layer of ignoreChain) {
    if (layer.label === 'builtin protocol exclusions') {
      continue;
    }
    if (!layer.applied) {
      continue;
    }
    for (const rule of layer.rules) {
      if (notablePatterns.has(rule)) {
        collected.push({ pattern: rule, source: layer.label });
      }
    }
  }

  for (const rule of protocolExclusions) {
    if (notablePatterns.has(rule)) {
      collected.push({
        pattern: rule,
        source: 'protocol exclusion',
        reason: 'cannot override',
      });
    }
  }

  return uniqueScannerPaths(collected.map((item) => `${item.pattern}::${item.source}`)).map(
    (key) => {
      const [pattern, source] = key.split('::');
      return collected.find((item) => item.pattern === pattern && item.source === source)!;
    },
  );
}
