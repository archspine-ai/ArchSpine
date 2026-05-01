import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Manifest } from '../src/infra/manifest.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Minimal mock for SpineDB to allow unit testing Manifest behavior without real SQLite
const mockSpineDB = {
  getGlobalStatus: vi.fn(),
  getFileStatus: vi.fn(),
  ensureFileRecord: vi.fn(),
  updateFileStatus: vi.fn(),
  updateFileStatusWithDocs: vi.fn(),
  commitBatch: vi.fn(),
  getFileDocs: vi.fn(),
  getTrackedFiles: vi.fn(),
  getDriftHistory: vi.fn(),
  deleteFile: vi.fn(),
  addFileExports: vi.fn(),
  clearFileExports: vi.fn(),
  resolveSymbol: vi.fn(),
  getActiveViolations: vi.fn(),
  recordViolation: vi.fn(),
  clearViolations: vi.fn(),
  recordUsage: vi.fn(),
  getTotalUsage: vi.fn(),
  getUsageSummary: vi.fn(),
};

vi.mock('../src/infra/db.js', () => {
  return {
    SpineDB: vi.fn().mockImplementation(function () {
      return mockSpineDB;
    }),
  };
});

describe('Manifest', () => {
  let tmpDir: string;
  let spineDir: string;
  let manifestPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-manifest-test-'));
    spineDir = path.join(tmpDir, '.spine');
    fs.mkdirSync(spineDir, { recursive: true });
    manifestPath = path.join(spineDir, 'manifest.json');

    // Clear mocks
    Object.values(mockSpineDB).forEach((m) => m.mockClear());
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('Main Path: should correctly interpret virgin state when DB says 0 files', () => {
    mockSpineDB.getGlobalStatus.mockReturnValue({ totalFiles: 0 });
    const manifest = Manifest.open(tmpDir);
    expect(manifest.isVirginState()).toBe(true);
  });

  it('Main Path: should not be virgin state when sync is complete', () => {
    mockSpineDB.getGlobalStatus.mockReturnValue({ totalFiles: 10 });
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        sync: { lastSyncAt: '2023-01-01T00:00:00Z' },
      }),
    );

    const manifest = Manifest.open(tmpDir);
    expect(manifest.isVirginState()).toBe(false);
  });

  it('Main Path: save function writes manifest data correctly', () => {
    mockSpineDB.getGlobalStatus.mockReturnValue({ totalFiles: 5 });
    mockSpineDB.getActiveViolations.mockReturnValue([]);

    const manifest = Manifest.open(tmpDir);
    manifest.save('full', 1500, { provider: { value: 'openai', source: 'config' } });

    expect(fs.existsSync(manifestPath)).toBe(true);
    const writtenData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(writtenData.sync.lastSyncMode).toBe('full');
    expect(writtenData.sync.llm.provider).toBe('openai');
    expect(writtenData.health.lastSyncDurationMs).toBe(1500);
  });

  it('Boundary/Exception: handle broken manifest file with warnings', () => {
    mockSpineDB.getGlobalStatus.mockReturnValue({ totalFiles: 10 });
    fs.writeFileSync(manifestPath, '{ broken_json');

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const manifest = Manifest.open(tmpDir);
    expect(manifest.isVirginState()).toBe(true); // Should fallback to virgin state implicitly if parse fails
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('Boundary/Exception: calculateHash fails gracefully if file is missing', () => {
    const manifest = Manifest.open(tmpDir);

    expect(() => {
      manifest.calculateHash(path.join(tmpDir, 'non-existent.ts'));
    }).toThrow('File not found for hashing');
  });

  it('Boundary/Exception: calculateHash rejects directories explicitly', () => {
    const dirPath = path.join(tmpDir, 'vibe-coding-cn');
    fs.mkdirSync(dirPath, { recursive: true });

    const manifest = Manifest.open(tmpDir);

    expect(() => {
      manifest.calculateHash(dirPath);
    }).toThrow('Only regular files can be hashed');
  });

  it('Boundary/Exception: calculateHash returns DB cache if mtime matches', () => {
    const filePath = path.join(tmpDir, 'some-file.ts');
    fs.writeFileSync(filePath, 'random content');
    const stat = fs.statSync(filePath);

    mockSpineDB.getFileStatus.mockReturnValue({
      mtime: Math.floor(stat.mtimeMs),
      size: stat.size,
      hash: 'cached-hash',
    });

    const manifest = Manifest.open(tmpDir);
    const hash = manifest.calculateHash(filePath);

    expect(hash).toBe('cached-hash');
  });
});
