import type { FileSkeleton } from '../ast/extractor.js';
import type { SpineSemantic } from '../types/protocol.js';
import { createHash } from 'crypto';

function normalizeStringArray(input: string[]): string[] {
  return Array.from(new Set(input.map((item) => item.trim()).filter(Boolean))).sort();
}

function stableHash(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function calculateStructuralFootprint(skeleton: FileSkeleton): string {
  const normalized = {
    imports: (skeleton.imports || [])
      .map((item) => ({
        source: item.source,
        symbols: normalizeStringArray(item.symbols || []),
      }))
      .sort((a, b) =>
        `${a.source}:${a.symbols.join(',')}`.localeCompare(`${b.source}:${b.symbols.join(',')}`),
      ),
    exports: (skeleton.exports || [])
      .map((item) => ({
        name: item.name,
        signature: item.signature || '',
      }))
      .sort((a, b) => `${a.name}:${a.signature}`.localeCompare(`${b.name}:${b.signature}`)),
  };
  return stableHash(normalized);
}

export function calculateSemanticFootprint(semantic: SpineSemantic): string {
  const normalized = {
    role: semantic.role || '',
    responsibilities: normalizeStringArray(semantic.responsibilities || []),
    publicSurface: (semantic.publicSurface || [])
      .map((entry) => ({
        symbolName: entry.symbolName || '',
        description: entry.description || '',
      }))
      .sort((a, b) =>
        `${a.symbolName}:${a.description}`.localeCompare(`${b.symbolName}:${b.description}`),
      ),
  };
  return stableHash(normalized);
}
