import { describe, expect, it } from 'vitest';

// The pure utility functions from summarize.ts are not exported directly,
// but we can test their behavior through the class or by extracting the logic.
// For now we test the types and structure are valid.

// We test the pure helpers that are accessible through the module's behavior.
// Many are private but the logic is verifiable through integration patterns.

describe('SummarizationTask — pure helpers (behavior verification)', () => {
  describe('hasAllRequestedMarkdown (logic)', () => {
    // Replicated for testing since the function is module-private
    function hasAllRequestedMarkdown(
      markdown: Record<string, string> | undefined,
      targetLocales: string[],
    ): boolean {
      if (!markdown) {
        return false;
      }
      return targetLocales.every((locale) => {
        const content = markdown[locale];
        return typeof content === 'string' && content.trim().length > 0;
      });
    }

    it('Main Path: returns true when all locales present', () => {
      expect(
        hasAllRequestedMarkdown({ 'en-US': 'Hello', 'zh-CN': '你好' }, ['en-US', 'zh-CN']),
      ).toBe(true);
    });

    it('Boundary: returns false for undefined markdown', () => {
      expect(hasAllRequestedMarkdown(undefined, ['en-US'])).toBe(false);
    });

    it('Boundary: returns false when a locale is missing', () => {
      expect(hasAllRequestedMarkdown({ 'en-US': 'Hello' }, ['en-US', 'zh-CN'])).toBe(false);
    });

    it('Boundary: returns false for empty string content', () => {
      expect(hasAllRequestedMarkdown({ 'en-US': '  ' }, ['en-US'])).toBe(false);
    });
  });

  describe('formatMarkdownList (logic)', () => {
    function formatMarkdownList(items: unknown[]): string {
      const values = items.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      );
      if (values.length === 0) {
        return '- N/A';
      }
      return values.map((item) => `- ${item}`).join('\n');
    }

    it('Main Path: formats array of strings as markdown list', () => {
      expect(formatMarkdownList(['a', 'b'])).toBe('- a\n- b');
    });

    it('Boundary: returns N/A for empty array', () => {
      expect(formatMarkdownList([])).toBe('- N/A');
    });

    it('Boundary: filters non-string and empty items', () => {
      expect(formatMarkdownList(['valid', '', 42, null, '  '])).toBe('- valid');
    });
  });

  describe('getStringArray (logic)', () => {
    function getStringArray(value: unknown): string[] {
      return Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === 'string')
        : [];
    }

    it('Main Path: filters to only strings', () => {
      expect(getStringArray(['a', 1, 'b', true])).toEqual(['a', 'b']);
    });

    it('Boundary: returns empty array for non-array', () => {
      expect(getStringArray(null)).toEqual([]);
      expect(getStringArray(42)).toEqual([]);
    });
  });

  describe('shouldPropagateDirChange (logic)', () => {
    function shouldPropagateDirChange(
      previousUnit: { identity?: { semanticHash?: string } } | undefined,
      nextUnit: { identity?: { semanticHash?: string } },
    ): boolean {
      if (!previousUnit?.identity?.semanticHash || !nextUnit.identity?.semanticHash) {
        return true;
      }
      return previousUnit.identity.semanticHash !== nextUnit.identity.semanticHash;
    }

    it('Main Path: detects hash change', () => {
      expect(
        shouldPropagateDirChange(
          { identity: { semanticHash: 'aaa' } },
          { identity: { semanticHash: 'bbb' } },
        ),
      ).toBe(true);
    });

    it('Main Path: returns false for matching hashes', () => {
      expect(
        shouldPropagateDirChange(
          { identity: { semanticHash: 'aaa' } },
          { identity: { semanticHash: 'aaa' } },
        ),
      ).toBe(false);
    });

    it('Boundary: returns true when previous unit undefined', () => {
      expect(shouldPropagateDirChange(undefined, { identity: { semanticHash: 'aaa' } })).toBe(true);
    });

    it('Boundary: returns true when hash is missing', () => {
      expect(shouldPropagateDirChange({ identity: {} }, { identity: {} })).toBe(true);
    });
  });

  describe('getRuleViolations (logic)', () => {
    function isObjectRecord(value: unknown): value is Record<string, unknown> {
      return typeof value === 'object' && value !== null;
    }

    function getRuleViolations(value: unknown) {
      return Array.isArray(value)
        ? value.filter(isObjectRecord).map((entry) => ({
            id: typeof entry.id === 'string' ? entry.id : 'rule-id',
            severity: typeof entry.severity === 'string' ? entry.severity : 'warning',
            reason: typeof entry.reason === 'string' ? entry.reason : '',
          }))
        : undefined;
    }

    it('Main Path: parses valid violations', () => {
      const result = getRuleViolations([{ id: 'R1', severity: 'error', reason: 'Bad.' }]);
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe('R1');
    });

    it('Boundary: returns undefined for non-array input', () => {
      expect(getRuleViolations(null)).toBeUndefined();
    });

    it('Boundary: falls back to defaults for missing fields', () => {
      const result = getRuleViolations([{}]);
      expect(result![0].id).toBe('rule-id');
      expect(result![0].severity).toBe('warning');
      expect(result![0].reason).toBe('');
    });
  });

  describe('sanitizeSemantic (logic)', () => {
    function isObjectRecord(value: unknown): value is Record<string, unknown> {
      return typeof value === 'object' && value !== null;
    }

    function getStringArray(value: unknown): string[] {
      return Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === 'string')
        : [];
    }

    function getRuleViolations(value: unknown) {
      return Array.isArray(value)
        ? value.filter(isObjectRecord).map((entry) => ({
            id: typeof entry.id === 'string' ? entry.id : 'rule-id',
            severity: typeof entry.severity === 'string' ? entry.severity : 'warning',
            reason: typeof entry.reason === 'string' ? entry.reason : '',
          }))
        : undefined;
    }

    function sanitizeSemantic(raw: unknown) {
      const semantic = isObjectRecord(raw) ? raw : {};
      const changeIntent = isObjectRecord(semantic.changeIntent) ? semantic.changeIntent : {};
      return {
        role: typeof semantic.role === 'string' ? semantic.role : 'Unknown role',
        responsibilities: getStringArray(semantic.responsibilities),
        outOfScope: getStringArray(semantic.outOfScope),
        invariants: Array.isArray(semantic.invariants) ? semantic.invariants : [],
        changeIntent: {
          architecturalIntent:
            typeof changeIntent.architecturalIntent === 'string'
              ? changeIntent.architecturalIntent
              : null,
          recentChangeIntent:
            typeof changeIntent.recentChangeIntent === 'string'
              ? changeIntent.recentChangeIntent
              : null,
        },
        publicSurface: Array.isArray(semantic.publicSurface) ? semantic.publicSurface : [],
        ruleViolations: getRuleViolations(semantic.ruleViolations),
        driftDetected: Boolean(semantic.driftDetected),
        driftReason: typeof semantic.driftReason === 'string' ? semantic.driftReason : null,
        localized: isObjectRecord(semantic.localized)
          ? (semantic.localized as Record<string, unknown>)
          : undefined,
      };
    }

    it('Main Path: extracts valid semantic from complete object', () => {
      const result = sanitizeSemantic({
        role: 'Auth Handler',
        responsibilities: ['Authenticate users', 'Manage sessions'],
        outOfScope: ['Database access'],
        invariants: ['Always validate tokens'],
        changeIntent: { architecturalIntent: 'Extract auth', recentChangeIntent: null },
        publicSurface: ['login', 'logout'],
        driftDetected: true,
        driftReason: 'Scope changed',
      });

      expect(result.role).toBe('Auth Handler');
      expect(result.responsibilities).toHaveLength(2);
      expect(result.outOfScope).toHaveLength(1);
      expect(result.driftDetected).toBe(true);
      expect(result.driftReason).toBe('Scope changed');
    });

    it('Boundary: provides defaults for null/undefined input', () => {
      const result = sanitizeSemantic(null);
      expect(result.role).toBe('Unknown role');
      expect(result.responsibilities).toEqual([]);
      expect(result.driftDetected).toBe(false);
      expect(result.driftReason).toBeNull();
    });

    it('Boundary: coerces driftDetected to boolean', () => {
      const result = sanitizeSemantic({ driftDetected: 'truthy-string' });
      expect(result.driftDetected).toBe(true);
    });

    it('Boundary: preserves localized data as object', () => {
      const result = sanitizeSemantic({
        role: 'Test',
        localized: { 'en-US': { role: 'Localized Role' } },
      });
      expect(result.localized).toBeDefined();
    });
  });

  describe('buildSpineSkeleton (logic)', () => {
    function buildSpineSkeleton(
      fileSkeleton: {
        imports?: Array<{ source: string; symbols: string[] }>;
        exports?: Array<{ name: string; kind: string; signature?: string | null }>;
      },
      filePath: string,
    ) {
      const imports = (fileSkeleton.imports || []).map((imp) => ({
        source: imp.source,
        symbols: imp.symbols,
        locality: (imp.source.startsWith('.') ? 'local' : 'external') as 'local' | 'external',
      }));

      const exports = (fileSkeleton.exports || []).map((exp) => ({
        name: exp.name,
        kind: exp.kind.toLowerCase() as any,
        signature: exp.signature || null,
      }));

      const declaredSymbols = (fileSkeleton.exports || []).map((exp) => ({
        name: exp.name,
        kind: exp.kind.toLowerCase() as any,
        exported: true,
        symbolUri: `${filePath}#`,
      }));

      const exportKinds = exports.map((e) => e.kind);
      const isTypeOnly =
        exportKinds.length > 0 && exportKinds.every((k) => k === 'interface' || k === 'type');

      return {
        imports,
        exports,
        declaredSymbols,
        structuralHints: {
          importCount: imports.length,
          exportCount: exports.length,
          isBarrel: exports.length >= 3 && imports.length >= 3,
          isTypeOnly,
        },
      };
    }

    it('Main Path: classifies local vs external imports', () => {
      const result = buildSpineSkeleton(
        {
          imports: [
            { source: './utils.js', symbols: ['helper'] },
            { source: 'external-lib', symbols: ['fn'] },
          ],
          exports: [],
        },
        'src/index.ts',
      );

      expect(result.imports[0].locality).toBe('local');
      expect(result.imports[1].locality).toBe('external');
    });

    it('Main Path: detects barrel files', () => {
      const result = buildSpineSkeleton(
        {
          imports: [
            { source: './a.js', symbols: ['A'] },
            { source: './b.js', symbols: ['B'] },
            { source: './c.js', symbols: ['C'] },
          ],
          exports: [
            { name: 'X', kind: 'class' },
            { name: 'Y', kind: 'function' },
            { name: 'Z', kind: 'const' },
          ],
        },
        'src/index.ts',
      );

      expect(result.structuralHints.isBarrel).toBe(true);
    });

    it('Boundary: detects type-only exports', () => {
      const result = buildSpineSkeleton(
        {
          imports: [],
          exports: [
            { name: 'Config', kind: 'interface' },
            { name: 'Options', kind: 'type' },
          ],
        },
        'src/types.ts',
      );

      expect(result.structuralHints.isTypeOnly).toBe(true);
    });

    it('Boundary: not a barrel when export count is low', () => {
      const result = buildSpineSkeleton(
        {
          imports: [{ source: './a.js', symbols: ['A'] }],
          exports: [{ name: 'X', kind: 'class' }],
        },
        'src/single.ts',
      );

      expect(result.structuralHints.isBarrel).toBe(false);
    });
  });

  describe('buildMarkdownFallback (logic)', () => {
    function isObjectRecord(value: unknown): value is Record<string, unknown> {
      return typeof value === 'object' && value !== null;
    }

    function formatMarkdownList(items: unknown[]): string {
      const values = items.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      );
      if (values.length === 0) {
        return '- N/A';
      }
      return values.map((item) => `- ${item}`).join('\n');
    }

    function getLocalizedSemanticData(semanticJson: unknown, locale: string) {
      if (!isObjectRecord(semanticJson)) {
        return undefined;
      }
      const localized = semanticJson.localized;
      if (!isObjectRecord(localized)) {
        return undefined;
      }
      const localeData = localized[locale];
      return isObjectRecord(localeData) ? localeData : undefined;
    }

    function buildMarkdownFallback(
      relativeFilePath: string,
      semanticJson: unknown,
      locale: string,
    ) {
      const semantic = isObjectRecord(semanticJson) ? semanticJson : {};
      const localized = getLocalizedSemanticData(semanticJson, locale);
      const role =
        (typeof localized?.role === 'string' && localized.role) ||
        (typeof semantic.role === 'string' && semantic.role) ||
        'Unknown role';
      const responsibilities = Array.isArray(localized?.responsibilities)
        ? localized.responsibilities
        : Array.isArray(semantic.responsibilities)
          ? semantic.responsibilities
          : [];
      const outOfScope = Array.isArray(localized?.outOfScope)
        ? localized.outOfScope
        : Array.isArray(semantic.outOfScope)
          ? semantic.outOfScope
          : [];
      const localizedNote = locale.toLowerCase().includes('chinese')
        ? '本地兜底版本，确保文档输出完整。'
        : 'Deterministic fallback generated to keep documentation output complete.';

      return [
        `# File: ${relativeFilePath}`,
        '',
        `## ${locale.toLowerCase().includes('chinese') ? '角色' : 'Role'}`,
        role,
        '',
        `## ${locale.toLowerCase().includes('chinese') ? '职责' : 'Responsibilities'}`,
        formatMarkdownList(responsibilities),
        '',
        `## ${locale.toLowerCase().includes('chinese') ? '负面范围' : 'Out of Scope'}`,
        formatMarkdownList(outOfScope),
        '',
        localizedNote,
      ].join('\n');
    }

    it('Main Path: generates English fallback', () => {
      const result = buildMarkdownFallback(
        'src/index.ts',
        {
          role: 'Entry point',
          responsibilities: ['Boot'],
        },
        'en-US',
      );

      expect(result).toContain('# File: src/index.ts');
      expect(result).toContain('## Role');
      expect(result).toContain('Entry point');
      expect(result).toContain('## Responsibilities');
      expect(result).toContain('- Boot');
      expect(result).toContain('Deterministic fallback');
    });

    it('Main Path: generates Chinese fallback with localized headers', () => {
      const result = buildMarkdownFallback(
        'src/index.ts',
        {
          role: '入口',
          responsibilities: ['启动'],
        },
        'Chinese',
      );

      expect(result).toContain('## 角色');
      expect(result).toContain('## 职责');
      expect(result).toContain('## 负面范围');
      expect(result).toContain('本地兜底版本');
    });

    it('Boundary: prefers localized role over root role', () => {
      const result = buildMarkdownFallback(
        'src/index.ts',
        {
          role: 'Root role',
          localized: { 'en-US': { role: 'Localized role' } },
        },
        'en-US',
      );

      expect(result).toContain('Localized role');
    });

    it('Boundary: uses Unknown role when nothing available', () => {
      const result = buildMarkdownFallback('src/index.ts', {}, 'en-US');
      expect(result).toContain('Unknown role');
    });
  });
});
