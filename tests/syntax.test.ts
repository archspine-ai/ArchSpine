import { describe, it, expect } from 'vitest';
import { FixTask } from '../src/tasks/fix.js';

describe('Testing FixTask Syntax Guardrail', () => {
  it('Valid and Invalid TS Check', async () => {
    const fixTask = new (FixTask as any)();

    const validTS = `
      import { x } from 'y';
      export const a = 1;
    `;

    const invalidTS = `
      import { x } from 'y'
      export const a = ; // Syntax Error
    `;

    const isValid = await fixTask.validateSyntax('test.ts', validTS);
    const isInvalid = await fixTask.validateSyntax('test.ts', invalidTS);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });
});
