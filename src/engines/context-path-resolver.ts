import * as fs from 'fs';
import * as path from 'path';
import { LangRegistry } from '../ast/lang-registry.js';

export function resolveRelativeImportTarget(
  rootDir: string,
  dir: string,
  source: string,
): string | null {
  if (!source.startsWith('.')) {
    return null;
  }

  const fullPath = path.join(rootDir, dir, source);
  const exts = LangRegistry.getSourceExtensions();

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return path.relative(rootDir, fullPath);
  }

  for (const ext of exts) {
    const candidatePath = fullPath + ext;
    if (fs.existsSync(candidatePath)) {
      return path.relative(rootDir, candidatePath);
    }
  }

  for (const ext of exts) {
    const candidatePath = path.join(fullPath, 'index' + ext);
    if (fs.existsSync(candidatePath)) {
      return path.relative(rootDir, candidatePath);
    }
  }

  return null;
}
