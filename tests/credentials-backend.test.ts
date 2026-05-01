import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('WindowsDPAPIBackend', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.doUnmock('child_process');
    delete process.env.LOCALAPPDATA;
  });

  it('passes secrets through stdin instead of interpolating them into PowerShell', async () => {
    const execFileSync = vi.fn(() => 'ciphertext');
    vi.doMock('child_process', () => ({ execFileSync }));

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-dpapi-'));
    process.env.LOCALAPPDATA = tempRoot;

    try {
      const { WindowsDPAPIBackend } = await import('../src/infra/credentials/backend.js');
      const backend = new WindowsDPAPIBackend();
      const secret = "line1'; Write-Host hacked; 'line2";

      backend.set('io.archspine.llm.project', 'account', secret);

      expect(execFileSync).toHaveBeenCalledTimes(1);
      expect(execFileSync.mock.calls[0]?.[0]).toBe('powershell');
      expect(execFileSync.mock.calls[0]?.[1]).toEqual([
        '-NoProfile',
        '-Command',
        expect.stringContaining('[Console]::In.ReadToEnd()'),
      ]);
      expect(execFileSync.mock.calls[0]?.[2]).toMatchObject({
        input: secret,
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      expect(String(execFileSync.mock.calls[0]?.[1]?.[2])).not.toContain(secret);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
