import { afterEach, describe, expect, it } from 'vitest';
import * as os from 'os';
import * as path from 'path';

// We test getGlobalArchSpineDir indirectly by testing its logic branches.
// The function lives in src/infra/llm/global.ts but is re-exported through the
// LLM facade. We test the internal logic via environment variable manipulation.
import { getGlobalArchSpineDir } from '../../../src/infra/llm/global.js';

describe('getGlobalArchSpineDir', () => {
  const savedPlatform = process.platform;
  const savedEnv = { ...process.env };

  afterEach(() => {
    // Restore platform and env after each test
    Object.defineProperty(process, 'platform', { value: savedPlatform });
    process.env = { ...savedEnv };
  });

  describe('Unix (macOS / Linux)', () => {
    it('returns XDG_CONFIG_HOME if set', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      process.env.XDG_CONFIG_HOME = '/custom/xdg/config';
      delete process.env.APPDATA;

      const result = getGlobalArchSpineDir();
      expect(result).toBe(path.join('/custom', 'xdg', 'config', 'archspine'));
    });

    it('falls back to ~/.config/archspine when XDG_CONFIG_HOME is unset', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      delete process.env.XDG_CONFIG_HOME;
      delete process.env.APPDATA;

      const result = getGlobalArchSpineDir();
      expect(result).toBe(path.join(os.homedir(), '.config', 'archspine'));
    });

    it('falls back to ~/.config/archspine when XDG_CONFIG_HOME is empty', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      process.env.XDG_CONFIG_HOME = '';
      delete process.env.APPDATA;

      const result = getGlobalArchSpineDir();
      expect(result).toBe(path.join(os.homedir(), '.config', 'archspine'));
    });

    it('falls back to ~/.config/archspine when XDG_CONFIG_HOME is whitespace', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      process.env.XDG_CONFIG_HOME = '   ';
      delete process.env.APPDATA;

      const result = getGlobalArchSpineDir();
      expect(result).toBe(path.join(os.homedir(), '.config', 'archspine'));
    });
  });

  describe('Windows (win32)', () => {
    it('returns %APPDATA%/archspine when APPDATA is set', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming';
      process.env.XDG_CONFIG_HOME = '/custom/xdg/config'; // Should be ignored on Windows

      const result = getGlobalArchSpineDir();
      expect(result).toBe(path.join('C:\\Users\\test\\AppData\\Roaming', 'archspine'));
    });

    it('falls back to homedir construction when APPDATA is empty', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      process.env.APPDATA = '';
      delete process.env.XDG_CONFIG_HOME;

      const result = getGlobalArchSpineDir();
      expect(result).toBe(path.join(os.homedir(), 'AppData', 'Roaming', 'archspine'));
    });

    it('falls back to homedir construction when APPDATA is whitespace', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      process.env.APPDATA = '  ';
      delete process.env.XDG_CONFIG_HOME;

      const result = getGlobalArchSpineDir();
      expect(result).toBe(path.join(os.homedir(), 'AppData', 'Roaming', 'archspine'));
    });

    it('falls back to homedir construction when APPDATA is unset', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      delete process.env.APPDATA;
      delete process.env.XDG_CONFIG_HOME;

      const result = getGlobalArchSpineDir();
      expect(result).toBe(path.join(os.homedir(), 'AppData', 'Roaming', 'archspine'));
    });
  });
});
