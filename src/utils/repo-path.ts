/**
 * RepoPath — ArchSpine internal path normalization standard.
 *
 * Enforces repo-relative logical paths with POSIX separators so every
 * database lookup and write uses the same primary key representation.
 */
export function normalizeRepoPath(rawPath: string): string {
  return rawPath.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '');
}
