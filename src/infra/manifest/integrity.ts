import * as fs from 'fs';
import * as crypto from 'crypto';
import { normalizeRepoPath } from '../../utils/repo-path.js';
import { SpineDB } from '../db.js';

export function calculateHash(db: SpineDB, filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found for hashing: ${filePath}`);
  }
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    throw new Error(`Only regular files can be hashed: ${filePath}`);
  }
  const normalizedPath = normalizeRepoPath(filePath);
  const status = db.getFileStatus(normalizedPath);

  if (status && status.mtime === Math.floor(stat.mtimeMs) && status.size === stat.size) {
    return status.hash;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}
