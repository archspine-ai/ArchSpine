import { describe, expect, it } from 'vitest';
import {
  calculateSemanticFootprint,
  calculateStructuralFootprint,
} from '../src/utils/footprint.js';

describe('footprint', () => {
  it('keeps structural footprint stable for import/export ordering noise', () => {
    const left = calculateStructuralFootprint({
      imports: [
        { source: './b', symbols: ['B', 'A'] },
        { source: './a', symbols: ['C'] },
      ],
      exports: [
        { name: 'run', kind: 'Function', signature: 'run()' },
        { name: 'init', kind: 'Function', signature: 'init()' },
      ],
    });

    const right = calculateStructuralFootprint({
      imports: [
        { source: './a', symbols: ['C'] },
        { source: './b', symbols: ['A', 'B'] },
      ],
      exports: [
        { name: 'init', kind: 'Function', signature: 'init()' },
        { name: 'run', kind: 'Function', signature: 'run()' },
      ],
    });

    expect(left).toBe(right);
  });

  it('changes semantic footprint only when role/responsibilities/public surface changes', () => {
    const baseline = calculateSemanticFootprint({
      role: 'CLI facade',
      responsibilities: ['dispatch command', 'handle output'],
      outOfScope: [],
      invariants: [],
      changeIntent: { architecturalIntent: null, recentChangeIntent: null },
      publicSurface: [{ symbolName: 'sync', description: 'Run sync' }],
    });

    const same = calculateSemanticFootprint({
      role: 'CLI facade',
      responsibilities: ['handle output', 'dispatch command'],
      outOfScope: ['ignored'],
      invariants: [{ id: 'ignored', description: 'ignored', enforceable: true }],
      changeIntent: { architecturalIntent: 'ignored', recentChangeIntent: 'ignored' },
      publicSurface: [{ symbolName: 'sync', description: 'Run sync' }],
    });

    const changed = calculateSemanticFootprint({
      role: 'CLI facade',
      responsibilities: ['dispatch command', 'handle output'],
      outOfScope: [],
      invariants: [],
      changeIntent: { architecturalIntent: null, recentChangeIntent: null },
      publicSurface: [{ symbolName: 'publish', description: 'Run publish' }],
    });

    expect(baseline).toBe(same);
    expect(changed).not.toBe(baseline);
  });
});
